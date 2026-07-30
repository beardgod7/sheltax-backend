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

const { findUserById } = require("../Authentication/repository");
const { User } = require("../Authentication/model");
const cloudinary = require("../../config/cloudinary");
const { getPagination, paginatedData } = require("../../utils/pagination");

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
 * Helper: Upload buffer to Cloudinary
 */
async function uploadToCloudinary(fileBuffer, folder, resourceType = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Create a new seeker profile
 */
async function createSeekerProfile(req, res) {
  try {
    const userId = req.user.sub;

    const validatedData = await createProfileSchema.validateAsync(req.body);

    const existingProfile = await findProfileByUserId(userId);
    if (existingProfile) {
      return res
        .status(409)
        .json({ message: "Profile already exists for this user" });
    }

    // Auto-populate email from User record
    const user = await findUserById(userId);
    const emailAddress = user.email;

    const isComplete = checkProfileCompletion({
      ...validatedData,
      emailAddress,
    });
    const newProfile = await createProfile(
      { ...validatedData, emailAddress, isComplete },
      userId
    );

    return res.status(201).json({
      message: "Seeker profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating seeker profile:", error);
    if (error.isJoi)
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

/**
 * Create a new broker profile (Step 2)
 */
async function createBrokerProfileHandler(req, res) {
  try {
    const userId = req.user.sub;

    const validatedData = await createBrokerProfileSchema.validateAsync(
      req.body
    );

    const existingProfile = await findBrokerProfileByUserId(userId);
    if (existingProfile) {
      return res
        .status(409)
        .json({ message: "Broker profile already exists for this user" });
    }

    // Auto-populate email from User record
    const user = await findUserById(userId);
    const emailAddress = user.email;

    const isComplete = checkBrokerProfileCompletion({
      ...validatedData,
      emailAddress,
    });
    const newProfile = await createBrokerProfile(
      { ...validatedData, emailAddress, isComplete },
      userId
    );

    return res.status(201).json({
      message: "Broker profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating broker profile:", error);
    if (error.isJoi)
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

/**
 * Create a new owner profile (Step 2)
 */
async function createOwnerProfileHandler(req, res) {
  try {
    const userId = req.user.sub;

    const validatedData = await createOwnerProfileSchema.validateAsync(
      req.body
    );

    const existingProfile = await findOwnerProfileByUserId(userId);
    if (existingProfile) {
      return res
        .status(409)
        .json({ message: "Owner profile already exists for this user" });
    }

    // Auto-populate email from User record
    const user = await findUserById(userId);
    const emailAddress = user.email;

    const isComplete = checkOwnerProfileCompletion({
      ...validatedData,
      emailAddress,
    });
    const newProfile = await createOwnerProfile(
      { ...validatedData, emailAddress, isComplete },
      userId
    );

    return res.status(201).json({
      message: "Owner profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating owner profile:", error);
    if (error.isJoi)
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

/**
 * Verify Identity for Owner (Step 3)
 * Accepts: profilePicture, governmentId, ninCacDocument (multipart files)
 */
async function verifyOwnerIdentity(req, res) {
  try {
    const userId = req.user.sub;

    const existingProfile = await findOwnerProfileByUserId(userId);
    if (!existingProfile) {
      return res.status(404).json({
        message: "Owner profile not found. Please complete Step 2 first.",
      });
    }

    const files = req.files;
    if (!files || (!files.profilePicture && !files.governmentId && !files.ninCacDocument)) {
      return res.status(400).json({
        message:
          "At least one verification document is required (profilePicture, governmentId, or ninCacDocument).",
      });
    }

    const updateData = {};

    if (files.profilePicture && files.profilePicture[0]) {
      updateData.profilePicture = await uploadToCloudinary(
        files.profilePicture[0].buffer,
        "owner-verification/profile-pictures"
      );
    }

    if (files.governmentId && files.governmentId[0]) {
      updateData.governmentId = await uploadToCloudinary(
        files.governmentId[0].buffer,
        "owner-verification/government-ids"
      );
    }

    if (files.ninCacDocument && files.ninCacDocument[0]) {
      updateData.ninCacDocument = await uploadToCloudinary(
        files.ninCacDocument[0].buffer,
        "owner-verification/nin-cac-documents"
      );
    }

    // Store documents in verificationDocuments JSON as well
    updateData.verificationDocuments = {
      profilePicture: updateData.profilePicture || existingProfile.profilePicture,
      governmentId: updateData.governmentId || existingProfile.governmentId,
      ninCacDocument: updateData.ninCacDocument || existingProfile.ninCacDocument,
      submittedAt: new Date().toISOString(),
    };

    const updatedProfile = await updateOwnerProfile(userId, updateData);

    return res.status(200).json({
      message: "Owner identity verification documents uploaded successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error in owner identity verification:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

/**
 * Verify Identity for Broker (Step 3)
 * Accepts: profilePicture, governmentId, ninCacDocument (multipart files)
 */
async function verifyBrokerIdentity(req, res) {
  try {
    const userId = req.user.sub;

    const existingProfile = await findBrokerProfileByUserId(userId);
    if (!existingProfile) {
      return res.status(404).json({
        message: "Broker profile not found. Please complete Step 2 first.",
      });
    }

    const files = req.files;
    if (!files || (!files.profilePicture && !files.governmentId && !files.ninCacDocument)) {
      return res.status(400).json({
        message:
          "At least one verification document is required (profilePicture, governmentId, or ninCacDocument).",
      });
    }

    const updateData = {};

    if (files.profilePicture && files.profilePicture[0]) {
      updateData.profilePicture = await uploadToCloudinary(
        files.profilePicture[0].buffer,
        "broker-verification/profile-pictures"
      );
    }

    if (files.governmentId && files.governmentId[0]) {
      updateData.governmentId = await uploadToCloudinary(
        files.governmentId[0].buffer,
        "broker-verification/government-ids"
      );
    }

    if (files.ninCacDocument && files.ninCacDocument[0]) {
      updateData.ninCacDocument = await uploadToCloudinary(
        files.ninCacDocument[0].buffer,
        "broker-verification/nin-cac-documents"
      );
    }

    // Store documents in verificationDocuments JSON as well
    updateData.verificationDocuments = {
      profilePicture: updateData.profilePicture || existingProfile.profilePicture,
      governmentId: updateData.governmentId || existingProfile.governmentId,
      ninCacDocument: updateData.ninCacDocument || existingProfile.ninCacDocument,
      submittedAt: new Date().toISOString(),
    };

    const updatedProfile = await updateBrokerProfile(userId, updateData);

    return res.status(200).json({
      message: "Broker identity verification documents uploaded successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error in broker identity verification:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

/**
 * Create seeker preferences
 */
async function createSeekerPreferences(req, res) {
  try {
    const userId = req.user.sub;

    const validatedData = await createSeekerPreferenceSchema.validateAsync(
      req.body
    );

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
        errors: error.details.map((detail) => detail.message),
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
    const userId = req.user.sub;

    const validatedData = await updateSeekerPreferenceSchema.validateAsync(
      req.body
    );

    const profile = await findProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({
        message: "Seeker profile not found",
      });
    }

    const updatedPreferences = await updateSeekerPreference(
      profile.id,
      validatedData
    );

    return res.status(200).json({
      message: "Seeker preferences updated successfully",
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating seeker preferences:", error);
    if (error.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
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
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;

    switch (user.role) {
      case "seeker":
        profile = await findProfileByUserId(user.id);
        break;
      case "broker":
        profile = await findBrokerProfileByUserId(user.id);
        break;
      case "owner":
        profile = await findOwnerProfileByUserId(user.id);
        break;
      case "admin":
      case "super_admin":
        return res.status(200).json({
          message: "Profile retrieved successfully",
          profile: null,
          hasProfile: false,
          user: user,
        });
      default:
        break;
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      profile: profile || null,
      hasProfile: !!profile,
      user: user,
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
    const { type } = req.query;

    if (!type || !["seeker", "broker", "owner"].includes(type)) {
      return res.status(400).json({
        message:
          "Valid type parameter is required (seeker, broker, or owner)",
      });
    }

    let profile = null;

    switch (type) {
      case "seeker":
        profile = await findProfileById(id);
        break;
      case "broker":
        profile = await findBrokerProfileById(id);
        break;
      case "owner":
        profile = await findOwnerProfileById(id);
        break;
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
    const userId = req.user.sub;
    const userRole = req.user.role;

    let validatedData, existingProfile, updatedProfile;

    switch (userRole) {
      case "seeker":
        validatedData = await updateProfileSchema.validateAsync(req.body);
        existingProfile = await findProfileByUserId(userId);
        if (!existingProfile) {
          return res
            .status(404)
            .json({ message: "Seeker profile not found" });
        }
        const mergedSeekerData = {
          ...existingProfile.toJSON(),
          ...validatedData,
        };
        const seekerIsComplete = checkProfileCompletion(mergedSeekerData);
        updatedProfile = await updateProfile(userId, {
          ...validatedData,
          isComplete: seekerIsComplete,
        });
        break;

      case "broker":
        validatedData = await updateBrokerProfileSchema.validateAsync(
          req.body
        );
        existingProfile = await findBrokerProfileByUserId(userId);
        if (!existingProfile) {
          return res
            .status(404)
            .json({ message: "Broker profile not found" });
        }
        const mergedBrokerData = {
          ...existingProfile.toJSON(),
          ...validatedData,
        };
        const brokerIsComplete =
          checkBrokerProfileCompletion(mergedBrokerData);
        updatedProfile = await updateBrokerProfile(userId, {
          ...validatedData,
          isComplete: brokerIsComplete,
        });
        break;

      case "owner":
        validatedData = await updateOwnerProfileSchema.validateAsync(
          req.body
        );
        existingProfile = await findOwnerProfileByUserId(userId);
        if (!existingProfile) {
          return res
            .status(404)
            .json({ message: "Owner profile not found" });
        }
        const mergedOwnerData = {
          ...existingProfile.toJSON(),
          ...validatedData,
        };
        const ownerIsComplete =
          checkOwnerProfileCompletion(mergedOwnerData);
        updatedProfile = await updateOwnerProfile(userId, {
          ...validatedData,
          isComplete: ownerIsComplete,
        });
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
        errors: error.details.map((detail) => detail.message),
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
    const userId = req.user.sub;
    const userRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({
        message: "No profile picture uploaded",
      });
    }

    // Upload to Cloudinary
    const profilePictureUrl = await uploadToCloudinary(
      req.file.buffer,
      "profile-pictures"
    );

    let updatedProfile;
    switch (userRole) {
      case "seeker":
        updatedProfile = await updateProfile(userId, {
          profilePicture: profilePictureUrl,
        });
        break;
      case "broker":
        updatedProfile = await updateBrokerProfile(userId, {
          profilePicture: profilePictureUrl,
        });
        break;
      case "owner":
        updatedProfile = await updateOwnerProfile(userId, {
          profilePicture: profilePictureUrl,
        });
        break;
      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

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

    const pagination = getPagination(req.query);
    const { count, rows: profiles } = await getAllProfiles(filters, pagination);

    return res.status(200).json({
      success: true,
      message: "Profiles retrieved successfully",
      data: paginatedData("profiles", profiles, count, pagination),
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
    const {
      state,
      isVerified,
      isActive,
      minRating,
      budgetMin,
      budgetMax,
    } = req.query;

    if (!["broker", "owner", "seeker"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'broker', 'owner', or 'seeker'",
      });
    }

    const filters = {};
    if (state) filters.state = state;
    if (isVerified !== undefined) filters.isVerified = isVerified === "true";
    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (minRating) filters.minRating = parseFloat(minRating);
    if (budgetMin) filters.budgetMin = parseFloat(budgetMin);
    if (budgetMax) filters.budgetMax = parseFloat(budgetMax);

    const pagination = getPagination(req.query);
    let result;
    switch (role) {
      case "seeker":
        result = await getAllProfiles(filters, pagination);
        break;
      case "broker":
        result = await getAllBrokerProfiles(filters, pagination);
        break;
      case "owner":
        result = await getAllOwnerProfiles(filters, pagination);
        break;
    }

    return res.status(200).json({
      success: true,
      message: `${role} profiles retrieved successfully`,
      data: paginatedData("profiles", result.rows, result.count, pagination),
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
    const userId = req.user.sub;
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

    if (!role || !["broker", "owner", "seeker"].includes(role)) {
      return res.status(400).json({
        message: "Valid role is required (broker, owner, or seeker)",
      });
    }

    let updatedProfile;
    switch (role) {
      case "seeker":
        updatedProfile = await updateVerificationStatus(userId, isVerified);
        break;
      case "broker":
        updatedProfile = await updateBrokerVerificationStatus(
          userId,
          isVerified
        );
        break;
      case "owner":
        updatedProfile = await updateOwnerVerificationStatus(
          userId,
          isVerified
        );
        break;
    }

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
    const userId = req.user.sub;
    const userRole = req.user.role;
    const validatedData = await verificationDocumentsSchema.validateAsync(
      req.body
    );

    let updatedProfile;
    switch (userRole) {
      case "seeker":
        updatedProfile = await updateProfile(userId, {
          verificationDocuments: validatedData.documents,
        });
        break;
      case "broker":
        updatedProfile = await updateBrokerProfile(userId, {
          verificationDocuments: validatedData.documents,
        });
        break;
      case "owner":
        updatedProfile = await updateOwnerProfile(userId, {
          verificationDocuments: validatedData.documents,
        });
        break;
      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

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
        errors: error.details.map((detail) => detail.message),
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

/**
 * Submit KYC verification (JSON payload from frontend)
 * Accepts: profilePictureUrl, governmentIdUrl, governmentIdType, ninNumber, ninDocumentUrl, cacDocumentUrl, businessRegistrationNumber
 */
async function submitKyc(req, res) {
  try {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    let {
      profilePictureUrl,
      governmentIdUrl,
      governmentIdType,
      ninNumber,
      ninDocumentUrl,
      cacDocumentUrl,
      businessRegistrationNumber,
    } = req.body || {};
    const missing = [];
    if (!profilePictureUrl) missing.push("profilePictureUrl");
    if (!governmentIdUrl) missing.push("governmentIdUrl");
    if (!ninNumber || !/^\d{11}$/.test(String(ninNumber).trim())) missing.push("valid 11-digit ninNumber");
    if (!ninDocumentUrl) missing.push("ninDocumentUrl");
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid Strong KYC fields: ${missing.join(", ")}`,
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!["owner", "broker"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Strong KYC is only available to Owners and Brokers." });
    }
    if (user.kycStatus === "APPROVED") {
      return res.status(409).json({ success: false, message: "Strong KYC is already approved." });
    }

    // Cloudinary helper for base64 strings
    const uploadIfBase64 = async (fileData, folder = "shelta-x/kyc") => {
      if (!fileData) return fileData;
      if (
        fileData.startsWith("data:image/") ||
        fileData.startsWith("data:application/")
      ) {
        try {
          const result = await cloudinary.uploader.upload(fileData, {
            folder,
            resource_type: "auto",
          });
          return result.secure_url;
        } catch (err) {
          console.error("Cloudinary upload failed in submitKyc:", err.message);
        }
      }
      return fileData;
    };

    profilePictureUrl = await uploadIfBase64(profilePictureUrl, "shelta-x/kyc/avatars");
    governmentIdUrl = await uploadIfBase64(governmentIdUrl, "shelta-x/kyc/government-ids");
    ninDocumentUrl = await uploadIfBase64(ninDocumentUrl, "shelta-x/kyc/nin");
    cacDocumentUrl = await uploadIfBase64(cacDocumentUrl, "shelta-x/kyc/cac");

    // Update user verification fields if present
    if (profilePictureUrl) user.profilePicture = profilePictureUrl;
    if (governmentIdUrl) user.governmentId = governmentIdUrl;
    if (ninNumber) user.ninVerification = ninNumber;
    if (businessRegistrationNumber) user.businessRegistrationNumber = businessRegistrationNumber;
    if (ninDocumentUrl || cacDocumentUrl) {
      user.ninCacDocument = ninDocumentUrl || cacDocumentUrl;
    }
    user.kycStatus = "PENDING";
    user.kycRejectionReason = null;
    await user.save();

    const { ReviewDecision } = require("../Listing/model");
    const lastCycle = await ReviewDecision.max("cycle", {
      where: { subjectType: "KYC", subjectId: user.id },
    });
    await ReviewDecision.create({
      subjectType: "KYC",
      subjectId: user.id,
      cycle: Number(lastCycle || 0) + 1,
      outcome: "SUBMITTED",
      submittedBy: user.id,
    });

    // Also update Owner/Broker profile table if exists
    if (user.role === "owner") {
      const ownerProfile = await findOwnerProfileByUserId(userId);
      if (ownerProfile) {
        if (profilePictureUrl) ownerProfile.profilePicture = profilePictureUrl;
        if (governmentIdUrl) ownerProfile.governmentId = governmentIdUrl;
        if (governmentIdType) ownerProfile.governmentIdType = governmentIdType;
        if (ninNumber) ownerProfile.ninCacNumber = ninNumber;
        if (businessRegistrationNumber) ownerProfile.businessRegistrationNumber = businessRegistrationNumber;
        await ownerProfile.save();
      }
    } else if (user.role === "broker") {
      const brokerProfile = await findBrokerProfileByUserId(userId);
      if (brokerProfile) {
        if (profilePictureUrl) brokerProfile.profilePicture = profilePictureUrl;
        if (governmentIdUrl) brokerProfile.governmentId = governmentIdUrl;
        if (governmentIdType) brokerProfile.governmentIdType = governmentIdType;
        if (ninNumber) brokerProfile.ninCacNumber = ninNumber;
        if (businessRegistrationNumber) brokerProfile.businessRegistrationNumber = businessRegistrationNumber;
        await brokerProfile.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "KYC documents submitted successfully and sent for admin review.",
      kycStatus: "PENDING",
      urls: {
        profilePictureUrl,
        governmentIdUrl,
        ninDocumentUrl,
        cacDocumentUrl,
      },
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  createSeekerProfile,
  createBrokerProfileHandler,
  createOwnerProfileHandler,
  verifyOwnerIdentity,
  verifyBrokerIdentity,
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
  submitKyc,
};
