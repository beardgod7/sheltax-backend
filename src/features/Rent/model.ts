import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const RentalProperty = sequelize.define(
  'RentalProperty',
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
      type: DataTypes.ENUM('apartment', 'house', 'duplex', 'bungalow', 'flat', 'room', 'studio'),
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
    rentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
    },
    rentPeriod: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'yearly',
    },
    securityDeposit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    agentFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    serviceFee: {
      type: DataTypes.DECIMAL(15, 2),
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
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'rented', 'inactive', 'under_review'),
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
    titleDocument: {
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
      defaultValue: 'rent',
    },
  },
  {
    tableName: 'RentalProperties',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['propertyType'] },
      { fields: ['city'] },
      { fields: ['state'] },
      { fields: ['area'] },
      { fields: ['rentAmount'] },
      { fields: ['bedrooms'] },
      { fields: ['bathrooms'] },
      { fields: ['status'] },
      { fields: ['isAvailable'] },
      { fields: ['isVerified'] },
      { fields: ['isFeatured'] },
      { fields: ['tag'] },
      { fields: ['createdAt'] },
    ],
  }
);

export const RentalInquiry = sequelize.define(
  'RentalInquiry',
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
        model: RentalProperty,
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
      type: DataTypes.ENUM('viewing_request', 'rental_inquiry', 'general_question'),
      defaultValue: 'rental_inquiry',
    },
    preferredViewingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'responded', 'viewing_scheduled', 'closed'),
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
    tableName: 'RentalInquiries',
    timestamps: true,
    indexes: [
      { fields: ['propertyId'] },
      { fields: ['inquirerId'] },
      { fields: ['status'] },
      { fields: ['inquiryType'] },
      { fields: ['createdAt'] },
    ],
  }
);

export const RentalFavorite = sequelize.define(
  'RentalFavorite',
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
        model: RentalProperty,
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
    tableName: 'RentalFavorites',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['propertyId', 'userId'] },
      { fields: ['userId'] },
      { fields: ['propertyId'] },
    ],
  }
);

RentalProperty.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(RentalProperty, { foreignKey: 'ownerId', as: 'rentalProperties' });

RentalInquiry.belongsTo(RentalProperty, { foreignKey: 'propertyId', as: 'property' });
RentalProperty.hasMany(RentalInquiry, { foreignKey: 'propertyId', as: 'inquiries' });

RentalInquiry.belongsTo(User, { foreignKey: 'inquirerId', as: 'inquirer' });
User.hasMany(RentalInquiry, { foreignKey: 'inquirerId', as: 'rentalInquiries' });

RentalFavorite.belongsTo(RentalProperty, { foreignKey: 'propertyId', as: 'property' });
RentalProperty.hasMany(RentalFavorite, { foreignKey: 'propertyId', as: 'favorites' });

RentalFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RentalFavorite, { foreignKey: 'userId', as: 'favoriteRentals' });
