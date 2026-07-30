import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { Listing } from '../Listing/model';
import { User } from '../Authentication/model';

export const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: { type: DataTypes.UUID, allowNull: false },
    buyerId: { type: DataTypes.UUID, allowNull: false },
    sellerId: { type: DataTypes.UUID, allowNull: false },
    inspectionId: { type: DataTypes.UUID, allowNull: true },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    platformFee: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'NGN' },
    provider: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'MOCK' },
    reference: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    failureReason: { type: DataTypes.TEXT, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    tableName: 'payments',
    timestamps: true,
  }
);

Payment.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });
Payment.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Payment.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
