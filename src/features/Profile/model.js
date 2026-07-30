const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");

// Profile model - Personal information (for seekers)
const Profile = sequelize.define(
  "Profile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      unique: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    stateOfResidence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Profiles",
    timestamps: true,
    indexes: [{ fields: ["stateOfResidence"] }],
  }
);

// BrokerProfile model - Step 2 profile info for brokers
const BrokerProfile = sequelize.define(
  "BrokerProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      unique: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    // Broker Step 2 fields
    agencyCompanyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyYearsOfExistence: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operatingLocations: {
      type: DataTypes.JSON,
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
    // Verification (Step 3)
    profilePicture: {
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
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "BrokerProfiles",
    timestamps: true,
    indexes: [{ fields: ["isVerified"] }],
  }
);

// OwnerProfile model - Step 2 profile info for owners
const OwnerProfile = sequelize.define(
  "OwnerProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      unique: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    // Owner Step 2 fields
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyTypes: {
      type: DataTypes.JSON,
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
    // Verification (Step 3)
    profilePicture: {
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
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "OwnerProfiles",
    timestamps: true,
    indexes: [{ fields: ["isVerified"] }],
  }
);

// SeekerPreference model - Property preferences and search criteria
const SeekerPreference = sequelize.define(
  "SeekerPreference",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Profiles",
        key: "id",
      },
      unique: true,
    },
    preferredPropertyType: {
      type: DataTypes.ENUM(
        "apartment",
        "house",
        "condo",
        "townhouse",
        "studio",
        "any"
      ),
      allowNull: true,
    },
    preferredLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    budgetMin: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    budgetMax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    preferredBedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 10 },
    },
    preferredBathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 10 },
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    employmentStatus: {
      type: DataTypes.ENUM(
        "employed",
        "self_employed",
        "unemployed",
        "student",
        "retired"
      ),
      allowNull: true,
    },
    preferredCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredZipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "SeekerPreferences",
    timestamps: true,
    indexes: [
      { fields: ["preferredPropertyType"] },
      { fields: ["budgetMin", "budgetMax"] },
      { fields: ["employmentStatus"] },
    ],
  }
);

// UserActivity model - Activity tracking and verification data
const UserActivity = sequelize.define(
  "UserActivity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Profiles",
        key: "id",
      },
      unique: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    creditScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 300, max: 850 },
    },
    backgroundCheckStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "not_requested"),
      defaultValue: "not_requested",
    },
    totalInquiries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalApplications: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalViewedProperties: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalSavedProperties: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastActivityDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "UserActivities",
    timestamps: true,
    indexes: [
      { fields: ["isVerified"] },
      { fields: ["isActive"] },
      { fields: ["backgroundCheckStatus"] },
      { fields: ["lastActivityDate"] },
    ],
  }
);

// Define associations
Profile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Profile, { foreignKey: "userId", as: "profile" });

BrokerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(BrokerProfile, { foreignKey: "userId", as: "brokerProfile" });

OwnerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(OwnerProfile, { foreignKey: "userId", as: "ownerProfile" });

SeekerPreference.belongsTo(Profile, {
  foreignKey: "profileId",
  as: "profile",
});
Profile.hasOne(SeekerPreference, {
  foreignKey: "profileId",
  as: "preferences",
});

UserActivity.belongsTo(Profile, { foreignKey: "profileId", as: "profile" });
Profile.hasOne(UserActivity, { foreignKey: "profileId", as: "activity" });

module.exports = {
  Profile,
  BrokerProfile,
  OwnerProfile,
  SeekerPreference,
  UserActivity,
};
