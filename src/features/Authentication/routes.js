const express = require("express");
const leakyBucketLimiter = require("../../middleware/ratelimitter");
//const { validateJwt } = require("../../middlewares/auth");
const {
  signup,
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
const router = express.Router();

// Signup routes
router.post("/signup", signup);
router.post("/google-oauth", googleOAuth);
router.post("/twitter-oauth", twitterOAuth);
router.post("/facebook-oauth", facebookOAuth);
router.patch("/approve/:id", approveUser);

//router.post("/admin-signup", validateJwt(["SuperAdmin"]), AdminSignup);
router.get("/all-user", getUsers);
router.post("/login", leakyBucketLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/verify/:code", verifyEmail);
router.post("/resend-verification", leakyBucketLimiter, resendVerificationCode);
router.post("/forgot-password", leakyBucketLimiter, forgotPassword);
router.post("/reset-password", leakyBucketLimiter, resetPassword);
router.get("/user/:id", getUsersById);

module.exports = router;
