import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const AdminPermission = sequelize.define(
  'AdminPermission',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    permission: {
      type: DataTypes.ENUM(
        'kyc_review',
        'listing_moderation',
        'user_management',
        'finance_admin',
        'staff_admin'
      ),
      allowNull: false,
    },
    grantedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    tableName: 'AdminPermissions',
    timestamps: true,
    indexes: [
      { fields: ['adminId', 'permission'], unique: true },
    ],
  }
);

AdminPermission.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
AdminPermission.belongsTo(User, { foreignKey: 'grantedBy', as: 'grantor' });
