const express = require("express");
const leakyBucketLimiter = require("../../middleware/ratelimitter");
const {
  signup,
  setPassword,
  completeProfile,
  verifyIdentity,
  login,
  refreshToken,
  logout,
  AdminSignup,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  getUsersById,
  approveUser,
  getUsers,
  googleOAuth,
  twitterOAuth,
  facebookOAuth,
} = require("./controller");
const { upload } = require("../../middleware/upload");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");
const router = express.Router();

// Signup routes (multi-step registration)
router.post("/signup", signup);
router.post("/complete-profile", authenticate, authorize(["owner", "broker"]), completeProfile);
router.post("/verify-identity", authenticate, authorize(["owner", "broker"]), upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "governmentId", maxCount: 1 },
  { name: "ninCacDocument", maxCount: 1 },
]), verifyIdentity);
router.post("/set-password", setPassword);
router.post("/google-oauth", googleOAuth);
router.post("/twitter-oauth", twitterOAuth);
router.post("/facebook-oauth", facebookOAuth);
router.patch("/approve/:id", authenticate, authorize(["admin", "super_admin"]), approveUser);
router.get("/all-user", authenticate, authorize(["admin", "super_admin"]), getUsers);
router.post("/login", leakyBucketLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/verify/:code", verifyEmail);
router.post("/verify", verifyEmail);
router.post("/verify-otp", verifyEmail);
router.post("/resend-verification", leakyBucketLimiter, resendVerificationCode);
router.post("/forgot-password", leakyBucketLimiter, forgotPassword);
router.post("/reset-password", leakyBucketLimiter, resetPassword);
router.get("/user/:id", authenticate, authorize(["admin", "super_admin"]), getUsersById);

module.exports = router;
