const {
  Profile,
  BrokerProfile,
  OwnerProfile,
  SeekerPreference,
  UserActivity,
} = require("./model");
const { User } = require("../Authentication/model");
const { Op } = require("sequelize");

/**
 * Creates a new profile for a seeker user
 */
async function createProfile(profileData, userId) {
  try {
    const profile = await Profile.create({
      ...profileData,
      userId,
    });
    return profile;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
}

/**
 * Creates a new broker profile
 */
async function createBrokerProfile(profileData, userId) {
  try {
    const brokerProfile = await BrokerProfile.create({
      ...profileData,
      userId,
    });
    return brokerProfile;
  } catch (error) {
    console.error("Error creating broker profile:", error);
    throw error;
  }
}

/**
 * Creates a new owner profile
 */
async function createOwnerProfile(profileData, userId) {
  try {
    const ownerProfile = await OwnerProfile.create({
      ...profileData,
      userId,
    });
    return ownerProfile;
  } catch (error) {
    console.error("Error creating owner profile:", error);
    throw error;
  }
}

/**
 * Creates seeker preferences for a profile
 */
async function createSeekerPreference(preferenceData, profileId) {
  try {
    const preferences = await SeekerPreference.create({
      ...preferenceData,
      profileId,
    });
    return preferences;
  } catch (error) {
    console.error("Error creating seeker preferences:", error);
    throw error;
  }
}

/**
 * Creates user activity record for a profile
 */
async function createUserActivity(profileId) {
  try {
    const activity = await UserActivity.create({
      profileId,
    });
    return activity;
  } catch (error) {
    console.error("Error creating user activity:", error);
    throw error;
  }
}

/**
 * Finds a profile by user ID with all associations
 */
async function findProfileByUserId(userId) {
  try {
    const profile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
        {
          model: SeekerPreference,
          as: "preferences",
          required: false,
        },
        {
          model: UserActivity,
          as: "activity",
          required: false,
        },
      ],
    });
    return profile;
  } catch (error) {
    console.error("Error finding profile by user ID:", error);
    throw error;
  }
}

/**
 * Finds a broker profile by user ID
 */
async function findBrokerProfileByUserId(userId) {
  try {
    const brokerProfile = await BrokerProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber", "brokerProfileType", "yearsOfExperience", "bio", "specialization"],
        },
      ],
    });
    return brokerProfile;
  } catch (error) {
    console.error("Error finding broker profile by user ID:", error);
    throw error;
  }
}

/**
 * Finds an owner profile by user ID
 */
async function findOwnerProfileByUserId(userId) {
  try {
    const ownerProfile = await OwnerProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
      ],
    });
    return ownerProfile;
  } catch (error) {
    console.error("Error finding owner profile by user ID:", error);
    throw error;
  }
}

/**
 * Finds a profile by profile ID with all associations
 */
async function findProfileById(profileId) {
  try {
    const profile = await Profile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
        {
          model: SeekerPreference,
          as: "preferences",
          required: false,
        },
        {
          model: UserActivity,
          as: "activity",
          required: false,
        },
      ],
    });
    return profile;
  } catch (error) {
    console.error("Error finding profile by ID:", error);
    throw error;
  }
}

/**
 * Finds a broker profile by profile ID
 */
async function findBrokerProfileById(profileId) {
  try {
    const brokerProfile = await BrokerProfile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber", "brokerProfileType", "yearsOfExperience", "bio", "specialization"],
        },
      ],
    });
    return brokerProfile;
  } catch (error) {
    console.error("Error finding broker profile by ID:", error);
    throw error;
  }
}

/**
 * Finds an owner profile by profile ID
 */
async function findOwnerProfileById(profileId) {
  try {
    const ownerProfile = await OwnerProfile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
      ],
    });
    return ownerProfile;
  } catch (error) {
    console.error("Error finding owner profile by ID:", error);
    throw error;
  }
}

/**
 * Updates a profile
 */
