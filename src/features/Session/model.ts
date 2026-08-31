import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    refreshTokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deviceInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'Sessions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['refreshTokenHash'] },
      { fields: ['revokedAt'] },
    ],
  }
);

Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });
