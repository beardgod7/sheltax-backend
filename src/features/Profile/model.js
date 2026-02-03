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
      { unique: true, fields: ["userId"] },
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
      allowNull: true, // Optional as shown in design
    },
    agentLicenseNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Optional as shown in design
    },
    // Additional professional fields
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 50 },
    },
    specialization: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedinProfile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Address information (optional)
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Broker verification and ratings
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
      validate: { min: 0, max: 5 },
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Professional status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
      { unique: true, fields: ["userId"] },
      { fields: ["stateOfResidence"] },
      { fields: ["isVerified"] },
      { fields: ["isActive"] },
      { fields: ["averageRating"] },
      { fields: ["agencyCompanyName"] },
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
      { unique: true, fields: ["profileId"] },
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
      { unique: true, fields: ["profileId"] },
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
    // Owner-specific fields
    ownerType: {
      type: DataTypes.ENUM("individual", "company", "investment_group"),
      allowNull: false,
      defaultValue: "individual",
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for individual owners
    },
    businessRegistrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Address information (optional)
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Additional fields
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Owner verification
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Property management stats
    totalProperties: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activeListings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Owner ratings
    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
      validate: { min: 0, max: 5 },
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
      { unique: true, fields: ["userId"] },
      { fields: ["stateOfResidence"] },
      { fields: ["ownerType"] },
      { fields: ["isVerified"] },
      { fields: ["isActive"] },
      { fields: ["averageRating"] },
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