import { User, SeekerProfile, OwnerProfile, BrokerProfile } from '../models';
import { CustomError } from '../middlewares/error.middleware';

export interface SeekerProfileInput {
  firstName?: string;
  middleName?: string;
  surname?: string;
  phoneNumber?: string;
  emailAddress?: string;
  stateOfResidence?: string;
  gender?: string;
  dateOfBirth?: string;
  ninVerification?: string;
}

export interface OwnerProfileInput extends SeekerProfileInput {
  ownerType?: 'individual' | 'company';
  companyName?: string;
  businessRegistrationNumber?: string;
  bio?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location?: string;
  propertyTypes?: string;
  listingIntent?: string;
}

export interface BrokerProfileInput extends SeekerProfileInput {
  agencyCompanyName?: string;
  companyYearsOfExistence?: string;
  operatingLocations?: string[];
  companySize?: string;
  portfolioSummary?: string;
}

export class ProfileService {
  public static async getProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otpHash', 'refreshToken'] },
      include: [
        { model: SeekerProfile, as: 'seekerProfile' },
        { model: OwnerProfile, as: 'ownerProfile' },
        { model: BrokerProfile, as: 'brokerProfile' },
      ],
    });

    if (!user) {
      const err: CustomError = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    let activeProfile: SeekerProfile | OwnerProfile | BrokerProfile | null = null;
    let hasProfile = false;

    const seekerProf = (user as any).seekerProfile as SeekerProfile | null;
    const ownerProf = (user as any).ownerProfile as OwnerProfile | null;
    const brokerProf = (user as any).brokerProfile as BrokerProfile | null;

    if (user.role === 'owner' && ownerProf) {
      activeProfile = ownerProf;
    } else if (user.role === 'broker' && brokerProf) {
      activeProfile = brokerProf;
    } else {
      activeProfile = seekerProf || ownerProf || brokerProf || null;
    }

    if (activeProfile) {
      const p = activeProfile as any;
      if (p.stateOfResidence || p.ninVerification || p.dateOfBirth || p.ownerType || p.agencyCompanyName) {
        hasProfile = true;
      }
    }

    let profileData: any = null;

    if (activeProfile) {
      profileData = {
        ...activeProfile.toJSON(),
        firstName: user.firstName,
        middleName: (activeProfile as any).middleName || user.middleName || '',
        surname: user.surname,
        emailAddress: user.email,
        phoneNumber: user.phoneNumber,
      };
    }

    return {
      message: 'Profile retrieved successfully.',
      hasProfile,
      user,
      profile: profileData,
    };
  }

  public static async updateSeekerProfile(userId: string, input: SeekerProfileInput) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: CustomError = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (input.firstName) user.firstName = input.firstName;
    if (input.middleName !== undefined) user.middleName = input.middleName;
    if (input.surname) user.surname = input.surname;
    if (input.phoneNumber) user.phoneNumber = input.phoneNumber;
    await user.save();

    let [profile] = await SeekerProfile.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    if (input.middleName !== undefined) profile.middleName = input.middleName;
    if (input.stateOfResidence) profile.stateOfResidence = input.stateOfResidence;
    if (input.gender) profile.gender = input.gender;
    if (input.dateOfBirth) profile.dateOfBirth = input.dateOfBirth;
    if (input.ninVerification) profile.ninVerification = input.ninVerification;

    await profile.save();

    return {
      message: 'Seeker profile updated successfully.',
      profile,
    };
  }

  public static async updateOwnerProfile(userId: string, input: OwnerProfileInput) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: CustomError = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (input.firstName) user.firstName = input.firstName;
    if (input.surname) user.surname = input.surname;
    if (input.phoneNumber) user.phoneNumber = input.phoneNumber;
    await user.save();

    let [profile] = await OwnerProfile.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    if (input.stateOfResidence) profile.stateOfResidence = input.stateOfResidence;
    if (input.gender) profile.gender = input.gender;
    if (input.dateOfBirth) profile.dateOfBirth = input.dateOfBirth;
    if (input.ninVerification) profile.ninVerification = input.ninVerification;
    if (input.ownerType) profile.ownerType = input.ownerType;
    if (input.companyName) profile.companyName = input.companyName;
    if (input.businessRegistrationNumber) profile.businessRegistrationNumber = input.businessRegistrationNumber;
    if (input.bio) profile.bio = input.bio;
    if (input.website) profile.website = input.website;
    if (input.address) profile.address = input.address;
    if (input.city) profile.city = input.city;
    if (input.state) profile.state = input.state;
    if (input.zipCode) profile.zipCode = input.zipCode;
    if (input.location) profile.location = input.location;
    if (input.propertyTypes) profile.propertyTypes = input.propertyTypes;
    if (input.listingIntent) profile.listingIntent = input.listingIntent;

    await profile.save();

    return {
      message: 'Owner profile updated successfully.',
      profile,
    };
  }

  public static async updateBrokerProfile(userId: string, input: BrokerProfileInput) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: CustomError = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (input.firstName) user.firstName = input.firstName;
    if (input.surname) user.surname = input.surname;
    if (input.phoneNumber) user.phoneNumber = input.phoneNumber;
    await user.save();

    let [profile] = await BrokerProfile.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    if (input.stateOfResidence) profile.stateOfResidence = input.stateOfResidence;
    if (input.gender) profile.gender = input.gender;
    if (input.dateOfBirth) profile.dateOfBirth = input.dateOfBirth;
    if (input.ninVerification) profile.ninVerification = input.ninVerification;
    if (input.agencyCompanyName) profile.agencyCompanyName = input.agencyCompanyName;
    if (input.companyYearsOfExistence) profile.companyYearsOfExistence = input.companyYearsOfExistence;
    if (input.operatingLocations) profile.operatingLocations = input.operatingLocations;
    if (input.companySize) profile.companySize = input.companySize;
    if (input.portfolioSummary) profile.portfolioSummary = input.portfolioSummary;

    await profile.save();

    return {
      message: 'Broker profile updated successfully.',
      profile,
    };
  }

  public static async submitKyc(userId: string, input: {
    profilePictureUrl?: string;
    governmentIdUrl?: string;
    governmentIdType?: string;
    ninNumber?: string;
    ninDocumentUrl?: string;
    cacDocumentUrl?: string;
    businessRegistrationNumber?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: CustomError = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'broker') {
      let [profile] = await BrokerProfile.findOrCreate({
        where: { userId },
        defaults: { userId },
      });
      if (input.profilePictureUrl) profile.profilePictureUrl = input.profilePictureUrl;
      if (input.governmentIdUrl) profile.governmentIdUrl = input.governmentIdUrl;
      if (input.governmentIdType) profile.governmentIdType = input.governmentIdType;
      if (input.ninNumber) profile.ninVerification = input.ninNumber;
      if (input.ninDocumentUrl) profile.ninDocumentUrl = input.ninDocumentUrl;
      if (input.cacDocumentUrl) profile.cacDocumentUrl = input.cacDocumentUrl;
      await profile.save();
    } else {
      let [profile] = await OwnerProfile.findOrCreate({
        where: { userId },
        defaults: { userId },
      });
      if (input.profilePictureUrl) profile.profilePictureUrl = input.profilePictureUrl;
      if (input.governmentIdUrl) profile.governmentIdUrl = input.governmentIdUrl;
      if (input.governmentIdType) profile.governmentIdType = input.governmentIdType;
      if (input.ninNumber) profile.ninVerification = input.ninNumber;
      if (input.ninDocumentUrl) profile.ninDocumentUrl = input.ninDocumentUrl;
      if (input.cacDocumentUrl) profile.cacDocumentUrl = input.cacDocumentUrl;
      if (input.businessRegistrationNumber) profile.businessRegistrationNumber = input.businessRegistrationNumber;
      await profile.save();
    }

    user.kycStatus = 'PENDING';
    await user.save();

    return {
      message: 'KYC documents submitted successfully and sent for admin review.',
      kycStatus: user.kycStatus,
    };
  }
}
