const {
  createUser,
  findUserByEmail,
  saveVerificationCode,
  findUserById,
  updateUser,
  getAllUsersWithProfiles,
  findOrCreateGoogleUser,
  findOrCreateTwitterUser,
  findOrCreateFacebookUser,
} = require("./repository");

const Userhash = require("../../utils/bcrypt");
const {
  signupSchema,
  setPasswordSchema,
  completeOwnerProfileSchema,
  completeBrokerProfileSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  googleOAuthSchema,
  twitterOAuthSchema,
  facebookOAuthSchema,
} = require("./schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generatetoken");
const {
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
  sendResetCodeEmail,
} = require("../../service/emailservice");
const { User, Token } = require("./model");
const { getPagination, paginatedData } = require("../../utils/pagination");

// Function to get user by ID
const getUsersById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user by ID: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Signup - New flow: collects user info + role, no password yet.
 * Password is set after OTP verification via /auth/set-password
 */
async function signup(req, res, next) {
  try {
    const validatedData = await signupSchema.validateAsync(req.body);

    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({ message: "Account already exists!" });
    }

    // Build user data
    const newUserData = {
      email: validatedData.email.toLowerCase(),
      role: validatedData.role || "seeker",
      firstName: validatedData.firstName,
      surname: validatedData.surname,
      phoneNumber: validatedData.phoneNumber,
      ninVerification: validatedData.ninVerification || null,
      brokerProfileType: validatedData.brokerProfileType || null,
      yearsOfExperience: validatedData.yearsOfExperience || null,
      bio: validatedData.bio || null,
      specialization: validatedData.specialization || null,
      signup_channel: "manual",
    };

    const newUser = await createUser(newUserData);

    // Send OTP immediately for ALL roles after signup
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await Token.create({
      userId: newUser.id,
      token: verificationCode,
      token_type: "verify_account",
      expiresIn: Date.now() + 300000,
    });

    try {
      await sendVerificationCodeEmail(newUser.email, verificationCode);
    } catch (emailErr) {
      console.error("Email sending failed: ", emailErr);
    }

    return res.status(201).json({
      message: "Account created successfully! Please check your email to verify your account.",
      userId: newUser.id,
      nextStep: "verify-otp",
    });
  } catch (err) {
    console.error("Signup Error: ", err);
    if (err.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.details.map((d) => d.message),
      });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}

/**
 * Set Password - called after OTP verification.
 * User must be verified before they can set their password.
 */
async function setPassword(req, res, next) {
  try {
    const validatedData = await setPasswordSchema.validateAsync(req.body);

    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email first.",
      });
    }

    let setupClaims;
    try {
      setupClaims = jwt.verify(validatedData.setupToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Password setup session is invalid or expired." });
    }
    if (setupClaims.scope !== "password_setup" || setupClaims.id !== user.id) {
      return res.status(401).json({ message: "Password setup session is invalid." });
    }

    if (user.password) {
      return res.status(400).json({
        message: "Password has already been set. Use forgot-password to reset.",
      });
    }

    // Hash and save password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    user.password = hashedPassword;
    await user.save();

    // Generate tokens so user is logged in after setting password
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken = jwt.verify(
      refreshTokenValue,
      process.env.JWT_SECRET
    );

    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: "Password set successfully. You are now logged in.",
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
    });
  } catch (err) {
    console.error("Set Password Error: ", err);
    if (err.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.details.map((d) => d.message),
      });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}

/**
 * Complete Profile - Step 2 for Owner/Broker.
 * Owner: location, propertyTypes, listingIntent, ownerType
 * Broker: agencyCompanyName, companyYearsOfExistence, operatingLocations, companySize, portfolioSummary
 */
async function completeProfile(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let validatedData;
    if (user.role === "owner") {
      validatedData = await completeOwnerProfileSchema.validateAsync(req.body);
      user.location = validatedData.location;
      user.propertyTypes = validatedData.propertyTypes;
      user.listingIntent = validatedData.listingIntent;
      user.ownerType = validatedData.ownerType;
    } else if (user.role === "broker") {
      validatedData = await completeBrokerProfileSchema.validateAsync(req.body);
      user.agencyCompanyName = validatedData.agencyCompanyName || null;
      user.companyYearsOfExistence = validatedData.companyYearsOfExistence || null;
      user.operatingLocations = validatedData.operatingLocations;
      user.companySize = validatedData.companySize || null;
      user.portfolioSummary = validatedData.portfolioSummary || null;
    } else {
      return res.status(400).json({ message: "This step is only for owner or broker roles." });
    }

    user.registrationStep = 2;
    await user.save();

    return res.status(200).json({
      message: "Profile information saved successfully.",
      registrationStep: 2,
    });
  } catch (err) {
    console.error("Complete Profile Error: ", err);
    if (err.isJoi) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.details.map((d) => d.message),
      });
    }
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}

