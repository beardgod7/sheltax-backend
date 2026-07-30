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
      allowNull: true, // Password is set AFTER OTP verification
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ninVerification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    governmentId: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ninCacDocument: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    businessRegistrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brokerProfileType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Owner profile fields (step 2)
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyTypes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    listingIntent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Broker organization fields (step 2)
    agencyCompanyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyYearsOfExistence: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operatingLocations: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companySize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    portfolioSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Registration progress tracking
    registrationStep: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    kycStatus: {
      type: DataTypes.STRING,
      defaultValue: "UNSUBMITTED",
      allowNull: false,
    },
    kycLevel: {
      type: DataTypes.STRING,
      defaultValue: "BASIC",
      allowNull: true,
    },
    kycRejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
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
        // Only hash password if it exists (not for OAuth or new signup flow)
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
