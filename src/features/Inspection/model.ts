import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { Listing } from '../Listing/model';
import { User } from '../Authentication/model';
import { INSPECTION_STATUSES, INSPECTION_OUTCOMES } from './state';

export const Inspection = sequelize.define(
  'Inspection',
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
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    inspectionType: {
      type: DataTypes.ENUM('PHYSICAL', 'VIRTUAL'),
      allowNull: false,
      defaultValue: 'PHYSICAL',
    },
    preferredDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preferredTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...INSPECTION_STATUSES),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    outcome: {
      type: DataTypes.ENUM(...INSPECTION_OUTCOMES),
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    outcomeAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'inspections',
    timestamps: true,
  }
);

Inspection.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });
Inspection.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });
Inspection.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
