const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");
const { upload } = require("../../middleware/upload");

const {
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
} = require("./controller");

const router = express.Router();

// Public routes
router.get("/public/:id", getProfileById); // Get public profile by ID (requires type query param: seeker/Agent/Owner)
router.get("/role/:role", getProfilesByUserRole); // Get profiles by role (Agent/Owner/seeker)

// Protected routes (require authentication)
router.use(authenticate); // Apply authentication middleware to all routes below

// Profile creation routes (separate for each type)
router.post("/seeker", authorize(["seeker"]), createSeekerProfile); // Create seeker profile
router.post("/broker", authorize(["broker"]), createBrokerProfileHandler); // Create broker profile
router.post("/owner", authorize(["owner"]), createOwnerProfileHandler); // Create owner profile

// Seeker preferences routes (only for seekers)
router.post("/seeker/preferences", authorize(["seeker"]), createSeekerPreferences); // Create seeker preferences
router.put("/seeker/preferences", authorize(["seeker"]), updateSeekerPreferences); // Update seeker preferences

// General profile management
router.get("/me", getMyProfile); // Get own profile (works for all types)
router.put("/", updateUserProfile); // Update own profile (works for all types)
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