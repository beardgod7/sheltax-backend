import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PropertyIntent = 'RENT' | 'BUY' | 'SHORTLET' | 'SWAP';

export type PropertyApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PropertyAttributes {
  id: string;
  title: string;
  description: string;
  intent: PropertyIntent;
  propertyType: string; // e.g. 'apartment', 'flat', 'duplex', 'terrace', 'house', 'villa', 'penthouse', 'land'
  price: number;
  currency: string;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  sittingRooms?: number;
  tags: string[]; // e.g. ["APARTMENT", "FURNISHED"]
  images: string[]; // e.g. ["/assets/products/rent/1.png", ...]
  isFeatured: boolean;
  isPopular: boolean;
  approvalStatus: PropertyApprovalStatus;
  rejectionReason?: string | null;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PropertyCreationAttributes = Optional<
  PropertyAttributes,
  | 'id'
  | 'currency'
  | 'sittingRooms'
  | 'tags'
  | 'images'
  | 'isFeatured'
  | 'isPopular'
  | 'approvalStatus'
  | 'rejectionReason'
  | 'createdAt'
  | 'updatedAt'
>;

export class Property
  extends Model<PropertyAttributes, PropertyCreationAttributes>
  implements PropertyAttributes
{
  declare id: string;
  declare title: string;
  declare description: string;
  declare intent: PropertyIntent;
  declare propertyType: string;
  declare price: number;
  declare currency: string;
  declare location: string;
  declare city: string;
  declare state: string;
  declare bedrooms: number;
  declare bathrooms: number;
  declare sittingRooms: number;
  declare tags: string[];
  declare images: string[];
  declare isFeatured: boolean;
  declare isPopular: boolean;
  declare approvalStatus: PropertyApprovalStatus;
  declare rejectionReason: string | null;
  declare ownerId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Property.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intent: {
      type: DataTypes.ENUM('RENT', 'BUY', 'SHORTLET', 'SWAP'),
      allowNull: false,
    },
    propertyType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('price');
        return rawValue ? Number(rawValue) : 0;
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sittingRooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    approvalStatus: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'APPROVED',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'properties',
    timestamps: true,
  }
);
