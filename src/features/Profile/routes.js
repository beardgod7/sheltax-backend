const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");
const { upload } = require("../../middleware/upload");

const {
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
} = require("./controller");

const router = express.Router();

// Public routes
router.get("/public/:id", getProfileById);
router.get("/role/:role", getProfilesByUserRole);

// Protected routes (require authentication)
router.use(authenticate);

// Profile creation routes (separate for each type)
router.post("/seeker", authorize(["seeker"]), createSeekerProfile);
router.post("/broker", authorize(["broker"]), createBrokerProfileHandler);
router.post("/owner", authorize(["owner"]), createOwnerProfileHandler);

// Identity verification routes (Step 3 for owner/broker)
router.post(
  "/owner/verify-identity",
  authorize(["owner"]),
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "ninCacDocument", maxCount: 1 },
  ]),
  verifyOwnerIdentity
);

router.post(
  "/broker/verify-identity",
  authorize(["broker"]),
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "ninCacDocument", maxCount: 1 },
  ]),
  verifyBrokerIdentity
);

// Seeker preferences routes (only for seekers)
router.post(
  "/seeker/preferences",
  authorize(["seeker"]),
  createSeekerPreferences
);
router.put(
  "/seeker/preferences",
  authorize(["seeker"]),
  updateSeekerPreferences
);

// General profile management
router.get("/me", getMyProfile);
router.put("/", updateUserProfile);
router.delete("/", deleteUserProfile);

// Profile picture upload
router.post("/picture", upload.single("profilePicture"), uploadProfilePicture);

// Verification documents
router.post("/verification-documents", uploadVerificationDocuments);

// Admin routes
router.get("/", authorize(["admin", "super_admin"]), getAllUserProfiles);
router.patch(
  "/verify/:userId",
  authorize(["admin", "super_admin"]),
  updateProfileVerification
);

module.exports = router;
