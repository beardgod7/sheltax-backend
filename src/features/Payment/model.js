const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { Listing } = require("../Listing/model");
const { User } = require("../Authentication/model");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: { type: DataTypes.UUID, allowNull: false },
    buyerId: { type: DataTypes.UUID, allowNull: false },
    // Denormalised so the ledger can be read per seller without joining.
    sellerId: { type: DataTypes.UUID, allowNull: false },
    // The completed, INTERESTED inspection that unlocked this checkout.
    inspectionId: { type: DataTypes.UUID, allowNull: true },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    platformFee: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: "NGN" },
    // "MOCK" today. Swapping in Paystack changes this value, not the schema.
    provider: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "MOCK" },
    // The idempotency key. Unique, and the handle the client settles against.
    reference: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESSFUL", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    failureReason: { type: DataTypes.TEXT, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

Payment.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });
Payment.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
Payment.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

module.exports = { Payment };