async function updateProfile(userId, updateData) {
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
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Updates a broker profile
 */
async function updateBrokerProfile(userId, updateData) {
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
    console.error("Error updating broker profile:", error);
    throw error;
  }
}

/**
 * Updates an owner profile
 */
async function updateOwnerProfile(userId, updateData) {
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
    console.error("Error updating owner profile:", error);
    throw error;
  }
}

/**
 * Updates seeker preferences
 */
async function updateSeekerPreference(profileId, updateData) {
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
    console.error("Error updating seeker preferences:", error);
    throw error;
  }
}

/**
 * Updates user activity
 */
async function updateUserActivity(profileId, updateData) {
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
    console.error("Error updating user activity:", error);
    throw error;
  }
}

/**
 * Deletes a profile and all associated data
 */
async function deleteProfile(userId, userRole) {
  try {
    switch (userRole) {
      case "seeker": {
        const profile = await Profile.findOne({ where: { userId } });
        if (!profile) return false;
        await SeekerPreference.destroy({ where: { profileId: profile.id } });
        await UserActivity.destroy({ where: { profileId: profile.id } });
        const deletedRowsCount = await Profile.destroy({ where: { userId } });
        return deletedRowsCount > 0;
      }
      case "broker": {
        const deletedRowsCount = await BrokerProfile.destroy({ where: { userId } });
        return deletedRowsCount > 0;
      }
      case "owner": {
        const deletedRowsCount = await OwnerProfile.destroy({ where: { userId } });
        return deletedRowsCount > 0;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
}

/**
 * Gets all profiles with optional filtering
 */
async function getAllProfiles(filters = {}) {
  try {
    const whereClause = {};
    const preferenceWhereClause = {};
    const activityWhereClause = {};

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

    const profiles = await Profile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
        {
          model: SeekerPreference,
          as: "preferences",
          where:
            Object.keys(preferenceWhereClause).length > 0
              ? preferenceWhereClause
              : undefined,
          required: false,
        },
        {
          model: UserActivity,
          as: "activity",
          where:
            Object.keys(activityWhereClause).length > 0
              ? activityWhereClause
              : undefined,
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return profiles;
  } catch (error) {
    console.error("Error getting all profiles:", error);
    throw error;
  }
}

/**
 * Gets all broker profiles with optional filtering
 */
async function getAllBrokerProfiles(filters = {}) {
  try {
    const whereClause = {};

    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }

    const brokerProfiles = await BrokerProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber", "brokerProfileType", "yearsOfExperience", "bio", "specialization"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return brokerProfiles;
  } catch (error) {
    console.error("Error getting all broker profiles:", error);
    throw error;
  }
}

/**
 * Gets all owner profiles with optional filtering
 */
async function getAllOwnerProfiles(filters = {}) {
  try {
    const whereClause = {};

    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }

    const ownerProfiles = await OwnerProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return ownerProfiles;
  } catch (error) {
    console.error("Error getting all owner profiles:", error);
    throw error;
  }
}

/**
 * Updates profile verification status
 */
async function updateVerificationStatus(userId, isVerified, verificationDocuments = null) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return null;
    }

    const updateData = { isVerified };
    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const updatedActivity = await updateUserActivity(profile.id, updateData);
    return updatedActivity;
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw error;
  }
}

/**
 * Updates broker profile verification status
 */
async function updateBrokerVerificationStatus(userId, isVerified, verificationDocuments = null) {
  try {
    const updateData = { isVerified };
    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const updatedBrokerProfile = await updateBrokerProfile(userId, updateData);
    return updatedBrokerProfile;
  } catch (error) {
    console.error("Error updating broker verification status:", error);
    throw error;
  }
}

/**
 * Updates owner profile verification status
 */
async function updateOwnerVerificationStatus(userId, isVerified, verificationDocuments = null) {
  try {
    const updateData = { isVerified };
    if (verificationDocuments) {
      updateData.verificationDocuments = verificationDocuments;
    }

    const updatedOwnerProfile = await updateOwnerProfile(userId, updateData);
    return updatedOwnerProfile;
  } catch (error) {
    console.error("Error updating owner verification status:", error);
    throw error;
  }
}

