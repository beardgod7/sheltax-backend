import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { MainProperty as Listing } from '../Owner/model';
import { User } from '../Authentication/model';

export const ReviewDecision = sequelize.define(
  'ReviewDecision',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subjectType: {
      type: DataTypes.ENUM('KYC', 'LISTING'),
      allowNull: false,
    },
    subjectId: { type: DataTypes.UUID, allowNull: false },
    cycle: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    outcome: {
      type: DataTypes.ENUM('SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED_TO_PENDING'),
      allowNull: false,
    },
    reason: { type: DataTypes.TEXT, allowNull: true },
    reviewerId: { type: DataTypes.UUID, allowNull: true },
    submittedBy: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'review_decisions', timestamps: true }
);

export const Notification = sequelize.define(
  'AppNotification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'SYSTEM' },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    link: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: 'notifications', timestamps: true }
);

if (!(Listing as any).associations?.owner) {
  (Listing as any).belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
}

export { Listing };
