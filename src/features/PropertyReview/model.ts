import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { Listing } from '../Listing/model';
import { User } from '../Authentication/model';
import { RATING_MIN, RATING_MAX, BODY_MIN, BODY_MAX } from './state';

export const PropertyReview = sequelize.define(
  'PropertyReview',
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
    tableName: 'property_reviews',
    timestamps: true,
    indexes: [{ unique: true, fields: ['propertyId', 'seekerId'] }],
  }
);

PropertyReview.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });
PropertyReview.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });
