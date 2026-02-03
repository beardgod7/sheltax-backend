const { Profile, BrokerProfile, OwnerProfile, SeekerPreference, UserActivity } = require("./model");
const { User } = require("../Authentication/model");
const { Op } = require("sequelize");

/**
 * Creates a new profile for a seeker user
 * @param {Object} profileData - The profile data
 * @param {string} userId - The user's ID
 * @returns {Promise<Profile>} - The newly created profile
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
 * @param {Object} profileData - The broker profile data
 * @param {string} userId - The user's ID
 * @returns {Promise<BrokerProfile>} - The newly created broker profile
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
 * @param {Object} profileData - The owner profile data
 * @param {string} userId - The user's ID
 * @returns {Promise<OwnerProfile>} - The newly created owner profile
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
 * @param {Object} preferenceData - The preference data
 * @param {string} profileId - The profile's ID
 * @returns {Promise<SeekerPreference>} - The newly created preferences
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
 * Finds an owner profile by user ID
 * @param {string} userId - The user's ID
 * @returns {Promise<OwnerProfile|null>} - The owner profile if found
 */
async function findOwnerProfileByUserId(userId) {
  try {
    const ownerProfile = await OwnerProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Finds an owner profile by profile ID
 * @param {string} profileId - The profile's ID
 * @returns {Promise<OwnerProfile|null>} - The owner profile if found
 */
async function findOwnerProfileById(profileId) {
  try {
    const ownerProfile = await OwnerProfile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Creates user activity record for a profile
 * @param {string} profileId - The profile's ID
 * @returns {Promise<UserActivity>} - The newly created activity record
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
 * Creates a complete profile with preferences and activity
 * @param {Object} profileData - The profile data
 * @param {Object} preferenceData - The preference data (optional)
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The complete profile with associations
 */
async function createCompleteProfile(profileData, preferenceData = {}, userId) {
  try {
    // Create the main profile
    const profile = await createProfile(profileData, userId);
    
    // Create preferences if provided
    let preferences = null;
    if (Object.keys(preferenceData).length > 0) {
      preferences = await createSeekerPreference(preferenceData, profile.id);
    }
    
    // Create activity record
    const activity = await createUserActivity(profile.id);
    
    return {
      profile,
      preferences,
      activity,
    };
  } catch (error) {
    console.error("Error creating complete profile:", error);
    throw error;
  }
}

/**
 * Finds a profile by user ID with all associations
 * @param {string} userId - The user's ID
 * @returns {Promise<Profile|null>} - The profile with associations if found
 */
async function findProfileByUserId(userId) {
  try {
    const profile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * @param {string} userId - The user's ID
 * @returns {Promise<BrokerProfile|null>} - The broker profile if found
 */
async function findBrokerProfileByUserId(userId) {
  try {
    const brokerProfile = await BrokerProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Finds a broker profile by profile ID
 * @param {string} profileId - The profile's ID
 * @returns {Promise<BrokerProfile|null>} - The broker profile if found
 */
async function findBrokerProfileById(profileId) {
  try {
    const brokerProfile = await BrokerProfile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Finds a profile by profile ID with all associations
 * @param {string} profileId - The profile's ID
 * @returns {Promise<Profile|null>} - The profile with associations if found
 */
async function findProfileById(profileId) {
  try {
    const profile = await Profile.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Updates an owner profile
 * @param {string} userId - The user's ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<OwnerProfile|null>} - The updated owner profile
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

    // Fetch the updated owner profile
    const updatedOwnerProfile = await findOwnerProfileByUserId(userId);
    return updatedOwnerProfile;
  } catch (error) {
    console.error("Error updating owner profile:", error);
    throw error;
  }
}

/**
 * Updates a broker profile
 * @param {string} userId - The user's ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<BrokerProfile|null>} - The updated broker profile
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

    // Fetch the updated broker profile
    const updatedBrokerProfile = await findBrokerProfileByUserId(userId);
    return updatedBrokerProfile;
  } catch (error) {
    console.error("Error updating broker profile:", error);
    throw error;
  }
}

/**
 * Gets all owner profiles with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<OwnerProfile[]>} - Array of owner profiles
 */
async function getAllOwnerProfiles(filters = {}) {
  try {
    const whereClause = {};

    // Apply filters
    if (filters.state) {
      whereClause.stateOfResidence = filters.state;
    }
    if (filters.gender) {
      whereClause.gender = filters.gender;
    }
    if (filters.ownerType) {
      whereClause.ownerType = filters.ownerType;
    }
    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }
    if (filters.minRating) {
      whereClause.averageRating = { [Op.gte]: filters.minRating };
    }

    const ownerProfiles = await OwnerProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Updates a profile
 * @param {string} userId - The user's ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Profile|null>} - The updated profile
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

    // Fetch the updated profile with associations
    const updatedProfile = await findProfileByUserId(userId);
    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Updates seeker preferences
 * @param {string} profileId - The profile's ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<SeekerPreference|null>} - The updated preferences
 */
async function updateSeekerPreference(profileId, updateData) {
  try {
    const [updatedRowsCount] = await SeekerPreference.update(updateData, {
      where: { profileId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      // Create preferences if they don't exist
      const preferences = await createSeekerPreference(updateData, profileId);
      return preferences;
    }

    // Fetch the updated preferences
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
 * @param {string} profileId - The profile's ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<UserActivity|null>} - The updated activity
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

    // Fetch the updated activity
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
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
async function deleteProfile(userId) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return false;
    }

    // Delete associated data first
    await SeekerPreference.destroy({ where: { profileId: profile.id } });
    await UserActivity.destroy({ where: { profileId: profile.id } });
    
    // Delete the profile
    const deletedRowsCount = await Profile.destroy({
      where: { userId },
    });
    
    return deletedRowsCount > 0;
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
}

/**
 * Gets all profiles with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Profile[]>} - Array of profiles
 */
async function getAllProfiles(filters = {}) {
  try {
    const whereClause = {};
    const preferenceWhereClause = {};
    const activityWhereClause = {};

    // Apply filters
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
          attributes: ["id", "email", "role", "verified"],
        },
        {
          model: SeekerPreference,
          as: "preferences",
          where: Object.keys(preferenceWhereClause).length > 0 ? preferenceWhereClause : undefined,
          required: false,
        },
        {
          model: UserActivity,
          as: "activity",
          where: Object.keys(activityWhereClause).length > 0 ? activityWhereClause : undefined,
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
 * @param {Object} filters - Filter options
 * @returns {Promise<BrokerProfile[]>} - Array of broker profiles
 */
async function getAllBrokerProfiles(filters = {}) {
  try {
    const whereClause = {};

    // Apply filters
    if (filters.state) {
      whereClause.stateOfResidence = filters.state;
    }
    if (filters.gender) {
      whereClause.gender = filters.gender;
    }
    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }
    if (filters.minRating) {
      whereClause.averageRating = { [Op.gte]: filters.minRating };
    }

    const brokerProfiles = await BrokerProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Updates profile verification status
 * @param {string} userId - The user's ID
 * @param {boolean} isVerified - Verification status
 * @param {Object} verificationDocuments - Verification documents (optional)
 * @returns {Promise<UserActivity|null>} - The updated activity record
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
 * @param {string} userId - The user's ID
 * @param {boolean} isVerified - Verification status
 * @param {Object} verificationDocuments - Verification documents (optional)
 * @returns {Promise<BrokerProfile|null>} - The updated broker profile
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
 * @param {string} userId - The user's ID
 * @param {boolean} isVerified - Verification status
 * @param {Object} verificationDocuments - Verification documents (optional)
 * @returns {Promise<OwnerProfile|null>} - The updated owner profile
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
 * Checks if broker profile is complete
 * @param {Object} profileData - The broker profile data
 * @returns {boolean} - True if profile is complete
 */
function checkBrokerProfileCompletion(profileData) {
  const requiredFields = [
    "firstName",
    "surname",
    "phoneNumber",
    "emailAddress",
    "stateOfResidence",
    "gender",
    "dateOfBirth",
  ];

  return requiredFields.every(field => 
    profileData[field] && profileData[field].toString().trim() !== ""
  );
}

/**
 * Checks if owner profile is complete
 * @param {Object} profileData - The owner profile data
 * @returns {boolean} - True if profile is complete
 */
function checkOwnerProfileCompletion(profileData) {
  const requiredFields = [
    "firstName",
    "surname",
    "phoneNumber",
    "emailAddress",
    "stateOfResidence",
    "gender",
    "dateOfBirth",
    "ownerType",
  ];

  return requiredFields.every(field => 
    profileData[field] && profileData[field].toString().trim() !== ""
  );
}
/**
 * Checks if profile is complete
 * @param {Object} profileData - The profile data
 * @returns {boolean} - True if profile is complete
 */
function checkProfileCompletion(profileData) {
  const requiredFields = [
    "firstName",
    "surname",
    "phoneNumber",
    "emailAddress",
    "stateOfResidence",
    "gender",
    "dateOfBirth",
  ];

  return requiredFields.every(field => 
    profileData[field] && profileData[field].toString().trim() !== ""
  );
}

/**
 * Search broker profiles
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<BrokerProfile[]>} - Search results
 */
async function searchBrokerProfiles(searchTerm, filters = {}) {
  try {
    const searchCondition = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { surname: { [Op.iLike]: `%${searchTerm}%` } },
        { agencyCompanyName: { [Op.iLike]: `%${searchTerm}%` } },
        { stateOfResidence: { [Op.iLike]: `%${searchTerm}%` } },
        { city: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const brokerProfiles = await BrokerProfile.findAll({
      where: searchCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Search profiles
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<Profile[]>} - Search results
 */
async function searchProfiles(searchTerm, filters = {}) {
  try {
    const searchCondition = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { surname: { [Op.iLike]: `%${searchTerm}%` } },
        { stateOfResidence: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const profiles = await Profile.findAll({
      where: searchCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Search owner profiles
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<OwnerProfile[]>} - Search results
 */
async function searchOwnerProfiles(searchTerm, filters = {}) {
  try {
    const searchCondition = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { surname: { [Op.iLike]: `%${searchTerm}%` } },
        { companyName: { [Op.iLike]: `%${searchTerm}%` } },
        { stateOfResidence: { [Op.iLike]: `%${searchTerm}%` } },
        { city: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const ownerProfiles = await OwnerProfile.findAll({
      where: searchCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * @param {string} userId - The user's ID
 * @param {string} activityType - Type of activity (inquiries, applications, viewedProperties, savedProperties)
 * @param {number} increment - Amount to increment (default: 1)
 * @returns {Promise<UserActivity|null>} - The updated activity record
 */
async function incrementActivity(userId, activityType, increment = 1) {
  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      return null;
    }

    const validActivityTypes = ['totalInquiries', 'totalApplications', 'totalViewedProperties', 'totalSavedProperties'];
    if (!validActivityTypes.includes(activityType)) {
      throw new Error(`Invalid activity type: ${activityType}`);
    }

    // Get current activity or create if doesn't exist
    let activity = await UserActivity.findOne({ where: { profileId: profile.id } });
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
  createCompleteProfile,
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