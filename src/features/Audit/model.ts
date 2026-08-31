import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    changes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'AuditLogs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['actorId'] },
      { fields: ['resourceType', 'resourceId'] },
      { fields: ['action'] },
    ],
  }
);

AuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });
