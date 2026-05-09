const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");

// Profile model - Personal information from Figma design (for seekers)
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
    // Personal Information fields from Figma design
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
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
    ninVerification: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field as shown in design
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Profile completion status
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Profiles",
    timestamps: true,
    indexes: [
      { fields: ["stateOfResidence"] },
    ],
  }
);

// BrokerProfile model - For real estate brokers/agents
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
    // Personal Information fields from Figma design
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
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
    ninVerification: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field as shown in design
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Agency Information from Figma design
    agencyCompanyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agentLicenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
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
    indexes: [
      { fields: ["stateOfResidence"] },
      { fields: ["isVerified"] },
    ],
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
        model: "Profiles", // Reference the Profile table
        key: "id",
      },
      unique: true,
    },
    // Property preferences
    preferredPropertyType: {
      type: DataTypes.ENUM("apartment", "house", "condo", "townhouse", "studio", "any"),
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
    // Employment and income information
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    employmentStatus: {
      type: DataTypes.ENUM("employed", "self_employed", "unemployed", "student", "retired"),
      allowNull: true,
    },
    // Address preferences
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
        model: "Profiles", // Reference the Profile table
        key: "id",
      },
      unique: true,
    },
    // Verification data
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Credit and background check
    creditScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 300, max: 850 },
    },
    backgroundCheckStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "not_requested"),
      defaultValue: "not_requested",
    },
    // Activity tracking
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
    // Status
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

// OwnerProfile model - For property owners
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
    // Personal Information fields from Figma design
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
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
    ninVerification: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field as shown in design
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Owner-specific: Agency Information from Figma design
    agencyCompanyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agentLicenseNumber: {
      type: DataTypes.STRING,
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
    indexes: [
      { fields: ["stateOfResidence"] },
      { fields: ["isVerified"] },
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

SeekerPreference.belongsTo(Profile, { foreignKey: "profileId", as: "profile" });
Profile.hasOne(SeekerPreference, { foreignKey: "profileId", as: "preferences" });

UserActivity.belongsTo(Profile, { foreignKey: "profileId", as: "profile" });
Profile.hasOne(UserActivity, { foreignKey: "profileId", as: "activity" });

module.exports = {
  Profile,
  BrokerProfile,
  OwnerProfile,
  SeekerPreference,
  UserActivity,
};
