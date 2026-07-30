import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { Listing } from '../Listing/model';

export const SavedListing = sequelize.define(
  'SavedListing',
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
    tableName: 'saved_properties',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'propertyId'] }],
  }
);

SavedListing.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });
