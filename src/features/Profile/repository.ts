import {
  Profile,
  BrokerProfile,
  OwnerProfile,
  SeekerPreference,
  UserActivity,
} from './model';
import { User } from '../Authentication/model';
import { Op } from 'sequelize';

export async function createProfile(profileData: any, userId: string) {
  try {
    const profile = await Profile.create({
      ...profileData,
      userId,
    });
    return profile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

export async function createBrokerProfile(profileData: any, userId: string) {
  try {
    const brokerProfile = await BrokerProfile.create({
      ...profileData,
      userId,
    });
    return brokerProfile;
  } catch (error) {
    console.error('Error creating broker profile:', error);
    throw error;
  }
}

export async function createOwnerProfile(profileData: any, userId: string) {
  try {
    const ownerProfile = await OwnerProfile.create({
      ...profileData,
      userId,
    });
    return ownerProfile;
  } catch (error) {
    console.error('Error creating owner profile:', error);
    throw error;
  }
}

export async function createSeekerPreference(preferenceData: any, profileId: string) {
  try {
    const preferences = await SeekerPreference.create({
      ...preferenceData,
      profileId,
    });
    return preferences;
  } catch (error) {
    console.error('Error creating seeker preferences:', error);
    throw error;
  }
}

export async function createUserActivity(profileId: string) {
  try {
    const activity = await UserActivity.create({
      profileId,
    });
    return activity;
  } catch (error) {
    console.error('Error creating user activity:', error);
    throw error;
  }
}

export async function findProfileByUserId(userId: string) {
  try {
    const profile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
        {
          model: SeekerPreference,
          as: 'preferences',
          required: false,
        },
        {
          model: UserActivity,
          as: 'activity',
          required: false,
        },
      ],
    });
    return profile;
  } catch (error) {
    console.error('Error finding profile by user ID:', error);
    throw error;
  }
}

export async function findBrokerProfileByUserId(userId: string) {
  try {
    const brokerProfile = await BrokerProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber', 'brokerProfileType', 'yearsOfExperience', 'bio', 'specialization'],
        },
      ],
    });
    return brokerProfile;
  } catch (error) {
    console.error('Error finding broker profile by user ID:', error);
    throw error;
  }
}

export async function findOwnerProfileByUserId(userId: string) {
  try {
    const ownerProfile = await OwnerProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
      ],
    });
    return ownerProfile;
  } catch (error) {
    console.error('Error finding owner profile by user ID:', error);
    throw error;
  }
}

export async function findProfileById(profileId: string) {
  try {
    const profile = await Profile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
        {
          model: SeekerPreference,
          as: 'preferences',
          required: false,
        },
        {
          model: UserActivity,
          as: 'activity',
          required: false,
        },
      ],
    });
    return profile;
  } catch (error) {
    console.error('Error finding profile by ID:', error);
    throw error;
  }
}

export async function findBrokerProfileById(profileId: string) {
  try {
    const brokerProfile = await BrokerProfile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber', 'brokerProfileType', 'yearsOfExperience', 'bio', 'specialization'],
        },
      ],
    });
    return brokerProfile;
  } catch (error) {
    console.error('Error finding broker profile by ID:', error);
    throw error;
  }
}

export async function findOwnerProfileById(profileId: string) {
  try {
    const ownerProfile = await OwnerProfile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
      ],
    });
    return ownerProfile;
  } catch (error) {
    console.error('Error finding owner profile by ID:', error);
    throw error;
  }
}