/**
 * Checks if seeker profile is complete
 */
function checkProfileCompletion(profileData) {
  const requiredFields = [
    "emailAddress",
    "stateOfResidence",
    "gender",
    "dateOfBirth",
  ];

  return requiredFields.every(
    (field) =>
      profileData[field] && profileData[field].toString().trim() !== ""
  );
}

/**
 * Checks if broker profile is complete
 */
function checkBrokerProfileCompletion(profileData) {
  const requiredFields = ["emailAddress"];

  return requiredFields.every(
    (field) =>
      profileData[field] && profileData[field].toString().trim() !== ""
  );
}

/**
 * Checks if owner profile is complete
 */
function checkOwnerProfileCompletion(profileData) {
  const requiredFields = [
    "emailAddress",
    "location",
    "propertyTypes",
    "listingIntent",
    "ownerType",
  ];

  return requiredFields.every((field) => {
    const value = profileData[field];
    if (Array.isArray(value)) return value.length > 0;
    return value && value.toString().trim() !== "";
  });
}

/**
 * Search profiles
 */
async function searchProfiles(searchTerm, filters = {}) {
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
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
        {
          model: SeekerPreference,
          as: "preferences",
          required: false,
        },
        {
          model: UserActivity,
          as: "activity",
          required: false,
        },
      ],
      limit: filters.limit || 20,
      order: [["createdAt", "DESC"]],
    });

    return profiles;
  } catch (error) {
    console.error("Error searching profiles:", error);
    throw error;
  }
}

/**
 * Search broker profiles
 */
async function searchBrokerProfiles(searchTerm, filters = {}) {
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
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber", "brokerProfileType", "yearsOfExperience", "bio", "specialization"],
        },
      ],
      limit: filters.limit || 20,
      order: [["createdAt", "DESC"]],
    });

    return brokerProfiles;
  } catch (error) {
    console.error("Error searching broker profiles:", error);
    throw error;
  }
}

/**
 * Search owner profiles
 */
async function searchOwnerProfiles(searchTerm, filters = {}) {
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
          as: "user",
          attributes: ["id", "email", "role", "verified", "firstName", "surname", "phoneNumber"],
        },
      ],
      limit: filters.limit || 20,
      order: [["createdAt", "DESC"]],
    });

    return ownerProfiles;
  } catch (error) {
    console.error("Error searching owner profiles:", error);
    throw error;
  }
}

/**
 * Increment activity counters
 */
async function incrementActivity(userId, activityType, increment = 1) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return null;
    }

    const validActivityTypes = [
      "totalInquiries",
      "totalApplications",
      "totalViewedProperties",
      "totalSavedProperties",
    ];
    if (!validActivityTypes.includes(activityType)) {
      throw new Error(`Invalid activity type: ${activityType}`);
    }

    let activity = await UserActivity.findOne({
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
    console.error("Error incrementing activity:", error);
    throw error;
  }
}

module.exports = {
  createProfile,
  createBrokerProfile,
  createOwnerProfile,
  createSeekerPreference,
  createUserActivity,
  findProfileByUserId,
  findProfileById,
  findBrokerProfileByUserId,
  findBrokerProfileById,
  findOwnerProfileByUserId,
  findOwnerProfileById,
  updateProfile,
  updateBrokerProfile,
  updateOwnerProfile,
  updateSeekerPreference,
  updateUserActivity,
  deleteProfile,
  getAllProfiles,
  getAllBrokerProfiles,
  getAllOwnerProfiles,
  updateVerificationStatus,
  updateBrokerVerificationStatus,
  updateOwnerVerificationStatus,
  checkProfileCompletion,
  checkBrokerProfileCompletion,
  checkOwnerProfileCompletion,
  searchProfiles,
  searchBrokerProfiles,
  searchOwnerProfiles,
  incrementActivity,
};
