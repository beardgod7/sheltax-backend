import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsersWithProfiles,
  findOrCreateGoogleUser,
  findOrCreateTwitterUser,
  findOrCreateFacebookUser,
} from './repository';
import Userhash from '../../utils/bcrypt';
import {
  signupSchema,
  setPasswordSchema,
  completeOwnerProfileSchema,
  completeBrokerProfileSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  googleOAuthSchema,
  twitterOAuthSchema,
  facebookOAuthSchema,
} from './schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import crypto from 'crypto';
import { Session } from '../Session/model';
import {
  generateAccessToken,
  generateRefreshToken,
  getJwtSecret,
} from '../../utils/generatetoken';
import {
  sendVerificationCodeEmail,
  sendResetCodeEmail,
} from '../../service/emailservice';
import { generateSecureOtp } from '../../utils/otp';
import { User, Token } from './model';
import { getPagination, paginatedData } from '../../utils/pagination';

export const getUsersById = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const user = await findUserById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error(`Error fetching user by ID: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export async function signup(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await signupSchema.validateAsync(req.body);

    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      res.status(409).json({ message: 'Account already exists!' });
      return;
    }

    const newUserData = {
      email: validatedData.email.toLowerCase(),
      role: validatedData.role || 'seeker',
      firstName: validatedData.firstName,
      surname: validatedData.surname,
      phoneNumber: validatedData.phoneNumber,
      ninVerification: validatedData.ninVerification || null,
      brokerProfileType: validatedData.brokerProfileType || null,
      yearsOfExperience: validatedData.yearsOfExperience || null,
      bio: validatedData.bio || null,
      specialization: validatedData.specialization || null,
      signup_channel: 'manual',
    };

    const newUser = await createUser(newUserData);

    const verificationCode = generateSecureOtp();

    await Token.create({
      userId: newUser.id,
      token: verificationCode,
      token_type: 'verify_account',
      expiresIn: new Date(Date.now() + 300000),
    });

    try {
      await sendVerificationCodeEmail(newUser.email, verificationCode);
    } catch (emailErr) {
      console.error('Email sending failed: ', emailErr);
    }

    res.status(201).json({
      message: 'Account created successfully! Please check your email to verify your account.',
      userId: newUser.id,
      nextStep: 'verify-otp',
    });
  } catch (err: any) {
    console.error('Signup Error: ', err);
    if (err.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: err.details.map((d: any) => d.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}

export async function setPassword(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await setPasswordSchema.validateAsync(req.body);

    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (!user.verified) {
      res.status(403).json({
        message: 'Account not verified. Please verify your email first.',
      });
      return;
    }

    let setupClaims: any;
    try {
      setupClaims = jwt.verify(validatedData.setupToken, process.env.JWT_SECRET || 'secret');
    } catch {
      res.status(401).json({ message: 'Password setup session is invalid or expired.' });
      return;
    }
    if (setupClaims.scope !== 'password_setup' || setupClaims.id !== user.id) {
      res.status(401).json({ message: 'Password setup session is invalid.' });
      return;
    }

    if (user.password) {
      res.status(400).json({
        message: 'Password has already been set. Use forgot-password to reset.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    user.password = hashedPassword;
    await user.save();

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken: any = jwt.verify(refreshTokenValue, process.env.JWT_SECRET || 'secret');

    let tokenRecord: any = await Token.findOne({
      where: { userId: user.id, token_type: 'refresh_token' },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: 'refresh_token',
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    res.status(200).json({
      message: 'Password set successfully. You are now logged in.',
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
    });
  } catch (err: any) {
    console.error('Set Password Error: ', err);
    if (err.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: err.details.map((d: any) => d.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}

export async function completeProfile(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const authenticatedUserId = reqUser?.sub || reqUser?.id;
    const { email } = req.body;

    let user: any;
    if (authenticatedUserId) {
      user = await User.findByPk(authenticatedUserId);
      if (email && user && user.email.toLowerCase() !== email.toLowerCase()) {
        res.status(403).json({ message: 'Forbidden: You cannot modify another user profile.' });
        return;
      }
    } else {
      if (!email) {
        res.status(400).json({ message: 'Email is required.' });
        return;
      }
      user = await findUserByEmail(email);
    }

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    let validatedData: any;
    if (user.role === 'owner') {
      validatedData = await completeOwnerProfileSchema.validateAsync(req.body);
      user.location = validatedData.location;
      user.propertyTypes = validatedData.propertyTypes;
      user.listingIntent = validatedData.listingIntent;
      user.ownerType = validatedData.ownerType;
    } else if (user.role === 'broker') {
      validatedData = await completeBrokerProfileSchema.validateAsync(req.body);
      user.agencyCompanyName = validatedData.agencyCompanyName || null;
      user.companyYearsOfExistence = validatedData.companyYearsOfExistence || null;
      user.operatingLocations = validatedData.operatingLocations;
      user.companySize = validatedData.companySize || null;
      user.portfolioSummary = validatedData.portfolioSummary || null;
    } else {
      res.status(400).json({ message: 'This step is only for owner or broker roles.' });
      return;
    }

    user.registrationStep = 2;
    await user.save();

    res.status(200).json({
      message: 'Profile information saved successfully.',
      registrationStep: 2,
    });
  } catch (err: any) {
    console.error('Complete Profile Error: ', err);
    if (err.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: err.details.map((d: any) => d.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}

export async function verifyIdentity(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const authenticatedUserId = reqUser?.sub || reqUser?.id;
    const { email } = req.body;

    let user: any;
    if (authenticatedUserId) {
      user = await User.findByPk(authenticatedUserId);
      if (email && user && user.email.toLowerCase() !== email.toLowerCase()) {
        res.status(403).json({ message: 'Forbidden: You cannot verify identity for another user.' });
        return;
      }
    } else {
      if (!email) {
        res.status(400).json({ message: 'Email is required.' });
        return;
      }
      user = await findUserByEmail(email);
    }

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.role !== 'owner' && user.role !== 'broker') {
      res.status(400).json({ message: 'This step is only for owner or broker roles.' });
      return;
    }

    const reqFiles = (req as any).files;
    if (reqFiles) {
      if (reqFiles.profilePicture && reqFiles.profilePicture[0]) {
        user.profilePicture = reqFiles.profilePicture[0].path;
      }
      if (reqFiles.governmentId && reqFiles.governmentId[0]) {
        user.governmentId = reqFiles.governmentId[0].path;
      }
      if (reqFiles.ninCacDocument && reqFiles.ninCacDocument[0]) {
        user.ninCacDocument = reqFiles.ninCacDocument[0].path;
      }
    }

    user.registrationStep = 3;
    await user.save();

    const verificationCode = generateSecureOtp();

    await Token.destroy({ where: { userId: user.id, token_type: 'verify_account' } });
    await Token.create({
      userId: user.id,
      token: verificationCode,
      token_type: 'verify_account',
      expiresIn: new Date(Date.now() + 300000),
    });

    try {
      await sendVerificationCodeEmail(user.email, verificationCode);
    } catch (emailErr) {
      console.error('Email sending failed: ', emailErr);
    }

    res.status(200).json({
      message: 'Identity documents uploaded successfully. OTP sent to your email.',
      registrationStep: 3,
    });
  } catch (err: any) {
    console.error('Verify Identity Error: ', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}

export async function AdminSignup(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    req.body.role = 'admin';
    return signup(req, res, next);
  } catch (err: any) {
    console.error('Error in Admin signup:', err);
    res.status(400).json({ message: 'Error in Admin signup', error: err.message });
  }
}

export async function verifyEmail(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    let code = req.params.code || req.body?.code || req.body?.otp;
    const email = req.body?.email || req.query?.email;

    if (typeof code === 'string') {
      code = code.replace(/^:/, '').trim();
    }

    if (!code) {
      res.status(400).json({ message: 'Verification code is required.' });
      return;
    }

    if (!email) {
      res.status(400).json({ message: 'Email address is required for verification.' });
      return;
    }

    const userByEmail = await findUserByEmail(email);
    if (!userByEmail) {
      res.status(400).json({ message: 'Invalid or expired verification code.' });
      return;
    }

    const tokenRecord: any = await Token.findOne({
      where: { userId: userByEmail.id, token: code, token_type: 'verify_account' },
    });

    if (!tokenRecord) {
      res.status(400).json({ message: 'Invalid or expired verification code.' });
      return;
    }

    if (new Date(tokenRecord.expiresIn).getTime() < Date.now()) {
      res.status(400).json({ message: 'Verification code has expired.' });
      return;
    }

    const user = await User.findByPk(tokenRecord.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    user.verified = true;
    await user.save();

    await Token.destroy({ where: { token: code } });

    res.status(200).json({
      message: 'Account verified. Set your password to complete registration.',
      setupToken: jwt.sign(
        { id: user.id, scope: 'password_setup' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '10m' }
      ),
      email: user.email,
      role: user.role,
      verification: true,
      id: user.id,
    });
  } catch (error: any) {
    console.error('Verification Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function resendVerificationCode(req: Request, res: Response): Promise<void> {
  try {
    await resendVerificationSchema.validateAsync(req.body);
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.verified) {
      res.status(400).json({ message: 'User is already verified.' });
      return;
    }

    await Token.destroy({
      where: {
        userId: user.id,
        token_type: 'verify_account',
      },
    });

    const verificationCode = generateSecureOtp();

    await Token.create({
      userId: user.id,
      token: verificationCode,
      token_type: 'verify_account',
      expiresIn: new Date(Date.now() + 300000),
    });

    await sendVerificationCodeEmail(user.email, verificationCode);

    res.status(200).json({ message: 'Verification code sent successfully.' });
  } catch (error: any) {
    console.error('Error resending verification code:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function login(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await signinSchema.validateAsync(req.body);
    let identifier = validatedData.identifier || validatedData.email;
    const { password } = validatedData;

    const isEmail = identifier.includes('@');
    if (isEmail) {
      identifier = identifier.toLowerCase();
    }

    const user: any = isEmail
      ? await findUserByEmail(identifier)
      : await User.findOne({ where: { username: identifier } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    if (user.accountStatus && user.accountStatus !== 'ACTIVE') {
      res.status(403).json({ message: 'Account is suspended or restricted.' });
      return;
    }

    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      res.status(429).json({
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.',
      });
      return;
    }

    if (!user.password) {
      res.status(403).json({
        message: 'Password not set. Please complete your registration by setting a password.',
      });
      return;
    }

    if (!user.verified) {
      const verificationCode = generateSecureOtp();

      await Token.destroy({
        where: { userId: user.id, token_type: 'verify_account' },
      });

      await Token.create({
        userId: user.id,
        token: verificationCode,
        token_type: 'verify_account',
        expiresIn: new Date(Date.now() + 300000),
      });

      await sendVerificationCodeEmail(user.email, verificationCode);

      res.status(403).json({
        message: 'Account not verified. A new verification code has been sent to your email address.',
      });
      return;
    }

    const isMatch = await Userhash.comparePassword(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = attempts;
      if (attempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);
    const Role = user.role;
    const verify = user.verified;

    const decodedRefreshToken: any = jwt.verify(refreshTokenValue, getJwtSecret());
    let tokenRecord: any = await Token.findOne({
      where: { userId: user.id, token_type: 'refresh_token' },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: 'refresh_token',
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const session: any = await Session.create({
      userId: user.id,
      refreshTokenHash,
      deviceInfo,
      ipAddress,
      lastActiveAt: new Date(),
    });

    res.status(200).json({
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      sessionId: session.id,
      role: Role,
      verification: verify,
      id: user.id,
    });
  } catch (error: any) {
    console.error('Login Error: ', error);
    if (next) next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
    const existingSession: any = await Session.findOne({
      where: { refreshTokenHash: tokenHash },
    });

    if (existingSession && existingSession.revokedAt) {
      await Session.update(
        { revokedAt: new Date() },
        { where: { userId: existingSession.userId, revokedAt: null } }
      );
      res.status(403).json({
        message: 'Security Alert: Revoked refresh token reused. All active sessions have been invalidated.',
      });
      return;
    }

    const storedToken: any = await Token.findOne({
      where: { token: refresh_token, token_type: 'refresh_token' },
    });

    if (!storedToken || new Date(storedToken.expiresIn).getTime() < Date.now()) {
      res.status(403).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const decoded: any = jwt.verify(refresh_token, getJwtSecret());

    const refreshUser: any = await User.findByPk(decoded.sub);
    if (!refreshUser || (refreshUser.accountStatus && refreshUser.accountStatus !== 'ACTIVE')) {
      res.status(403).json({ message: 'Invalid or restricted user.' });
      return;
    }

    const newAccessToken = generateAccessToken(refreshUser.id, refreshUser.role);
    const newRefreshToken = generateRefreshToken(decoded.sub);
    const newDecodedRefreshToken: any = jwt.verify(newRefreshToken, getJwtSecret());
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    storedToken.token = newRefreshToken;
    storedToken.expiresIn = new Date(newDecodedRefreshToken.exp * 1000);
    await storedToken.save();

    if (existingSession) {
      existingSession.refreshTokenHash = newTokenHash;
      existingSession.lastActiveAt = new Date();
      await existingSession.save();
    } else {
      await Session.create({
        userId: refreshUser.id,
        refreshTokenHash: newTokenHash,
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        lastActiveAt: new Date(),
      });
    }

    res.status(200).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function logout(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ message: 'Refresh token is missing.' });
      return;
    }

    const deletedToken = await Token.destroy({
      where: { token: refresh_token, token_type: 'refresh_token' },
    });

    if (!deletedToken) {
      res.status(400).json({ message: 'Invalid or non-existent refresh token.' });
      return;
    }

    res.status(200).json({ message: 'Logout successful. Refresh token invalidated.' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function forgotPassword(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await forgotPasswordSchema.validateAsync(req.body);

    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      res.status(404).json({ message: 'No user found with this email address.' });
      return;
    }

    const resetCode = generateSecureOtp();

    await Token.destroy({
      where: { userId: user.id, token_type: 'reset_password' },
    });

    await Token.create({
      userId: user.id,
      token: resetCode,
      token_type: 'reset_password',
      expiresIn: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendResetCodeEmail(user.email, resetCode);

    res.status(200).json({
      message: 'A reset code has been sent to your email. It is valid for 5 minutes.',
    });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function resetPassword(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await resetPasswordSchema.validateAsync(req.body);

    let whereClause: any = { token: validatedData.token, token_type: 'reset_password' };

    if (validatedData.email) {
      const targetUser = await findUserByEmail(validatedData.email);
      if (!targetUser) {
        res.status(400).json({ message: 'Invalid or expired token.' });
        return;
      }
      whereClause.userId = targetUser.id;
    }

    const tokenRecord: any = await Token.findOne({ where: whereClause });

    if (!tokenRecord || new Date(tokenRecord.expiresIn).getTime() < Date.now()) {
      res.status(400).json({ message: 'Invalid or expired token.' });
      return;
    }

    const user: any = await User.findByPk(tokenRecord.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    user.password = hashedPassword;
    await user.save();

    await Token.destroy({ where: { token: validatedData.token } });

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function approveUser(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updates = { isApproved: true };

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'User approved successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error approving user:', error);
    if (next) next(error);
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const pagination = getPagination(req.query);
    const { count, rows: users } = await getAllUsersWithProfiles(pagination);
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: paginatedData('users', users, count, pagination),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function googleOAuth(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await googleOAuthSchema.validateAsync(req.body);
    const { idToken } = validatedData;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ message: 'Invalid Google token payload' });
      return;
    }
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      res.status(400).json({ message: 'Google account email is not verified' });
      return;
    }

    const user = await findOrCreateGoogleUser({
      email: email!.toLowerCase(),
      username: name,
      googleId: payload.sub,
      profilePicture: picture,
      verified: true,
      signup_channel: 'google',
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken: any = jwt.verify(refreshTokenValue, process.env.JWT_SECRET || 'secret');
    let tokenRecord: any = await Token.findOne({
      where: { userId: user.id, token_type: 'refresh_token' },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: 'refresh_token',
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    res.status(200).json({
      message: (user as any).isNewUser
        ? 'Account created successfully with Google'
        : 'Login successful',
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: (user as any).isNewUser,
    });
  } catch (error: any) {
    console.error('Google OAuth Error: ', error);
    if (error.message && (error.message.includes('Token used too early') || error.message.includes('Invalid token'))) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function twitterOAuth(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await twitterOAuthSchema.validateAsync(req.body);
    const { oauth_token, oauth_verifier } = validatedData;

    const twitterResponse = await axios.post(
      'https://api.twitter.com/oauth/access_token',
      `oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const responseData = new URLSearchParams(twitterResponse.data);
    const accessToken = responseData.get('oauth_token');
    const userId = responseData.get('user_id');
    const screenName = responseData.get('screen_name');

    if (!accessToken || !userId) {
      res.status(400).json({ message: 'Invalid Twitter OAuth response' });
      return;
    }

    const userProfileResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}?user.fields=profile_image_url,public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    const twitterUser = userProfileResponse.data.data;

    const userData = {
      email: null,
      username: twitterUser.username || screenName,
      twitterId: userId,
      profilePicture: twitterUser.profile_image_url,
    };

    const user = await findOrCreateTwitterUser(userData);

    const accessTokenJWT = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken: any = jwt.verify(refreshTokenValue, process.env.JWT_SECRET || 'secret');
    let tokenRecord: any = await Token.findOne({
      where: { userId: user.id, token_type: 'refresh_token' },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: 'refresh_token',
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    res.status(200).json({
      message: (user as any).isNewUser
        ? 'Account created successfully with Twitter'
        : 'Login successful',
      access_token: accessTokenJWT,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: (user as any).isNewUser,
    });
  } catch (error: any) {
    console.error('Twitter OAuth Error: ', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function facebookOAuth(req: Request, res: Response, next?: NextFunction): Promise<void> {
  try {
    const validatedData = await facebookOAuthSchema.validateAsync(req.body);
    const { accessToken } = validatedData;

    const facebookResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    const facebookUser = facebookResponse.data;

    if (!facebookUser.id) {
      res.status(400).json({ message: 'Invalid Facebook access token' });
      return;
    }

    const userData = {
      email: facebookUser.email,
      username: facebookUser.name,
      facebookId: facebookUser.id,
      profilePicture: facebookUser.picture?.data?.url,
    };

    const user = await findOrCreateFacebookUser(userData);

    const accessTokenJWT = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken: any = jwt.verify(refreshTokenValue, process.env.JWT_SECRET || 'secret');
    let tokenRecord: any = await Token.findOne({
      where: { userId: user.id, token_type: 'refresh_token' },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: 'refresh_token',
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    res.status(200).json({
      message: (user as any).isNewUser
        ? 'Account created successfully with Facebook'
        : 'Login successful',
      access_token: accessTokenJWT,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: (user as any).isNewUser,
    });
  } catch (error: any) {
    console.error('Facebook OAuth Error: ', error);
    if (error.response?.status === 400) {
      res.status(400).json({ message: 'Invalid Facebook access token' });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
