import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';

export const MainProperty = sequelize.define(
  'Listing',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    intent: {
      type: DataTypes.ENUM('RENT', 'BUY', 'SHORTLET', 'SWAP'),
      allowNull: false,
    },
    propertyType: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'NGN' },
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
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    availabilityStatus: {
      type: DataTypes.ENUM('AVAILABLE', 'RESERVED', 'SOLD'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
    reviewedBy: { type: DataTypes.UUID, allowNull: true },
    submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'properties',
    timestamps: true,
    paranoid: true,
  }
);
