import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole, SeekerProfile, OwnerProfile, BrokerProfile } from '../models';
import { sendOtpEmail, sendWelcomeEmail } from './email.service';
import { NotificationService } from './notification.service';
import { CustomError } from '../middlewares/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'shelta_x_super_secret_jwt_access_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'shelta_x_super_secret_jwt_refresh_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const OTP_EXPIRATION_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

export interface SignupInput {
  role?: UserRole;
  firstName: string;
  surname: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  ninVerification?: string;
  brokerProfileType?: string;
  yearsOfExperience?: number;
  bio?: string;
  specialization?: string;
}

export interface TokensResult {
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  private static generate6DigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static async hashText(text: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(text, salt);
  }

  private static async compareText(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }

  public static generateTokens(user: User): TokensResult {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
    const refreshOptions: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as unknown as SignOptions['expiresIn'] };

    const access_token = jwt.sign(payload, JWT_SECRET, accessOptions);
    const refresh_token = jwt.sign(payload, JWT_REFRESH_SECRET, refreshOptions);

    return { access_token, refresh_token };
  }

  public static async signup(input: SignupInput): Promise<{ message: string; email: string }> {
    const email = input.email.toLowerCase().trim();

    let user = await User.findOne({ where: { email } });

    if (user && user.isVerified) {
      const err: CustomError = new Error('An account with this email address already exists.');
      err.statusCode = 400;
      throw err;
    }

    const otpCode = this.generate6DigitOtp();
    const otpHash = await this.hashText(otpCode);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
    const otpLastSentAt = new Date();

    const hashedPassword = input.password ? await this.hashText(input.password) : null;
    const userRole = input.role || 'user';

    if (user && !user.isVerified) {
      user.firstName = input.firstName;
      user.surname = input.surname;
      user.role = userRole;
      if (hashedPassword) user.password = hashedPassword;
      user.phoneNumber = input.phoneNumber || user.phoneNumber;
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      user.otpLastSentAt = otpLastSentAt;
      await user.save();
    } else {
      user = await User.create({
        email,
        firstName: input.firstName,
        surname: input.surname,
        role: userRole,
        kycLevel: 'BASIC',
        password: hashedPassword,
        phoneNumber: input.phoneNumber || null,
        isVerified: false,
        otpHash,
        otpExpiresAt,
        otpLastSentAt,
      });

      // Create initial SeekerProfile for every user account by default
      await SeekerProfile.create({ userId: user.id, ninVerification: input.ninVerification });

      if (input.role === 'owner') {
        await OwnerProfile.create({ userId: user.id });
      } else if (input.role === 'broker') {
        await BrokerProfile.create({
          userId: user.id,
          brokerProfileType: input.brokerProfileType,
          yearsOfExperience: input.yearsOfExperience,
          bio: input.bio,
          specialization: input.specialization,
        });
      }
    }

    await sendOtpEmail(user.email, otpCode, user.firstName);

    return {
      message: 'Registration started. Verification code sent to your email address.',
      email: user.email,
    };
  }

  public static async verifyOtp(code: string, email?: string): Promise<{
    message: string;
    email: string;
    access_token?: string;
    refresh_token?: string;
    role?: UserRole;
    verification?: boolean;
    id?: string;
  }> {
    let user: User | null = null;

    if (email) {
      user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    } else {
      const candidates = await User.findAll({ where: { isVerified: false } });
      for (const candidate of candidates) {
        if (candidate.otpHash && (await this.compareText(code, candidate.otpHash))) {
          user = candidate;
          break;
        }
      }
    }

    if (!user) {
      const err: CustomError = new Error('Invalid or expired verification code.');
      err.statusCode = 400;
      throw err;
    }

    if (!user.otpHash || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      const err: CustomError = new Error('Verification code has expired. Please request a new code.');
      err.statusCode = 400;
      throw err;
    }

    const isValid = await this.compareText(code, user.otpHash);
    if (!isValid) {
      const err: CustomError = new Error('Invalid 6-digit verification code.');
      err.statusCode = 400;
      throw err;
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;

    // Ensure seeker profile exists
    const seekerProfile = await SeekerProfile.findOne({ where: { userId: user.id } });
    if (!seekerProfile) {
      await SeekerProfile.create({ userId: user.id });
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refresh_token;
    await user.save();

    // Trigger In-App Notification & Welcome Email asynchronously
    NotificationService.createNotification({
      userId: user.id,
      title: 'Welcome to Shelta-X! 🎉',
      message: `Your ${user.role.toUpperCase()} account has been verified and is ready to use. Explore properties and complete your profile.`,
      type: 'REGISTRATION',
      link: user.role === 'owner' ? '/owner' : '/profile',
    }).catch((err) => console.error('Notification error:', err));

    sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    }).catch((err) => console.error('Welcome email error:', err));

    return {
      message: 'Email verified successfully and sign-up complete.',
      email: user.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: user.role,
      verification: user.isVerified,
      id: user.id,
    };
  }

  public static async resendVerification(emailInput: string): Promise<{ message: string }> {
    const email = emailInput.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const err: CustomError = new Error('No user account found with this email.');
      err.statusCode = 404;
      throw err;
    }

    if (user.isVerified) {
      const err: CustomError = new Error('Account is already verified. Please sign in.');
      err.statusCode = 400;
      throw err;
    }

    if (user.otpLastSentAt) {
      const secondsSinceLastSent = (Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < OTP_RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSent);
        const err: CustomError = new Error(`Please wait ${remaining} seconds before requesting another code.`);
        err.statusCode = 429;
        throw err;
      }
    }

    const otpCode = this.generate6DigitOtp();
    user.otpHash = await this.hashText(otpCode);
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
    user.otpLastSentAt = new Date();
    await user.save();

    await sendOtpEmail(user.email, otpCode, user.firstName);

    return { message: 'A new verification code has been sent to your email.' };
  }

  public static async setPassword(emailInput: string, password: string): Promise<{
    message: string;
    access_token: string;
    refresh_token: string;
    role: UserRole;
    verification: boolean;
    id: string;
  }> {
    const email = emailInput.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const err: CustomError = new Error('User account not found.');
      err.statusCode = 404;
      throw err;
    }

    const hashedPassword = await this.hashText(password);
    user.password = hashedPassword;
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refresh_token;
    await user.save();

    return {
      message: 'Password set successfully and registration complete.',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: user.role,
      verification: user.isVerified,
      id: user.id,
    };
  }

  public static async login(identifierInput: string, passwordInput?: string): Promise<{
    message: string;
    access_token: string;
    refresh_token: string;
    role: UserRole;
    verification: boolean;
    id: string;
  }> {
    const identifier = identifierInput.toLowerCase().trim();
    const user = await User.findOne({ where: { email: identifier } });

    if (!user) {
      const err: CustomError = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    if (!user.isVerified) {
      const err: CustomError = new Error('Account email is not verified. Please verify your OTP first.');
      err.statusCode = 403;
      throw err;
    }

    if (!passwordInput || !user.password) {
      const err: CustomError = new Error('Password is required to sign in.');
      err.statusCode = 400;
      throw err;
    }

    const isPasswordMatch = await this.compareText(passwordInput, user.password);
    if (!isPasswordMatch) {
      const err: CustomError = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refresh_token;
    await user.save();

    return {
      message: 'Signed in successfully.',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: user.role,
      verification: user.isVerified,
      id: user.id,
    };
  }

  public static async getUserById(userId: string): Promise<User | null> {
    return User.findByPk(userId, {
      attributes: { exclude: ['password', 'otpHash', 'refreshToken'] },
      include: [
        { model: SeekerProfile, as: 'seekerProfile' },
        { model: OwnerProfile, as: 'ownerProfile' },
        { model: BrokerProfile, as: 'brokerProfile' },
      ],
    });
  }

  public static async completeOwnerProfile(input: {
    email: string;
    location?: string;
    propertyTypes?: string;
    listingIntent?: string;
    ownerType?: string;
  }): Promise<{ message: string }> {
    const email = input.email ? input.email.toLowerCase().trim() : '';
    if (!email) {
      const err: CustomError = new Error('Email address is required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err: CustomError = new Error('User account not found.');
      err.statusCode = 404;
      throw err;
    }

    let [profile] = await OwnerProfile.findOrCreate({
      where: { userId: user.id },
      defaults: { userId: user.id },
    });

    if (input.location) profile.location = input.location;
    if (input.propertyTypes) profile.propertyTypes = input.propertyTypes;
    if (input.listingIntent) profile.listingIntent = input.listingIntent;
    if (input.ownerType) profile.ownerType = input.ownerType;

    await profile.save();
    return { message: 'Owner profile details updated successfully.' };
  }

  public static async verifyIdentity(input: {
    email: string;
    profilePictureUrl?: string;
    governmentIdUrl?: string;
    ninCacDocumentUrl?: string;
  }): Promise<{ message: string }> {
    const email = input.email ? input.email.toLowerCase().trim() : '';
    if (!email) {
      const err: CustomError = new Error('Email address is required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err: CustomError = new Error('User account not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'owner') {
      let [profile] = await OwnerProfile.findOrCreate({
        where: { userId: user.id },
        defaults: { userId: user.id },
      });
      if (input.profilePictureUrl) profile.profilePictureUrl = input.profilePictureUrl;
      if (input.governmentIdUrl) profile.governmentIdUrl = input.governmentIdUrl;
      if (input.ninCacDocumentUrl) profile.ninCacDocumentUrl = input.ninCacDocumentUrl;
      await profile.save();
    } else if (user.role === 'broker') {
      let [profile] = await BrokerProfile.findOrCreate({
        where: { userId: user.id },
        defaults: { userId: user.id },
      });
      if (input.profilePictureUrl) profile.profilePictureUrl = input.profilePictureUrl;
      if (input.governmentIdUrl) profile.governmentIdUrl = input.governmentIdUrl;
      if (input.ninCacDocumentUrl) profile.ninCacDocumentUrl = input.ninCacDocumentUrl;
      await profile.save();
    }

    return { message: 'Identity verification documents uploaded successfully.' };
  }
}
