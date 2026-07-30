const { DataTypes } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { Listing } = require("../Listing/model");
const { User } = require("../Authentication/model");
const { RATING_MIN, RATING_MAX, BODY_MIN, BODY_MAX } = require("./state");

// A seeker's rating and written account of a listing they inspected. Not to be
// confused with ReviewDecision, which is the admin moderation trail that
// decides whether a listing may appear publicly at all.
const PropertyReview = sequelize.define(
  "PropertyReview",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    seekerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // The single overall score. The first review model has no category scores.
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: RATING_MIN, max: RATING_MAX },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [BODY_MIN, BODY_MAX] },
    },
    // The inspection that granted eligibility — the provenance behind the
    // Verified Inspection badge every review carries.
    inspectionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "property_reviews",
    timestamps: true,
    indexes: [{ unique: true, fields: ["propertyId", "seekerId"] }],
  }
);

PropertyReview.belongsTo(Listing, { foreignKey: "propertyId", as: "property" });
PropertyReview.belongsTo(User, { foreignKey: "seekerId", as: "seeker" });

module.exports = { PropertyReview };
