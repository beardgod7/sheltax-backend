const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");

// Rental Property Model - Based on Figma design
const RentalProperty = sequelize.define(
  "RentalProperty",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    // Basic property information
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    propertyType: {
      type: DataTypes.ENUM("apartment", "house", "duplex", "bungalow", "flat", "room", "studio"),
      allowNull: false,
    },
    // Location information
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Specific area/neighborhood"
    },
    // Property details
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 20 },
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 20 },
    },
    toilets: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 20 },
    },
    // Rental pricing
    rentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "NGN",
    },
    rentPeriod: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
      defaultValue: "yearly",
    },
    securityDeposit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    agentFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    serviceFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    // Property features
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of features like ['Furnished', 'Parking', 'Generator', 'Balcony']"
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of amenities like ['Swimming Pool', 'Gym', 'Security', 'Elevator']"
    },
    // Media
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of image URLs"
    },
    virtualTourUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Availability
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Property status
    status: {
      type: DataTypes.ENUM("active", "rented", "inactive", "under_review"),
      allowNull: false,
      defaultValue: "active",
    },
    // Listing status for admin/moderation
    listingStatus: {
      type: DataTypes.ENUM("pending", "active", "rejected", "expired"),
      allowNull: false,
      defaultValue: "pending",
      comment: "Moderation status of the listing"
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Reason for rejection if listing is rejected"
    },
    // Verification
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Featured listing
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    featuredUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Tag field to identify property type
    tag: {
      type: DataTypes.ENUM("rent", "buy", "swap", "shortlet"),
      allowNull: false,
      defaultValue: "rent",
    },
  },
  {
    tableName: "RentalProperties",
    timestamps: true,
    indexes: [
      { fields: ["ownerId"] },
      { fields: ["propertyType"] },
      { fields: ["city"] },
      { fields: ["state"] },
      { fields: ["area"] },
      { fields: ["rentAmount"] },
      { fields: ["bedrooms"] },
      { fields: ["bathrooms"] },
      { fields: ["status"] },
      { fields: ["isAvailable"] },
      { fields: ["isVerified"] },
      { fields: ["isFeatured"] },
      { fields: ["tag"] },
      { fields: ["createdAt"] },
    ],
  }
);

// Rental Inquiry model
const RentalInquiry = sequelize.define(
  "RentalInquiry",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: RentalProperty,
        key: "id",
      },
    },
    inquirerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    inquirerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inquirerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    inquirerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inquiryType: {
      type: DataTypes.ENUM("viewing_request", "rental_inquiry", "general_question"),
      defaultValue: "rental_inquiry",
    },
    preferredViewingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "responded", "viewing_scheduled", "closed"),
      defaultValue: "pending",
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "RentalInquiries",
    timestamps: true,
    indexes: [
      { fields: ["propertyId"] },
      { fields: ["inquirerId"] },
      { fields: ["status"] },
      { fields: ["inquiryType"] },
      { fields: ["createdAt"] },
    ],
  }
);

// Rental Favorite model
const RentalFavorite = sequelize.define(
  "RentalFavorite",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: RentalProperty,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "RentalFavorites",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["propertyId", "userId"] },
      { fields: ["userId"] },
      { fields: ["propertyId"] },
    ],
  }
);

// Define associations
RentalProperty.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
User.hasMany(RentalProperty, { foreignKey: "ownerId", as: "rentalProperties" });

RentalInquiry.belongsTo(RentalProperty, { foreignKey: "propertyId", as: "property" });
RentalProperty.hasMany(RentalInquiry, { foreignKey: "propertyId", as: "inquiries" });

RentalInquiry.belongsTo(User, { foreignKey: "inquirerId", as: "inquirer" });
User.hasMany(RentalInquiry, { foreignKey: "inquirerId", as: "rentalInquiries" });

RentalFavorite.belongsTo(RentalProperty, { foreignKey: "propertyId", as: "property" });
RentalProperty.hasMany(RentalFavorite, { foreignKey: "propertyId", as: "favorites" });

RentalFavorite.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RentalFavorite, { foreignKey: "userId", as: "favoriteRentals" });

module.exports = {
  RentalProperty,
  RentalInquiry,
  RentalFavorite,
};