const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { Listing } = require("../Listing/model");

const SavedListing = sequelize.define(
  "SavedListing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    propertyId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    tableName: "saved_properties",
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "propertyId"] }],
  }
);

SavedListing.belongsTo(Listing, { foreignKey: "propertyId", as: "property" });

module.exports = { SavedListing };
