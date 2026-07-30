const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");

const MainProperty = sequelize.define(
  "Listing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    intent: {
      type: DataTypes.ENUM("RENT", "BUY", "SHORTLET", "SWAP"),
      allowNull: false,
    },
    propertyType: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: "NGN" },
    location: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    bedrooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    bathrooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    sittingRooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    images: { type: DataTypes.JSON, defaultValue: [] },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPopular: { type: DataTypes.BOOLEAN, defaultValue: false },
    approvalStatus: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    // Independent of approvalStatus: moderation decides whether a listing may
    // be seen, availability decides whether it is still on the market.
    availabilityStatus: {
      type: DataTypes.ENUM("AVAILABLE", "RESERVED", "SOLD"),
      allowNull: false,
      defaultValue: "AVAILABLE",
    },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
    reviewedBy: { type: DataTypes.UUID, allowNull: true },
    submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "properties",
    timestamps: true,
    // Deleting a listing has to leave its inspection and review history intact:
    // a Property Review is a seeker's account of a visit that really happened,
    // and it should not vanish because the owner withdrew the advert. Paranoid
    // mode keeps deleted listings out of every read that does not opt in.
    paranoid: true,
  }
);

module.exports = { MainProperty };
