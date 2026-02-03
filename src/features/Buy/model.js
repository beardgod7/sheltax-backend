const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");

// Sale Property Model - Based on Figma design
const SaleProperty = sequelize.define(
  "SaleProperty",
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
      type: DataTypes.ENUM("apartment", "house", "duplex", "bungalow", "flat", "room", "studio", "land", "commercial"),
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
    // Sale pricing
    salePrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "NGN",
    },
    // Property specifications from Figma
    propertyAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Age of property in years",
    },
    landSize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Land size in square meters",
    },
    builtUpArea: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Built-up area in square meters",
    },
    // Legal documents
    titleDocument: {
      type: DataTypes.ENUM("certificate_of_occupancy", "deed_of_assignment", "survey_plan", "governors_consent", "other"),
      allowNull: true,
    },
    // Property features and amenities
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
    // Property status
    status: {
      type: DataTypes.ENUM("active", "sold", "inactive", "under_review"),
      allowNull: false,
      defaultValue: "active",
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
      defaultValue: "buy",
    },
  },
  {
    tableName: "SaleProperties",
    timestamps: true,
    indexes: [
      { fields: ["ownerId"] },
      { fields: ["propertyType"] },
      { fields: ["city"] },
      { fields: ["state"] },
      { fields: ["area"] },
      { fields: ["salePrice"] },
      { fields: ["bedrooms"] },
      { fields: ["bathrooms"] },
      { fields: ["status"] },
      { fields: ["isVerified"] },
      { fields: ["isFeatured"] },
      { fields: ["tag"] },
      { fields: ["createdAt"] },
    ],
  }
);

// Sale Inquiry model
const SaleInquiry = sequelize.define(
  "SaleInquiry",
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
        model: SaleProperty,
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
      type: DataTypes.ENUM("purchase_inquiry", "viewing_request", "price_negotiation", "general_question"),
      defaultValue: "purchase_inquiry",
    },
    offerAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Buyer's offer amount if making an offer",
    },
    preferredViewingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "responded", "viewing_scheduled", "offer_made", "closed"),
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
    tableName: "SaleInquiries",
    timestamps: true,
    indexes: [
      { fields: ["propertyId"] },
      { fields: ["inquirerId"] },
      { fields: ["status"] },
      { fields: ["inquiryType"] },
    ],
  }
);

// Sale Favorite model
const SaleFavorite = sequelize.define(
  "SaleFavorite",
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
        model: SaleProperty,
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
    tableName: "SaleFavorites",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["propertyId", "userId"] },
      { fields: ["userId"] },
    ],
  }
);

// Define associations
SaleProperty.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
User.hasMany(SaleProperty, { foreignKey: "ownerId", as: "saleProperties" });

SaleInquiry.belongsTo(SaleProperty, { foreignKey: "propertyId", as: "property" });
SaleProperty.hasMany(SaleInquiry, { foreignKey: "propertyId", as: "inquiries" });

SaleInquiry.belongsTo(User, { foreignKey: "inquirerId", as: "inquirer" });
User.hasMany(SaleInquiry, { foreignKey: "inquirerId", as: "saleInquiries" });

SaleFavorite.belongsTo(SaleProperty, { foreignKey: "propertyId", as: "property" });
SaleProperty.hasMany(SaleFavorite, { foreignKey: "propertyId", as: "favorites" });

SaleFavorite.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(SaleFavorite, { foreignKey: "userId", as: "favoriteSales" });

module.exports = {
  SaleProperty,
  SaleInquiry,
  SaleFavorite,
};