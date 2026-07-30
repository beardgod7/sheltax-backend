import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type InspectionType = 'PHYSICAL' | 'VIRTUAL';
export type InspectionStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED';

export interface InspectionAttributes {
  id: string;
  propertyId: string;
  seekerId: string;
  ownerId: string;
  inspectionType: InspectionType;
  preferredDate: string;
  preferredTime: string;
  contactPhone: string;
  notes?: string | null;
  status: InspectionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InspectionCreationAttributes = Optional<
  InspectionAttributes,
  'id' | 'notes' | 'status' | 'createdAt' | 'updatedAt'
>;

export class Inspection
  extends Model<InspectionAttributes, InspectionCreationAttributes>
  implements InspectionAttributes
{
  declare id: string;
  declare propertyId: string;
  declare seekerId: string;
  declare ownerId: string;
  declare inspectionType: InspectionType;
  declare preferredDate: string;
  declare preferredTime: string;
  declare contactPhone: string;
  declare notes: string | null;
  declare status: InspectionStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Inspection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    seekerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'inspections',
    timestamps: true,
  }
);
