const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");
const { upload } = require("../../middleware/upload");

const {
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
} = require("./controller");

const router = express.Router();

// Public routes
router.get("/public/:id", getProfileById); // Get public profile by ID (requires role query param)
router.get("/role/:role", getProfilesByUserRole); // Get profiles by role (agent/owner/seeker)

// Protected routes (require authentication)
router.use(authenticate); // Apply authentication middleware to all routes below

// User profile management
router.post("/", createUserProfile); // Create profile
router.get("/me", getMyProfile); // Get own profile
router.put("/", updateUserProfile); // Update own profile
router.delete("/", deleteUserProfile); // Delete own profile

// Profile picture upload
router.post("/picture", upload.single("profilePicture"), uploadProfilePicture);

// Verification documents
router.post("/verification-documents", uploadVerificationDocuments);

// Admin routes
router.get("/", authorize(["admin", "super_admin"]), getAllUserProfiles); // Get all profiles
router.patch(
  "/verify/:userId",
  authorize(["admin", "super_admin"]),
  updateProfileVerification
); // Update verification status

module.exports = router;