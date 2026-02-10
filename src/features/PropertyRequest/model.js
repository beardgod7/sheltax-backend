const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");

// Property Request Model - Seekers post requests, Brokers/Owners can view and respond
const PropertyRequest = sequelize.define(
  "PropertyRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seekerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    // Request category
    category: {
      type: DataTypes.ENUM("rent", "buy", "shortlet"),
      allowNull: false,
      comment: "Type of property request"
    },
    // Budget information
    minimumBudget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    maximumBudget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "NGN",
    },
    // Location preferences
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    locality: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Specific area/neighborhood"
    },
    // Property specifications
    numberOfBedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 20 },
    },
    numberOfBathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 20 },
    },
    propertyType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Preferred property type (apartment, house, etc.)"
    },
    // Additional information
    otherInformation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional details or special requirements"
    },
    // Request status
    status: {
      type: DataTypes.ENUM("active", "fulfilled", "cancelled", "expired"),
      allowNull: false,
      defaultValue: "active",
    },
    // Urgency
    urgency: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },
    // Move-in date (for rent/shortlet)
    desiredMoveInDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Duration (for shortlet)
    stayDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Duration in days for shortlet requests"
    },
    // Response tracking
    responseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Expiry
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Request expiration date"
    },
  },
  {
    tableName: "PropertyRequests",
    timestamps: true,
    indexes: [
      { fields: ["seekerId"] },
      { fields: ["category"] },
      { fields: ["state"] },
      { fields: ["status"] },
      { fields: ["urgency"] },
      { fields: ["minimumBudget"] },
      { fields: ["maximumBudget"] },
      { fields: ["createdAt"] },
      { fields: ["expiresAt"] },
    ],
  }
);

// Property Request Response Model - Brokers/Owners respond to requests
const PropertyRequestResponse = sequelize.define(
  "PropertyRequestResponse",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PropertyRequest,
        key: "id",
      },
    },
    responderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      comment: "Broker or Owner responding to the request"
    },
    // Response details
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Property details (if offering a specific property)
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Reference to a specific property listing (optional)"
    },
    propertyType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    propertyImages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of image URLs"
    },
    propertyDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Contact information
    contactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    // Response status
    status: {
      type: DataTypes.ENUM("pending", "viewed", "interested", "rejected", "accepted"),
      allowNull: false,
      defaultValue: "pending",
    },
    // Seeker feedback
    seekerFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seekerRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
    },
  },
  {
    tableName: "PropertyRequestResponses",
    timestamps: true,
    indexes: [
      { fields: ["requestId"] },
      { fields: ["responderId"] },
      { fields: ["status"] },
      { fields: ["createdAt"] },
    ],
  }
);

// Define associations
PropertyRequest.belongsTo(User, { foreignKey: "seekerId", as: "seeker" });
User.hasMany(PropertyRequest, { foreignKey: "seekerId", as: "propertyRequests" });

PropertyRequestResponse.belongsTo(PropertyRequest, { foreignKey: "requestId", as: "request" });
PropertyRequest.hasMany(PropertyRequestResponse, { foreignKey: "requestId", as: "responses" });

PropertyRequestResponse.belongsTo(User, { foreignKey: "responderId", as: "responder" });
User.hasMany(PropertyRequestResponse, { foreignKey: "responderId", as: "requestResponses" });

module.exports = {
  PropertyRequest,
  PropertyRequestResponse,
};