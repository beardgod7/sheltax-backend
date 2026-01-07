const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");

// Base Profile model with common fields
const BaseProfile = sequelize.define(
  "BaseProfile",
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
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Address information
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
    // Profile completion status
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "BaseProfiles",
    timestamps: true,
  }
);

// Agent Profile model - for real estate agents
const AgentProfile = sequelize.define(
  "AgentProfile",
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
    // Personal Information (matching your Figma design)
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
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Agency Information (matching your Figma design)
    agencyCompanyName: {
      type: DataTypes.STRING,
      allowNull: true, // Optional as shown in design
    },
    agentLicense: {
      type: DataTypes.STRING,
      allowNull: true, // Optional as shown in design
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
    // Additional professional fields (for enhanced profile)
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
    // Agent verification and ratings
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
    tableName: "AgentProfiles",
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

// Owner Profile model - for property owners (similar to agent but without agency fields)
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
    // Personal Information (same as agent profile)
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
    profilePicture: {
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
    // Owner-specific fields (no agency information)
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

// Seeker Profile model - for property seekers
const SeekerProfile = sequelize.define(
  "SeekerProfile",
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
    // Personal Information (matching your Figma design)
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
    // Additional seeker-specific fields (for property matching)
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
    // Property preferences (for better matching)
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
    // Verification (for rental applications)
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDocuments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Credit and background check (for landlords)
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
    tableName: "SeekerProfiles",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["userId"] },
      { fields: ["stateOfResidence"] },
      { fields: ["employmentStatus"] },
      { fields: ["preferredPropertyType"] },
      { fields: ["budgetMin", "budgetMax"] },
      { fields: ["isVerified"] },
      { fields: ["isActive"] },
    ],
  }
);

// Define associations
AgentProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(AgentProfile, { foreignKey: "userId", as: "agentProfile" });

OwnerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(OwnerProfile, { foreignKey: "userId", as: "ownerProfile" });

SeekerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(SeekerProfile, { foreignKey: "userId", as: "seekerProfile" });

module.exports = {
  BaseProfile,
  AgentProfile,
  OwnerProfile,
  SeekerProfile,
};