export async function updateProfile(userId: string, updateData: any) {
  try {
    const [updatedRowsCount] = await Profile.update(updateData, {
      where: { userId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    const updatedProfile = await findProfileByUserId(userId);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function updateBrokerProfile(userId: string, updateData: any) {
  try {
    const [updatedRowsCount] = await BrokerProfile.update(updateData, {
      where: { userId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    const updatedBrokerProfile = await findBrokerProfileByUserId(userId);
    return updatedBrokerProfile;
  } catch (error) {
    console.error('Error updating broker profile:', error);
    throw error;
  }
}

export async function updateOwnerProfile(userId: string, updateData: any) {
  try {
    const [updatedRowsCount] = await OwnerProfile.update(updateData, {
      where: { userId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    const updatedOwnerProfile = await findOwnerProfileByUserId(userId);
    return updatedOwnerProfile;
  } catch (error) {
    console.error('Error updating owner profile:', error);
    throw error;
  }
}

export async function updateSeekerPreference(profileId: string, updateData: any) {
  try {
    const [updatedRowsCount] = await SeekerPreference.update(updateData, {
      where: { profileId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      const preferences = await createSeekerPreference(updateData, profileId);
      return preferences;
    }

    const updatedPreferences = await SeekerPreference.findOne({
      where: { profileId },
    });
    return updatedPreferences;
  } catch (error) {
    console.error('Error updating seeker preferences:', error);
    throw error;
  }
}

export async function updateUserActivity(profileId: string, updateData: any) {
  try {
    const [updatedRowsCount] = await UserActivity.update(updateData, {
      where: { profileId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    const updatedActivity = await UserActivity.findOne({
      where: { profileId },
    });
    return updatedActivity;
  } catch (error) {
    console.error('Error updating user activity:', error);
    throw error;
  }
}

export async function deleteProfile(userId: string, userRole: string) {
  try {
    switch (userRole) {
      case 'seeker': {
        const profile: any = await Profile.findOne({ where: { userId } });
        if (!profile) return false;
        await SeekerPreference.destroy({ where: { profileId: profile.id } });
        await UserActivity.destroy({ where: { profileId: profile.id } });
        const deletedRowsCount = await Profile.destroy({ where: { userId } });
        return deletedRowsCount > 0;
      }
      case 'broker': {
        const deletedRowsCount = await BrokerProfile.destroy({ where: { userId } });
        return deletedRowsCount > 0;
      }
      case 'owner': {
        const deletedRowsCount = await OwnerProfile.destroy({ where: { userId } });
        return deletedRowsCount > 0;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

export async function getAllProfiles(filters: any = {}, pagination = { limit: 20, offset: 0 }) {
  try {
    const whereClause: any = {};
    const preferenceWhereClause: any = {};
    const activityWhereClause: any = {};

    if (filters.state) {
      whereClause.stateOfResidence = filters.state;
    }
    if (filters.gender) {
      whereClause.gender = filters.gender;
    }
    if (filters.isVerified !== undefined) {
      activityWhereClause.isVerified = filters.isVerified;
    }
    if (filters.budgetMin && filters.budgetMax) {
      preferenceWhereClause.budgetMin = { [Op.gte]: filters.budgetMin };
      preferenceWhereClause.budgetMax = { [Op.lte]: filters.budgetMax };
    }

    return Profile.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
        {
          model: SeekerPreference,
          as: 'preferences',
          where:
            Object.keys(preferenceWhereClause).length > 0
              ? preferenceWhereClause
              : undefined,
          required: false,
        },
        {
          model: UserActivity,
          as: 'activity',
          where:
            Object.keys(activityWhereClause).length > 0
              ? activityWhereClause
              : undefined,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  } catch (error) {
    console.error('Error getting all profiles:', error);
    throw error;
  }
}

export async function getAllBrokerProfiles(filters: any = {}, pagination = { limit: 20, offset: 0 }) {
  try {
    const whereClause: any = {};

    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }

    return BrokerProfile.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber', 'brokerProfileType', 'yearsOfExperience', 'bio', 'specialization'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  } catch (error) {
    console.error('Error getting all broker profiles:', error);
    throw error;
  }
}

export async function getAllOwnerProfiles(filters: any = {}, pagination = { limit: 20, offset: 0 }) {
  try {
    const whereClause: any = {};

    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }

    return OwnerProfile.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  } catch (error) {
    console.error('Error getting all owner profiles:', error);
    throw error;
  }
}

export async function updateVerificationStatus(userId: string, isVerified: boolean, verificationDocuments = null) {
  try {
    const profile: any = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return null;
    }

    const updateData: any = { isVerified };
    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const updatedActivity = await updateUserActivity(profile.id, updateData);
    return updatedActivity;
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
}

export async function updateBrokerVerificationStatus(userId: string, isVerified: boolean, verificationDocuments = null) {
  try {
    const updateData: any = { isVerified };
    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const updatedBrokerProfile = await updateBrokerProfile(userId, updateData);
    return updatedBrokerProfile;
  } catch (error) {
    console.error('Error updating broker verification status:', error);
    throw error;
  }
}

export async function updateOwnerVerificationStatus(userId: string, isVerified: boolean, verificationDocuments = null) {
  try {
    const updateData: any = { isVerified };
    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const updatedOwnerProfile = await updateOwnerProfile(userId, updateData);
    return updatedOwnerProfile;
  } catch (error) {
    console.error('Error updating owner verification status:', error);
    throw error;
  }
}

export function checkProfileCompletion(profileData: any): boolean {
  const requiredFields = [
    'emailAddress',
    'stateOfResidence',
    'gender',
    'dateOfBirth',
  ];

  return requiredFields.every(
    (field) =>
      profileData[field] && profileData[field].toString().trim() !== ''
  );
}

export function checkBrokerProfileCompletion(profileData: any): boolean {
  const requiredFields = ['emailAddress'];

  return requiredFields.every(
    (field) =>
      profileData[field] && profileData[field].toString().trim() !== ''
  );
}

export function checkOwnerProfileCompletion(profileData: any): boolean {
  const requiredFields = [
    'emailAddress',
    'location',
    'propertyTypes',
    'listingIntent',
    'ownerType',
  ];

  return requiredFields.every((field) => {
    const value = profileData[field];
    if (Array.isArray(value)) return value.length > 0;
    return value && value.toString().trim() !== '';
  });
}

export async function searchProfiles(searchTerm: string, filters: any = {}) {
  try {
    const searchCondition = {
      [Op.or]: [
        { stateOfResidence: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const profiles = await Profile.findAll({
      where: searchCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
        {
          model: SeekerPreference,
          as: 'preferences',
          required: false,
        },
        {
          model: UserActivity,
          as: 'activity',
          required: false,
        },
      ],
      limit: filters.limit || 20,
      order: [['createdAt', 'DESC']],
    });

    return profiles;
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw error;
  }
}

export async function searchBrokerProfiles(searchTerm: string, filters: any = {}) {
  try {
    const searchCondition = {
      [Op.or]: [
        { agencyCompanyName: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const brokerProfiles = await BrokerProfile.findAll({
      where: searchCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber', 'brokerProfileType', 'yearsOfExperience', 'bio', 'specialization'],
        },
      ],
      limit: filters.limit || 20,
      order: [['createdAt', 'DESC']],
    });

    return brokerProfiles;
  } catch (error) {
    console.error('Error searching broker profiles:', error);
    throw error;
  }
}

export async function searchOwnerProfiles(searchTerm: string, filters: any = {}) {
  try {
    const searchCondition = {
      [Op.or]: [
        { location: { [Op.iLike]: `%${searchTerm}%` } },
        { ownerType: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const ownerProfiles = await OwnerProfile.findAll({
      where: searchCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'verified', 'firstName', 'surname', 'phoneNumber'],
        },
      ],
      limit: filters.limit || 20,
      order: [['createdAt', 'DESC']],
    });

    return ownerProfiles;
  } catch (error) {
    console.error('Error searching owner profiles:', error);
    throw error;
  }
}

export async function incrementActivityCounter(userId: string, activityType: string, increment = 1) {
  try {
    const profile: any = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return null;
    }

    const validActivityTypes = ['inquiriesCount', 'savedPropertiesCount', 'reviewsCount'];
    if (!validActivityTypes.includes(activityType)) {
      throw new Error(`Invalid activity type: ${activityType}`);
    }

    let activity: any = await UserActivity.findOne({
      where: { profileId: profile.id },
    });
    if (!activity) {
      activity = await createUserActivity(profile.id);
    }

    const updateData = {
      [activityType]: (activity[activityType] || 0) + increment,
      lastActivityDate: new Date(),
    };

    const updatedActivity = await updateUserActivity(profile.id, updateData);
    return updatedActivity;
  } catch (error) {
    console.error('Error incrementing activity:', error);
    throw error;
  }
}
