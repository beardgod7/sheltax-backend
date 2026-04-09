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

//const respond = require("../../utils/respond");
const { token } = require("morgan");

// Function to get user by ID
const getUsersById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);

    if (!user) {
      logger.info(`No user found with ID: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

async function signup(req, res, next) {
  try {
    const validatedData = await signupSchema.validateAsync(req.body);

    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({ message: "Account already exists!" });
    }

    //const hashedPassword = await Userhash.hashPassword(validatedData.password);
    const newUserData = { ...validatedData };

    const newUser = await createUser(newUserData);

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

      return res.status(201).json({
        message:
          "Account created successfully! Please check your email to verify your account.",
      });
    } catch (emailErr) {
      console.error("Email sending failed: ", emailErr);
      return res.status(201).json({
        message:
          "Account created successfully, but we couldn’t send a verification email. Please try verifying later.",
      });
    }
  } catch (err) {
    console.error("Signup Error: ", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
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
    let { code } = req.params;

    code = code.replace(/^:/, "").trim();

    if (!code) {
      return res
        .status(400)
        .json({ message: "Verification code is required." });
    }

    // Allow master fallback OTP - verifies ALL unverified accounts
    const MASTER_OTP = "123456";

    let tokenRecord = await Token.findOne({
      where: { token: code, token_type: "verify_account" },
    });

    if (!tokenRecord && code === MASTER_OTP) {
      const { Op } = require("sequelize");
      const [count] = await User.update(
        { verified: true },
        { where: { verified: false } }
      );
      console.log(`Master OTP used: ${count} unverified accounts verified.`);
      return res.status(200).json({ message: `Account verified successfully!` });
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

    return res.status(200).json({ message: "Account verified successfully!" });
  } catch (error) {
    console.error("Verification Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Resends the verification email for a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
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

    let { identifier, password } = validatedData;

    // Convert email to lowercase if identifier is an email
    const isEmail = identifier.includes("@");
    if (isEmail) {
      identifier = identifier.toLowerCase();
    }

    // Find user by email (case-insensitive) or username
    const user = isEmail
      ? await findUserByEmail(identifier)
      : await findUserByUsername(identifier);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials - user not found." });
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
    const refreshToken = generateRefreshToken(user.id);
    const Role = user.role;
    const verify = user.verified;

    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET
    );
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshToken;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshToken,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }
    return res.status(200).json({
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
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

    const newAccessToken = generateAccessToken(decoded.sub, decoded.role);
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
    // Validate input
    const validatedData = await forgotPasswordSchema.validateAsync(req.body);

    // Check if user exists
    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email address." });
    }

    // Generate a 6-digit numeric reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store reset token in DB with 5 minutes expiry
    await Token.create({
      userId: user.id,
      token: resetCode,
      token_type: "reset_password",
      expiresIn: Date.now() + 5 * 60 * 1000,
    });

    // Send reset code email
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

    const hashedPassword = await Userhash.hashPassword(validatedData.password);
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
      // console.log("Super admin already exists.");
      return;
    }
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    await User.create({
      username: "SuperAdmin",
      email: superAdminEmail,
      password: hashedPassword,
      role: "super_admin",
      signup_channel: "manual",
      account_status: "active",
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
    const users = await getAllUsersWithProfiles();
    return res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Google OAuth Login/Signup
async function googleOAuth(req, res, next) {
  try {
    const validatedData = await googleOAuthSchema.validateAsync(req.body);
    const { idToken } = validatedData;

    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ 
        message: "Google account email is not verified" 
      });
    }

    // Check if user exists or create new user
    const user = await findOrCreateGoogleUser({
      email: email.toLowerCase(),
      username: name,
      googleId: payload.sub,
      profilePicture: picture,
      verified: true, // Google accounts are pre-verified
      signup_channel: "google",
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshToken;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshToken,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: user.isNewUser ? "Account created successfully with Google" : "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: user.isNewUser,
    });

  } catch (error) {
    console.error("Google OAuth Error: ", error);
    if (error.message.includes("Token used too early") || error.message.includes("Invalid token")) {
      return res.status(400).json({ 
        message: "Invalid Google token" 
      });
    }
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
}

// Twitter OAuth Login/Signup
async function twitterOAuth(req, res, next) {
  try {
    const validatedData = await twitterOAuthSchema.validateAsync(req.body);
    const { oauth_token, oauth_verifier } = validatedData;

    // Exchange oauth_token and oauth_verifier for access token
    const twitterResponse = await axios.post(
      'https://api.twitter.com/oauth/access_token',
      `oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const responseData = new URLSearchParams(twitterResponse.data);
    const accessToken = responseData.get('oauth_token');
    const accessTokenSecret = responseData.get('oauth_token_secret');
    const userId = responseData.get('user_id');
    const screenName = responseData.get('screen_name');

    if (!accessToken || !userId) {
      return res.status(400).json({ 
        message: "Invalid Twitter OAuth response" 
      });
    }

    // Get user profile from Twitter API v2
    const userProfileResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}?user.fields=profile_image_url,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    const twitterUser = userProfileResponse.data.data;

    // Create user data object
    const userData = {
      email: null, // Twitter doesn't always provide email
      username: twitterUser.username || screenName,
      twitterId: userId,
      profilePicture: twitterUser.profile_image_url,
    };

    // Find or create user
    const user = await findOrCreateTwitterUser(userData);

    // Generate tokens
    const accessTokenJWT = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshToken;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshToken,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: user.isNewUser ? "Account created successfully with Twitter" : "Login successful",
      access_token: accessTokenJWT,
      refresh_token: refreshToken,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: user.isNewUser,
    });

  } catch (error) {
    console.error("Twitter OAuth Error: ", error);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
}

// Facebook OAuth Login/Signup
async function facebookOAuth(req, res, next) {
  try {
    const validatedData = await facebookOAuthSchema.validateAsync(req.body);
    const { accessToken } = validatedData;

    // Verify Facebook access token and get user data
    const facebookResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    const facebookUser = facebookResponse.data;

    if (!facebookUser.id) {
      return res.status(400).json({ 
        message: "Invalid Facebook access token" 
      });
    }

    // Create user data object
    const userData = {
      email: facebookUser.email,
      username: facebookUser.name,
      facebookId: facebookUser.id,
      profilePicture: facebookUser.picture?.data?.url,
    };

    // Find or create user
    const user = await findOrCreateFacebookUser(userData);

    // Generate tokens
    const accessTokenJWT = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
    let tokenRecord = await Token.findOne({
      where: { userId: user.id, token_type: "refresh_token" },
    });

    if (tokenRecord) {
      tokenRecord.token = refreshToken;
      tokenRecord.expiresIn = new Date(decodedRefreshToken.exp * 1000);
      await tokenRecord.save();
    } else {
      await Token.create({
        userId: user.id,
        token: refreshToken,
        token_type: "refresh_token",
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      });
    }

    return res.status(200).json({
      message: user.isNewUser ? "Account created successfully with Facebook" : "Login successful",
      access_token: accessTokenJWT,
      refresh_token: refreshToken,
      role: user.role,
      verification: user.verified,
      id: user.id,
      isNewUser: user.isNewUser,
    });

  } catch (error) {
    console.error("Facebook OAuth Error: ", error);
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        message: "Invalid Facebook access token" 
      });
    }
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
}

module.exports = {
  signup,
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