/**
 * Verify Identity - Step 3 for Owner/Broker.
 * Accepts file uploads: profilePicture, governmentId, ninCacDocument
 */
async function verifyIdentity(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role !== "owner" && user.role !== "broker") {
      return res.status(400).json({ message: "This step is only for owner or broker roles." });
    }

    // Handle file uploads - files come from multer middleware
    if (req.files) {
      if (req.files.profilePicture && req.files.profilePicture[0]) {
        user.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.governmentId && req.files.governmentId[0]) {
        user.governmentId = req.files.governmentId[0].path;
      }
      if (req.files.ninCacDocument && req.files.ninCacDocument[0]) {
        user.ninCacDocument = req.files.ninCacDocument[0].path;
      }
    }

    user.registrationStep = 3;
    await user.save();

    // Now send OTP for verification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Token.destroy({ where: { userId: user.id, token_type: "verify_account" } });
    await Token.create({
      userId: user.id,
      token: verificationCode,
      token_type: "verify_account",
      expiresIn: Date.now() + 300000,
    });

    try {
      await sendVerificationCodeEmail(user.email, verificationCode);
    } catch (emailErr) {
      console.error("Email sending failed: ", emailErr);
    }

    return res.status(200).json({
      message: "Identity documents uploaded successfully. OTP sent to your email.",
      registrationStep: 3,
    });
  } catch (err) {
    console.error("Verify Identity Error: ", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}

// Admin Signup
async function AdminSignup(req, res, next) {
  try {
    req.body.role = "admin";
    return signup(req, res, next);
  } catch (err) {
    console.error("Error in Admin signup:", err);
    return res
      .status(400)
      .json({ message: "Error in Admin signup", error: err.message });
  }
}

// Email verification
async function verifyEmail(req, res, next) {
  try {
    let code = req.params.code || req.body?.code || req.body?.otp;
    const email = req.body?.email || req.query?.email;

    if (typeof code === "string") {
      code = code.replace(/^:/, "").trim();
    }

    if (!code) {
      return res
        .status(400)
        .json({ message: "Verification code is required." });
    }

    let tokenRecord;
    if (email) {
      const userByEmail = await findUserByEmail(email);
      if (userByEmail) {
        tokenRecord = await Token.findOne({
          where: { userId: userByEmail.id, token: code, token_type: "verify_account" },
        });
      }
    }
    if (!tokenRecord) {
      tokenRecord = await Token.findOne({
        where: { token: code, token_type: "verify_account" },
      });
    }

    if (!tokenRecord) {
      console.error(`No token record found for code: ${code}`);
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    if (new Date(tokenRecord.expiresIn).getTime() < Date.now()) {
      console.error(`Token expired at: ${tokenRecord.expiresIn}`);
      return res
        .status(400)
        .json({ message: "Verification code has expired." });
    }

    const user = await User.findByPk(tokenRecord.userId);

    if (!user) {
      console.error(`No user found for userId: ${tokenRecord.userId}`);
      return res.status(404).json({ message: "User not found." });
    }
    user.verified = true;
    await user.save();

    console.log(`User ${user.email} verified successfully.`);

    await Token.destroy({ where: { token: code } });

    return res.status(200).json({
      message: "Account verified. Set your password to complete registration.",
      setupToken: jwt.sign(
        { id: user.id, scope: "password_setup" },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      ),
      email: user.email,
      role: user.role,
      verification: true,
      id: user.id,
    });
  } catch (error) {
    console.error("Verification Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Resends the verification email for a user.
 */
async function resendVerificationCode(req, res) {
  try {
    const validatedData = await resendVerificationSchema.validateAsync(
      req.body
    );
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    await Token.destroy({
      where: {
        userId: user.id,
        token_type: "verify_account",
      },
    });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await Token.create({
      userId: user.id,
      token: verificationCode,
      token_type: "verify_account",
      expiresIn: Date.now() + 300000,
    });

    await sendVerificationCodeEmail(user.email, verificationCode);

    return res
      .status(200)
      .json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Error resending verification code:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// Login
async function login(req, res, next) {
  try {
    const validatedData = await signinSchema.validateAsync(req.body);
    let identifier = validatedData.identifier || validatedData.email;
    const { password } = validatedData;

    // Convert email to lowercase if identifier is an email
    const isEmail = identifier.includes("@");
    if (isEmail) {
      identifier = identifier.toLowerCase();
    }

    // Find user by email (case-insensitive) or username
    const user = isEmail
      ? await findUserByEmail(identifier)
      : await User.findOne({ where: { username: identifier } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials - user not found." });
    }

    // Check that the user has set a password
    if (!user.password) {
      return res.status(403).json({
        message:
          "Password not set. Please complete your registration by setting a password.",
      });
    }

    if (!user.verified) {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await Token.destroy({
        where: { userId: user.id, token_type: "verify_account" },
      });

      await Token.create({
        userId: user.id,
        token: verificationCode,
        token_type: "verify_account",
        expiresIn: Date.now() + 300000,
      });

      await sendVerificationCodeEmail(user.email, verificationCode);

      return res.status(403).json({
        message:
          "Account not verified. A new verification code has been sent to your email address.",
      });
    }

    const isMatch = await Userhash.comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials - password mismatch." });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);
    const Role = user.role;
    const verify = user.verified;

    const decodedRefreshToken = jwt.verify(
      refreshTokenValue,
      process.env.JWT_SECRET
    );
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }
    return res.status(200).json({
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      role: Role,
      verification: verify,
      id: user.id,
    });
  } catch (error) {
    console.error("Login Error: ", error);
    next(error);
  }
}

// Refresh Token Function
async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const storedToken = await Token.findOne({
      where: { token: refresh_token, token_type: "refresh_token" },
    });

    if (!storedToken || storedToken.expiresIn < Date.now()) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);

    const refreshUser = await User.findByPk(decoded.sub);
    if (!refreshUser) {
      return res.status(403).json({ message: "Invalid refresh token user." });
    }
    const newAccessToken = generateAccessToken(refreshUser.id, refreshUser.role);
    const newRefreshToken = generateRefreshToken(decoded.sub);

    const decodedNewRefreshToken = jwt.verify(
      newRefreshToken,
      process.env.JWT_SECRET
    );

    storedToken.token = newRefreshToken;
    storedToken.expiresIn = new Date(decodedNewRefreshToken.exp * 1000);
    await storedToken.save();

    return res.status(200).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Logout Function
async function logout(req, res, next) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is missing." });
    }

    const deletedToken = await Token.destroy({
      where: { token: refresh_token, token_type: "refresh_token" },
    });

    if (!deletedToken) {
      return res
        .status(400)
        .json({ message: "Invalid or non-existent refresh token." });
    }

    return res
      .status(200)
      .json({ message: "Logout successful. Refresh token invalidated." });
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Forgot Password - Send Reset Code (expires in 5 minutes)
async function forgotPassword(req, res, next) {
  try {
    const validatedData = await forgotPasswordSchema.validateAsync(req.body);

    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email address." });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Token.create({
      userId: user.id,
      token: resetCode,
      token_type: "reset_password",
      expiresIn: Date.now() + 5 * 60 * 1000,
    });

    await sendResetCodeEmail(user.email, resetCode);

    return res.status(200).json({
      message:
        "A reset code has been sent to your email. It is valid for 5 minutes.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

// Reset Password Function
async function resetPassword(req, res, next) {
  try {
    const validatedData = await resetPasswordSchema.validateAsync(req.body);

    const tokenRecord = await Token.findOne({
      where: { token: validatedData.token, token_type: "reset_password" },
    });

    if (!tokenRecord || tokenRecord.expiresIn < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    user.password = hashedPassword;
    await user.save();

    await Token.destroy({ where: { token: validatedData.token } });

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// create super admin
async function createSuperAdmin() {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.error("Super admin credentials are missing in the .env file.");
      return;
    }
    const existingAdmin = await User.findOne({
      where: { email: superAdminEmail, role: "super_admin" },
    });
    if (existingAdmin) {
      return;
    }
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    await User.create({
      username: "SuperAdmin",
      email: superAdminEmail,
      password: hashedPassword,
      role: "super_admin",
      signup_channel: "manual",
      verified: true,
    });
    console.log("Super admin account created successfully.");
  } catch (err) {
    console.error("Error creating super admin:", err);
  }
}

async function approveUser(req, res, next) {
  try {
    const userId = req.params.id;
    const updates = { isApproved: true };

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User approved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    next(error);
  }
}

async function getUsers(req, res) {
  try {
    const pagination = getPagination(req.query);
    const { count, rows: users } = await getAllUsersWithProfiles(pagination);
    return res
      .status(200)
      .json({
        success: true,
        message: "Users fetched successfully",
        data: paginatedData("users", users, count, pagination),
      });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Google OAuth Login/Signup
async function googleOAuth(req, res, next) {
  try {
    const validatedData = await googleOAuthSchema.validateAsync(req.body);
    const { idToken } = validatedData;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        message: "Google account email is not verified",
      });
    }

    const user = await findOrCreateGoogleUser({
      email: email.toLowerCase(),
      username: name,
      googleId: payload.sub,
      profilePicture: picture,
      verified: true,
      signup_channel: "google",
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken = jwt.verify(
      refreshTokenValue,
      process.env.JWT_SECRET
    );
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: user.isNewUser
        ? "Account created successfully with Google"
        : "Login successful",
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: user.isNewUser,
    });
  } catch (error) {
    console.error("Google OAuth Error: ", error);
    if (
      error.message.includes("Token used too early") ||
      error.message.includes("Invalid token")
    ) {
      return res.status(400).json({
        message: "Invalid Google token",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

// Twitter OAuth Login/Signup
async function twitterOAuth(req, res, next) {
  try {
    const validatedData = await twitterOAuthSchema.validateAsync(req.body);
    const { oauth_token, oauth_verifier } = validatedData;

    const twitterResponse = await axios.post(
      "https://api.twitter.com/oauth/access_token",
      `oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const responseData = new URLSearchParams(twitterResponse.data);
    const accessToken = responseData.get("oauth_token");
    const accessTokenSecret = responseData.get("oauth_token_secret");
    const userId = responseData.get("user_id");
    const screenName = responseData.get("screen_name");

    if (!accessToken || !userId) {
      return res.status(400).json({
        message: "Invalid Twitter OAuth response",
      });
    }

    const userProfileResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}?user.fields=profile_image_url,public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    const twitterUser = userProfileResponse.data.data;

    const userData = {
      email: null,
      username: twitterUser.username || screenName,
      twitterId: userId,
      profilePicture: twitterUser.profile_image_url,
    };

    const user = await findOrCreateTwitterUser(userData);

    const accessTokenJWT = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken = jwt.verify(
      refreshTokenValue,
      process.env.JWT_SECRET
    );
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: user.isNewUser
        ? "Account created successfully with Twitter"
        : "Login successful",
      access_token: accessTokenJWT,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: user.isNewUser,
    });
  } catch (error) {
    console.error("Twitter OAuth Error: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

// Facebook OAuth Login/Signup
async function facebookOAuth(req, res, next) {
  try {
    const validatedData = await facebookOAuthSchema.validateAsync(req.body);
    const { accessToken } = validatedData;

    const facebookResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    const facebookUser = facebookResponse.data;

    if (!facebookUser.id) {
      return res.status(400).json({
        message: "Invalid Facebook access token",
      });
    }

    const userData = {
      email: facebookUser.email,
      username: facebookUser.name,
      facebookId: facebookUser.id,
      profilePicture: facebookUser.picture?.data?.url,
    };

    const user = await findOrCreateFacebookUser(userData);

    const accessTokenJWT = generateAccessToken(user.id, user.role);
    const refreshTokenValue = generateRefreshToken(user.id);

    const decodedRefreshToken = jwt.verify(
      refreshTokenValue,
      process.env.JWT_SECRET
    );
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshTokenValue;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshTokenValue,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: user.isNewUser
        ? "Account created successfully with Facebook"
        : "Login successful",
      access_token: accessTokenJWT,
      refresh_token: refreshTokenValue,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: user.isNewUser,
    });
  } catch (error) {
    console.error("Facebook OAuth Error: ", error);
    if (error.response?.status === 400) {
      return res.status(400).json({
        message: "Invalid Facebook access token",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  signup,
  setPassword,
  completeProfile,
  verifyIdentity,
  verifyEmail,
  resendVerificationCode,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  AdminSignup,
  createSuperAdmin,
  getUsersById,
  approveUser,
  getUsers,
  googleOAuth,
  twitterOAuth,
  facebookOAuth,
};
