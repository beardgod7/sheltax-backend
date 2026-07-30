import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';

export const Events = sequelize.define(
  'Events',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    registrationEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    registrationDeadline: { type: DataTypes.DATE, allowNull: true },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);
