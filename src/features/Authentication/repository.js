const { User, Token } = require("./model");
const { Op, Sequelize } = require("sequelize");

// Create a new user
/**
 * Creates a new user in the database.
 * @param {Object} data - The user data.
 * @returns {Promise<User>} - The newly created user.
 */
async function createUser(data) {
  try {
    const user = await User.create(data);
    return user;
  } catch (error) {
    console.error("Full Error Object:", error);
    if (error.name === "SequelizeValidationError") {
      console.error(
        "Validation error details:",
        error.errors.map((err) => err.message)
      );
    }
    throw error;
  }
}

async function updateUser(userId, updates) {
  try {
    const result = await User.update(updates, {
      where: { id: userId },
      returning: true,
    });
    return result[1][0];
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Finds a user by their email.
 * @param {string} email - The user's email.
 * @returns {Promise<User|null>} - The user if found, otherwise null.
 */
async function findUserByEmail(email) {
  return await User.findOne({
    where: {
      email: { [Op.iLike]: email },
    },
  });
}

/**
 * Finds a user by their ID.
 * @param {string} userId - The user's ID.
 * @returns {Promise<User|null>} - The user if found, otherwise null.
 */
async function findUserById(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Saves the verification code for a user.
 * @param {string} userId - The user's ID.
 * @param {string} code - The verification code.
 * @returns {Promise<Object>} - The saved token record.
 */
async function saveVerificationCode(userId, code) {
  return await Token.create({
    userId,
    token: code,
    token_type: "verify_account",
    expiresIn: Date.now() + 3600000, // 1 hour
  });
}

/**
 * Stores a refresh token in the database.
 * @param {string} userId - The user's ID.
 * @param {string} token - The refresh token.
 * @returns {Promise<Token>} - The created token entry.
 */
async function storeRefreshToken(userId, token) {
  try {
    const newToken = await Token.create({
      userId,
      token,
      token_type: "refresh_token",
    });
    return newToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Finds a refresh token by its token string.
 * @param {string} token - The refresh token.
 * @returns {Promise<Token|null>} - The token entry if found, otherwise null.
 */
async function findRefreshToken(token) {
  try {
    const storedToken = await Token.findOne({
      where: { token, token_type: "refresh_token" },
    });
    if (!storedToken) {
      return null;
    }
    return storedToken;
  } catch (error) {
    throw error;
  }
}
async function getAllUsersWithProfiles() {
  try {
    return await User.findAll({});
  } catch (error) {
    console.error("Error fetching users with profiles:", error);
    throw error;
  }
}

/**
 * Finds or creates a user for Google OAuth.
 * @param {Object} userData - The user data from Google.
 * @returns {Promise<User>} - The user with isNewUser flag.
 */
async function findOrCreateGoogleUser(userData) {
  try {
    // First try to find user by email
    let user = await User.findOne({
      where: {
        email: { [Op.iLike]: userData.email },
      },
    });

    let isNewUser = false;

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId && userData.googleId) {
        user.googleId = userData.googleId;
        user.profilePicture = userData.profilePicture;
        user.signup_channel = "google";
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: userData.email,
        username: userData.username,
        googleId: userData.googleId,
        profilePicture: userData.profilePicture,
        signup_channel: userData.signup_channel,
        verified: userData.verified,
        role: "seeker",
      });
      isNewUser = true;
    }

    // Add isNewUser flag to the user object
    user.isNewUser = isNewUser;
    return user;
  } catch (error) {
    console.error("Error in findOrCreateGoogleUser:", error);
    throw error;
  }
}

/**
 * Finds or creates a user for Twitter OAuth.
 * @param {Object} userData - The user data from Twitter.
 * @returns {Promise<User>} - The user with isNewUser flag.
 */
async function findOrCreateTwitterUser(userData) {
  try {
    // First try to find user by Twitter ID
    let user = await User.findOne({
      where: {
        twitterId: userData.twitterId,
      },
    });

    let isNewUser = false;

    if (!user && userData.email) {
      // Try to find by email if Twitter ID not found
      user = await User.findOne({
        where: {
          email: { [Op.iLike]: userData.email },
        },
      });

      if (user) {
        // User exists with email, update Twitter ID
        user.twitterId = userData.twitterId;
        user.profilePicture = userData.profilePicture || user.profilePicture;
        await user.save();
      }
    }

    if (!user) {
      // Create new user
      user = await User.create({
        email: userData.email,
        username: userData.username,
        twitterId: userData.twitterId,
        profilePicture: userData.profilePicture,
        signup_channel: "twitter",
        verified: true, // Twitter accounts are considered verified
        role: "seeker",
      });
      isNewUser = true;
    }

    // Add isNewUser flag to the user object
    user.isNewUser = isNewUser;
    return user;
  } catch (error) {
    console.error("Error in findOrCreateTwitterUser:", error);
    throw error;
  }
}

/**
 * Finds or creates a user for Facebook OAuth.
 * @param {Object} userData - The user data from Facebook.
 * @returns {Promise<User>} - The user with isNewUser flag.
 */
async function findOrCreateFacebookUser(userData) {
  try {
    // First try to find user by Facebook ID
    let user = await User.findOne({
      where: {
        facebookId: userData.facebookId,
      },
    });

    let isNewUser = false;

    if (!user && userData.email) {
      // Try to find by email if Facebook ID not found
      user = await User.findOne({
        where: {
          email: { [Op.iLike]: userData.email },
        },
      });

      if (user) {
        // User exists with email, update Facebook ID
        user.facebookId = userData.facebookId;
        user.profilePicture = userData.profilePicture || user.profilePicture;
        await user.save();
      }
    }

    if (!user) {
      // Create new user
      user = await User.create({
        email: userData.email,
        username: userData.username,
        facebookId: userData.facebookId,
        profilePicture: userData.profilePicture,
        signup_channel: "facebook",
        verified: true, // Facebook accounts are considered verified
        role: "seeker",
      });
      isNewUser = true;
    }

    // Add isNewUser flag to the user object
    user.isNewUser = isNewUser;
    return user;
  } catch (error) {
    console.error("Error in findOrCreateFacebookUser:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  saveVerificationCode,
  storeRefreshToken,
  findRefreshToken,
  updateUser,
  getAllUsersWithProfiles,
  findOrCreateGoogleUser,
  findOrCreateTwitterUser,
  findOrCreateFacebookUser,
};
