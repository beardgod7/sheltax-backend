const { DataTypes, Op } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const Userhash = require("../../utils/bcrypt");

// User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for Google OAuth users
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    twitterId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    facebookId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    signup_channel: {
      type: DataTypes.ENUM("manual", "google", "twitter", "facebook"),
      allowNull: false,
      defaultValue: "manual",
    },
    role: {
      type: DataTypes.ENUM("seeker", "owner", "broker", "admin", "super_admin"),
      allowNull: false,
      defaultValue: "seeker",
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "User",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        unique: true,
        fields: ["googleId"],
        where: {
          googleId: {
            [Op.ne]: null,
          },
        },
      },
      {
        unique: true,
        fields: ["twitterId"],
        where: {
          twitterId: {
            [Op.ne]: null,
          },
        },
      },
      {
        unique: true,
        fields: ["facebookId"],
        where: {
          facebookId: {
            [Op.ne]: null,
          },
        },
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        // Only hash password if it exists (not for Google OAuth users)
        if (user.password) {
          await Userhash.hashPassword(user);
        }
      },
    },
  }
);

// Token model for refresh tokens
const Token = sequelize.define(
  "Token",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    token_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "refresh_token",
    },
    expiresIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "Tokens2",
    timestamps: false,
  }
);

module.exports = {
  User,
  Token,
};
