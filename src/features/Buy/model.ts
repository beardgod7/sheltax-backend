import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const SaleProperty = sequelize.define(
  'SaleProperty',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    propertyType: {
      type: DataTypes.ENUM('apartment', 'house', 'duplex', 'bungalow', 'flat', 'room', 'studio', 'land', 'commercial'),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
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
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 20 },
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 20 },
    },
    toilets: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 20 },
    },
    salePrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
    },
    propertyAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    landSize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    builtUpArea: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    titleDocument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    virtualTourUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'sold', 'inactive', 'under_review'),
      allowNull: false,
      defaultValue: 'under_review',
    },
    listingStatus: {
      type: DataTypes.ENUM('pending', 'active', 'rejected', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    featuredUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    buildingApproval: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    registeredOwner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tenancyPeriod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearBuilt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inspectable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    serviceCharge: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tag: {
      type: DataTypes.ENUM('rent', 'buy', 'swap', 'shortlet'),
      allowNull: false,
      defaultValue: 'buy',
    },
  },
  {
    tableName: 'SaleProperties',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['propertyType'] },
      { fields: ['city'] },
      { fields: ['state'] },
      { fields: ['area'] },
      { fields: ['salePrice'] },
      { fields: ['bedrooms'] },
      { fields: ['bathrooms'] },
      { fields: ['status'] },
      { fields: ['listingStatus'] },
      { fields: ['isVerified'] },
      { fields: ['isFeatured'] },
      { fields: ['tag'] },
      { fields: ['createdAt'] },
    ],
  }
);

export const SaleInquiry = sequelize.define(
  'SaleInquiry',
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
        model: SaleProperty,
        key: 'id',
      },
    },
    inquirerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    inquirerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inquirerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    inquirerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inquiryType: {
      type: DataTypes.ENUM('purchase_inquiry', 'viewing_request', 'price_negotiation', 'general_question'),
      defaultValue: 'purchase_inquiry',
    },
    offerAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    preferredViewingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'responded', 'viewing_scheduled', 'offer_made', 'closed'),
      defaultValue: 'pending',
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'SaleInquiries',
    timestamps: true,
    indexes: [
      { fields: ['propertyId'] },
      { fields: ['inquirerId'] },
      { fields: ['status'] },
      { fields: ['inquiryType'] },
    ],
  }
);

export const SaleFavorite = sequelize.define(
  'SaleFavorite',
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
        model: SaleProperty,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    tableName: 'SaleFavorites',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['propertyId', 'userId'] },
      { fields: ['userId'] },
    ],
  }
);

SaleProperty.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(SaleProperty, { foreignKey: 'ownerId', as: 'saleProperties' });

SaleInquiry.belongsTo(SaleProperty, { foreignKey: 'propertyId', as: 'property' });
SaleProperty.hasMany(SaleInquiry, { foreignKey: 'propertyId', as: 'inquiries' });

SaleInquiry.belongsTo(User, { foreignKey: 'inquirerId', as: 'inquirer' });
User.hasMany(SaleInquiry, { foreignKey: 'inquirerId', as: 'saleInquiries' });

SaleFavorite.belongsTo(SaleProperty, { foreignKey: 'propertyId', as: 'property' });
SaleProperty.hasMany(SaleFavorite, { foreignKey: 'propertyId', as: 'favorites' });

SaleFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SaleFavorite, { foreignKey: 'userId', as: 'favoriteSales' });
