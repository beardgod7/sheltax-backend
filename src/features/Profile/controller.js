const {
  createProfile,
  createBrokerProfile,
  createOwnerProfile,
  createSeekerPreference,
  createUserActivity,
  findProfileByUserId,
  findBrokerProfileByUserId,
  findOwnerProfileByUserId,
  findProfileById,
  findBrokerProfileById,
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
} = require("./repository");

const {
  createProfileSchema,
  updateProfileSchema,
  createBrokerProfileSchema,
  updateBrokerProfileSchema,
  createOwnerProfileSchema,
  updateOwnerProfileSchema,
  createSeekerPreferenceSchema,
  updateSeekerPreferenceSchema,
  updateUserActivitySchema,
  profilePictureSchema,
  verificationDocumentsSchema,
} = require("./schema");

/**
 * Create a new seeker profile
 */
async function createSeekerProfile(req, res) {
  try {
    const userId = req.user.id;
    
    const validatedData = await createProfileSchema.validateAsync(req.body);

    // Check if profile already exists
    const existingProfile = await findProfileByUserId(userId);
    if (existingProfile) {
      return res.status(409).json({
        message: "Profile already exists for this user",
      });
    }

    // Check profile completion
    const isComplete = checkProfileCompletion(validatedData);

    const profileData = {
      ...validatedData,
      isComplete,
    };

    const newProfile = await createProfile(profileData, userId);

    return res.status(201).json({
      message: "Seeker profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating seeker profile:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Create a new broker profile
 */
async function createBrokerProfileHandler(req, res) {
  try {
    const userId = req.user.id;
    
    const validatedData = await createBrokerProfileSchema.validateAsync(req.body);

    // Check if profile already exists
    const existingProfile = await findBrokerProfileByUserId(userId);
    if (existingProfile) {
      return res.status(409).json({
        message: "Broker profile already exists for this user",
      });
    }

    // Check profile completion
    const isComplete = checkBrokerProfileCompletion(validatedData);

    const profileData = {
      ...validatedData,
      isComplete,
    };

    const newProfile = await createBrokerProfile(profileData, userId);

    return res.status(201).json({
      message: "Broker profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating broker profile:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Create a new owner profile
 */
async function createOwnerProfileHandler(req, res) {
  try {
    const userId = req.user.id;
    
    const validatedData = await createOwnerProfileSchema.validateAsync(req.body);

    // Check if profile already exists
    const existingProfile = await findOwnerProfileByUserId(userId);
    if (existingProfile) {
      return res.status(409).json({
        message: "Owner profile already exists for this user",
      });
    }

    // Check profile completion
    const isComplete = checkOwnerProfileCompletion(validatedData);

    const profileData = {
      ...validatedData,
      isComplete,
    };

    const newProfile = await createOwnerProfile(profileData, userId);

    return res.status(201).json({
      message: "Owner profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating owner profile:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Create seeker preferences
 */
async function createSeekerPreferences(req, res) {
  try {
    const userId = req.user.id;
    
    const validatedData = await createSeekerPreferenceSchema.validateAsync(req.body);

    // Find the seeker's profile
    const profile = await findProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({
        message: "Seeker profile not found. Please create a profile first.",
      });
    }

    const preferences = await createSeekerPreference(validatedData, profile.id);

    return res.status(201).json({
      message: "Seeker preferences created successfully",
      preferences,
    });
  } catch (error) {
    console.error("Error creating seeker preferences:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Update seeker preferences
 */
async function updateSeekerPreferences(req, res) {
  try {
    const userId = req.user.id;
    
    const validatedData = await updateSeekerPreferenceSchema.validateAsync(req.body);

    // Find the seeker's profile
    const profile = await findProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({
        message: "Seeker profile not found",
      });
    }

    const updatedPreferences = await updateSeekerPreference(profile.id, validatedData);

    return res.status(200).json({
      message: "Seeker preferences updated successfully",
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating seeker preferences:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
/**
 * Get user's own profile (works for all profile types)
 */
async function getMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let profile = null;

    // Get profile based on user role
    switch (userRole) {
      case 'seeker':
        profile = await findProfileByUserId(userId);
        break;
      case 'broker':
        profile = await findBrokerProfileByUserId(userId);
        break;
      case 'owner':
        profile = await findOwnerProfileByUserId(userId);
        break;
      default:
        return res.status(400).json({
          message: "Invalid user role",
        });
    }

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Get profile by ID (public view)
 */
async function getProfileById(req, res) {
  try {
    const { id } = req.params;
    const { type } = req.query; // Profile type: seeker, broker, owner

    if (!type || !["seeker", "broker", "owner"].includes(type)) {
      return res.status(400).json({
        message: "Valid type parameter is required (seeker, broker, or owner)",
      });
    }

    let profile = null;

    // Get profile based on type
    switch (type) {
      case 'seeker':
        profile = await findProfileById(id);
        break;
      case 'broker':
        profile = await findBrokerProfileById(id);
        break;
      case 'owner':
        profile = await findOwnerProfileById(id);
        break;
    }

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    // Return public profile data (exclude sensitive information)
    const publicProfile = {
      id: profile.id,
      firstName: profile.firstName,
      surname: profile.surname,
      profilePicture: profile.profilePicture,
      stateOfResidence: profile.stateOfResidence,
      isVerified: profile.isVerified,
      user: {
        role: profile.user.role,
      },
      createdAt: profile.createdAt,
    };

    // Add type-specific public fields
    if (type === "broker") {
      publicProfile.agencyCompanyName = profile.agencyCompanyName;
      publicProfile.agentLicenseNumber = profile.agentLicenseNumber;
      publicProfile.yearsOfExperience = profile.yearsOfExperience;
      publicProfile.specialization = profile.specialization;
      publicProfile.bio = profile.bio;
      publicProfile.website = profile.website;
      publicProfile.linkedinProfile = profile.linkedinProfile;
      publicProfile.averageRating = profile.averageRating;
      publicProfile.totalReviews = profile.totalReviews;
      publicProfile.city = profile.city;
      publicProfile.state = profile.state;
    } else if (type === "owner") {
      publicProfile.companyName = profile.companyName;
      publicProfile.ownerType = profile.ownerType;
      publicProfile.bio = profile.bio;
      publicProfile.website = profile.website;
      publicProfile.totalProperties = profile.totalProperties;
      publicProfile.activeListings = profile.activeListings;
      publicProfile.averageRating = profile.averageRating;
      publicProfile.totalReviews = profile.totalReviews;
      publicProfile.city = profile.city;
      publicProfile.state = profile.state;
    }
    // For seekers, only basic info is public

    return res.status(200).json({
      message: "Profile retrieved successfully",
      profile: publicProfile,
    });
  } catch (error) {
    console.error("Error getting profile by ID:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Update user's profile (works for all profile types)
 */
async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let validatedData, existingProfile, updatedProfile;

    // Handle different profile types
    switch (userRole) {
      case 'seeker':
        validatedData = await updateProfileSchema.validateAsync(req.body);
        existingProfile = await findProfileByUserId(userId);
        if (!existingProfile) {
          return res.status(404).json({ message: "Seeker profile not found" });
        }
        const mergedSeekerData = { ...existingProfile.toJSON(), ...validatedData };
        const seekerIsComplete = checkProfileCompletion(mergedSeekerData);
        updatedProfile = await updateProfile(userId, { ...validatedData, isComplete: seekerIsComplete });
        break;

      case 'broker':
        validatedData = await updateBrokerProfileSchema.validateAsync(req.body);
        existingProfile = await findBrokerProfileByUserId(userId);
        if (!existingProfile) {
          return res.status(404).json({ message: "Broker profile not found" });
        }
        const mergedBrokerData = { ...existingProfile.toJSON(), ...validatedData };
        const brokerIsComplete = checkBrokerProfileCompletion(mergedBrokerData);
        updatedProfile = await updateBrokerProfile(userId, { ...validatedData, isComplete: brokerIsComplete });
        break;

      case 'owner':
        validatedData = await updateOwnerProfileSchema.validateAsync(req.body);
        existingProfile = await findOwnerProfileByUserId(userId);
        if (!existingProfile) {
          return res.status(404).json({ message: "Owner profile not found" });
        }
        const mergedOwnerData = { ...existingProfile.toJSON(), ...validatedData };
        const ownerIsComplete = checkOwnerProfileCompletion(mergedOwnerData);
        updatedProfile = await updateOwnerProfile(userId, { ...validatedData, isComplete: ownerIsComplete });
        break;

      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Upload profile picture
 */
async function uploadProfilePicture(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No profile picture uploaded",
      });
    }

    const profilePictureUrl = req.file.path; // Cloudinary URL

    const updatedProfile = await updateProfile(userId, {
      profilePicture: profilePictureUrl,
    }, userRole);

    if (!updatedProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Get all profiles with filtering
 */
async function getAllUserProfiles(req, res) {
  try {
    const { state, role, isVerified, gender } = req.query;

    const filters = {};
    if (state) filters.state = state;
    if (role) filters.role = role;
    if (isVerified !== undefined) filters.isVerified = isVerified === "true";
    if (gender) filters.gender = gender;

    const profiles = await getAllProfiles(filters);

    return res.status(200).json({
      message: "Profiles retrieved successfully",
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Error getting all profiles:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Get profiles by role (agents, owners, or seekers)
 */
async function getProfilesByUserRole(req, res) {
  try {
    const { role } = req.params;
    const { state, isVerified, isActive, minRating, budgetMin, budgetMax } = req.query;

    if (!["agent", "owner", "seeker"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'agent', 'owner', or 'seeker'",
      });
    }

    const filters = {};
    if (state) filters.state = state;
    if (isVerified !== undefined) filters.isVerified = isVerified === "true";
    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (minRating) filters.minRating = parseFloat(minRating);
    if (budgetMin) filters.budgetMin = parseFloat(budgetMin);
    if (budgetMax) filters.budgetMax = parseFloat(budgetMax);

    const profiles = await getProfilesByRole(role, filters);

    return res.status(200).json({
      message: `${role} profiles retrieved successfully`,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Error getting profiles by role:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Delete user's profile
 */
async function deleteUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const deleted = await deleteProfile(userId, userRole);
    if (!deleted) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Update verification status (Admin only)
 */
async function updateProfileVerification(req, res) {
  try {
    const { userId } = req.params;
    const { isVerified, role } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        message: "isVerified must be a boolean value",
      });
    }

    if (!role || !["agent", "owner", "seeker"].includes(role)) {
      return res.status(400).json({
        message: "Valid role is required (agent, owner, or seeker)",
      });
    }

    const updatedProfile = await updateVerificationStatus(userId, isVerified, role);
    if (!updatedProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      message: `Profile ${isVerified ? "verified" : "unverified"} successfully`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Upload verification documents
 */
async function uploadVerificationDocuments(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const validatedData = await verificationDocumentsSchema.validateAsync(req.body);

    const updatedProfile = await updateProfile(userId, {
      verificationDocuments: validatedData.documents,
    }, userRole);

    if (!updatedProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      message: "Verification documents uploaded successfully",
      documents: validatedData.documents,
    });
  } catch (error) {
    console.error("Error uploading verification documents:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map(detail => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  createSeekerProfile,
  createBrokerProfileHandler,
  createOwnerProfileHandler,
  createSeekerPreferences,
  updateSeekerPreferences,
  getMyProfile,
  getProfileById,
  updateUserProfile,
  uploadProfilePicture,
  getAllUserProfiles,
  getProfilesByUserRole,
  deleteUserProfile,
  updateProfileVerification,
  uploadVerificationDocuments,
};