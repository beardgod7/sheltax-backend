const {
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
} = require("./repository");

const {
  getProfileSchema,
  profilePictureSchema,
  verificationDocumentsSchema,
} = require("./schema");

/**
 * Create a new profile
 */
async function createUserProfile(req, res) {
  try {
    const userId = req.user.id; // From authentication middleware
    const userRole = req.user.role; // Get user role from token
    
    // Get the appropriate schema for the user's role
    const schema = getProfileSchema(userRole, 'create');
    const validatedData = await schema.validateAsync(req.body);

    // Check if profile already exists
    const existingProfile = await findProfileByUserId(userId, userRole);
    if (existingProfile) {
      return res.status(409).json({
        message: "Profile already exists for this user",
      });
    }

    // Check profile completion
    const isComplete = checkProfileCompletion(validatedData, userRole);

    const profileData = {
      ...validatedData,
      userId,
      isComplete,
    };

    const newProfile = await createProfile(profileData, userRole);

    return res.status(201).json({
      message: "Profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
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
 * Get user's own profile
 */
async function getMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const profile = await findProfileByUserId(userId, userRole);
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
    const { role } = req.query; // Role should be provided as query parameter

    if (!role || !["agent", "owner", "seeker"].includes(role)) {
      return res.status(400).json({
        message: "Valid role parameter is required (agent, owner, or seeker)",
      });
    }

    const profile = await findProfileById(id, role);
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
      city: profile.city,
      state: profile.state,
      isVerified: profile.isVerified,
      user: {
        role: profile.user.role,
      },
      createdAt: profile.createdAt,
    };

    // Add role-specific public fields
    if (role === "agent") {
      publicProfile.companyName = profile.companyName;
      publicProfile.yearsOfExperience = profile.yearsOfExperience;
      publicProfile.specialization = profile.specialization;
      publicProfile.bio = profile.bio;
      publicProfile.website = profile.website;
      publicProfile.linkedinProfile = profile.linkedinProfile;
      publicProfile.averageRating = profile.averageRating;
      publicProfile.totalReviews = profile.totalReviews;
    } else if (role === "owner") {
      publicProfile.companyName = profile.companyName;
      publicProfile.ownerType = profile.ownerType;
      publicProfile.bio = profile.bio;
      publicProfile.website = profile.website;
      publicProfile.totalProperties = profile.totalProperties;
      publicProfile.activeListings = profile.activeListings;
      publicProfile.averageRating = profile.averageRating;
      publicProfile.totalReviews = profile.totalReviews;
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
 * Update user's profile
 */
async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get the appropriate schema for the user's role
    const schema = getProfileSchema(userRole, 'update');
    const validatedData = await schema.validateAsync(req.body);

    const existingProfile = await findProfileByUserId(userId, userRole);
    if (!existingProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    // Check profile completion after update
    const mergedData = { ...existingProfile.toJSON(), ...validatedData };
    const isComplete = checkProfileCompletion(mergedData, userRole);

    const updateData = {
      ...validatedData,
      isComplete,
    };

    const updatedProfile = await updateProfile(userId, updateData, userRole);

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
  createUserProfile,
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