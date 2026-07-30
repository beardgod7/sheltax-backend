import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Property } from './property.model';

export interface SavedPropertyAttributes {
  id: string;
  userId: string;
  propertyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SavedPropertyCreationAttributes = Optional<SavedPropertyAttributes, 'id'>;

export class SavedProperty
  extends Model<SavedPropertyAttributes, SavedPropertyCreationAttributes>
  implements SavedPropertyAttributes
{
  public id!: string;
  public userId!: string;
  public propertyId!: string;
  public property?: Property;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SavedProperty.init(
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
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'saved_properties',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'propertyId'],
      },
    ],
  }
);
