const { AgentProfile, OwnerProfile, SeekerProfile } = require("./model");
const { User } = require("../Authentication/model");
const { Op } = require("sequelize");

/**
 * Get the appropriate profile model based on user role
 * @param {string} role - User role
 * @returns {Model} - Sequelize model
 */
function getProfileModel(role) {
  switch (role) {
    case "agent":
      return AgentProfile;
    case "owner":
      return OwnerProfile;
    case "seeker":
      return SeekerProfile;
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

/**
 * Creates a new profile for a user based on their role
 * @param {Object} profileData - The profile data
 * @param {string} userRole - The user's role
 * @returns {Promise<Profile>} - The newly created profile
 */
async function createProfile(profileData, userRole) {
  try {
    const ProfileModel = getProfileModel(userRole);
    const profile = await ProfileModel.create(profileData);
    return profile;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
}

/**
 * Finds a profile by user ID
 * @param {string} userId - The user's ID
 * @param {string} userRole - The user's role
 * @returns {Promise<Profile|null>} - The profile if found, otherwise null
 */
async function findProfileByUserId(userId, userRole) {
  try {
    const ProfileModel = getProfileModel(userRole);
    const profile = await ProfileModel.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Finds a profile by profile ID
 * @param {string} profileId - The profile's ID
 * @param {string} userRole - The user's role
 * @returns {Promise<Profile|null>} - The profile if found, otherwise null
 */
async function findProfileById(profileId, userRole) {
  try {
    const ProfileModel = getProfileModel(userRole);
    const profile = await ProfileModel.findByPk(profileId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role", "verified"],
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
 * Updates a profile
 * @param {string} userId - The user's ID
 * @param {Object} updateData - The data to update
 * @param {string} userRole - The user's role
 * @returns {Promise<Profile|null>} - The updated profile
 */
async function updateProfile(userId, updateData, userRole) {
  try {
    const ProfileModel = getProfileModel(userRole);
    const [updatedRowsCount] = await ProfileModel.update(updateData, {
      where: { userId },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    // Fetch the updated profile
    const updatedProfile = await findProfileByUserId(userId, userRole);
    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Deletes a profile
 * @param {string} userId - The user's ID
 * @param {string} userRole - The user's role
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
async function deleteProfile(userId, userRole) {
  try {
    const ProfileModel = getProfileModel(userRole);
    const deletedRowsCount = await ProfileModel.destroy({
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
 * @returns {Promise<Object>} - Object containing profiles by role
 */
async function getAllProfiles(filters = {}) {
  try {
    const results = {};
    const whereClause = {};
    const userWhereClause = {};

    // Apply filters
    if (filters.state) {
      whereClause.stateOfResidence = filters.state;
    }
    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }
    if (filters.gender) {
      whereClause.gender = filters.gender;
    }

    // Get profiles for each role or specific role
    const rolesToFetch = filters.role ? [filters.role] : ["agent", "owner", "seeker"];

    for (const role of rolesToFetch) {
      const ProfileModel = getProfileModel(role);
      const profiles = await ProfileModel.findAll({
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
      results[role] = profiles;
    }

    return results;
  } catch (error) {
    console.error("Error getting all profiles:", error);
    throw error;
  }
}

/**
 * Gets profiles by role
 * @param {string} role - The user role
 * @param {Object} filters - Additional filters
 * @returns {Promise<Profile[]>} - Array of profiles
 */
async function getProfilesByRole(role, filters = {}) {
  try {
    const ProfileModel = getProfileModel(role);
    const whereClause = {};

    // Apply role-specific filters
    if (filters.state) {
      whereClause.stateOfResidence = filters.state;
    }
    if (filters.isVerified !== undefined) {
      whereClause.isVerified = filters.isVerified;
    }
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    // Role-specific filters
    if (role === "agent" && filters.minRating) {
      whereClause.averageRating = { [Op.gte]: filters.minRating };
    }
    if (role === "seeker" && filters.budgetMin && filters.budgetMax) {
      whereClause.budgetMin = { [Op.gte]: filters.budgetMin };
      whereClause.budgetMax = { [Op.lte]: filters.budgetMax };
    }

    const profiles = await ProfileModel.findAll({
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
    return profiles;
  } catch (error) {
    console.error("Error getting profiles by role:", error);
    throw error;
  }
}

/**
 * Updates profile verification status
 * @param {string} userId - The user's ID
 * @param {boolean} isVerified - Verification status
 * @param {string} userRole - The user's role
 * @returns {Promise<Profile|null>} - The updated profile
 */
async function updateVerificationStatus(userId, isVerified, userRole) {
  try {
    const ProfileModel = getProfileModel(userRole);
    const [updatedRowsCount] = await ProfileModel.update(
      { isVerified },
      {
        where: { userId },
        returning: true,
      }
    );

    if (updatedRowsCount === 0) {
      return null;
    }

    const updatedProfile = await findProfileByUserId(userId, userRole);
    return updatedProfile;
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw error;
  }
}

/**
 * Checks if profile is complete based on role
 * @param {Object} profileData - The profile data
 * @param {string} role - The user role
 * @returns {boolean} - True if profile is complete
 */
function checkProfileCompletion(profileData, role) {
  const baseRequiredFields = [
    "firstName",
    "surname",
    "phoneNumber",
    "emailAddress",
    "stateOfResidence",
    "gender",
    "dateOfBirth",
  ];

  let roleSpecificFields = [];

  switch (role) {
    case "agent":
      // No additional required fields for agents (agency info is optional)
      roleSpecificFields = [];
      break;
    case "owner":
      // Owner type is required
      roleSpecificFields = ["ownerType"];
      break;
    case "seeker":
      // No additional required fields for seekers
      roleSpecificFields = [];
      break;
  }

  const allRequiredFields = [...baseRequiredFields, ...roleSpecificFields];

  return allRequiredFields.every(field => 
    profileData[field] && profileData[field].toString().trim() !== ""
  );
}

/**
 * Search profiles across all roles
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Search results by role
 */
async function searchProfiles(searchTerm, filters = {}) {
  try {
    const results = {};
    const searchCondition = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { surname: { [Op.iLike]: `%${searchTerm}%` } },
        { city: { [Op.iLike]: `%${searchTerm}%` } },
        { stateOfResidence: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    const rolesToSearch = filters.role ? [filters.role] : ["agent", "owner", "seeker"];

    for (const role of rolesToSearch) {
      const ProfileModel = getProfileModel(role);
      const profiles = await ProfileModel.findAll({
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
      results[role] = profiles;
    }

    return results;
  } catch (error) {
    console.error("Error searching profiles:", error);
    throw error;
  }
}

module.exports = {
  createProfile,
  findProfileByUserId,
  findProfileById,
  updateProfile,
  deleteProfile,
  getAllProfiles,
  getProfilesByRole,
  updateVerificationStatus,
  checkProfileCompletion,
  searchProfiles,
  getProfileModel,
};