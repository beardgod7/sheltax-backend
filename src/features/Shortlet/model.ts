import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const ShortletProperty = sequelize.define(
  'ShortletProperty',
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
      type: DataTypes.ENUM('apartment', 'house', 'duplex', 'bungalow', 'flat', 'room', 'studio', 'hotel', 'resort'),
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
    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 50 },
    },
    pricePerNight: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    pricePerWeek: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    pricePerMonth: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
    },
    securityDeposit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    cleaningFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    serviceFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    minimumStay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    maximumStay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    checkInTime: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '15:00:00',
    },
    checkOutTime: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '11:00:00',
    },
    instantBooking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    houseRules: {
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
    availableTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'booked', 'inactive', 'under_review'),
      allowNull: false,
      defaultValue: 'active',
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
      defaultValue: 'shortlet',
    },
  },
  {
    tableName: 'ShortletProperties',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['propertyType'] },
      { fields: ['city'] },
      { fields: ['state'] },
      { fields: ['area'] },
      { fields: ['pricePerNight'] },
      { fields: ['bedrooms'] },
      { fields: ['bathrooms'] },
      { fields: ['maxGuests'] },
      { fields: ['status'] },
      { fields: ['listingStatus'] },
      { fields: ['isAvailable'] },
      { fields: ['isVerified'] },
      { fields: ['isFeatured'] },
      { fields: ['tag'] },
      { fields: ['createdAt'] },
    ],
  }
);

export const ShortletInquiry = sequelize.define(
  'ShortletInquiry',
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
        model: ShortletProperty,
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
      type: DataTypes.ENUM('booking_inquiry', 'availability_check', 'general_question'),
      defaultValue: 'booking_inquiry',
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    numberOfGuests: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 50 },
    },
    status: {
      type: DataTypes.ENUM('pending', 'responded', 'booking_confirmed', 'closed'),
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
    tableName: 'ShortletInquiries',
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

export const ShortletFavorite = sequelize.define(
  'ShortletFavorite',
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
        model: ShortletProperty,
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
    tableName: 'ShortletFavorites',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['propertyId', 'userId'] },
      { fields: ['userId'] },
      { fields: ['propertyId'] },
    ],
  }
);

ShortletProperty.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(ShortletProperty, { foreignKey: 'ownerId', as: 'shortletProperties' });

ShortletInquiry.belongsTo(ShortletProperty, { foreignKey: 'propertyId', as: 'property' });
ShortletProperty.hasMany(ShortletInquiry, { foreignKey: 'propertyId', as: 'inquiries' });

ShortletInquiry.belongsTo(User, { foreignKey: 'inquirerId', as: 'inquirer' });
User.hasMany(ShortletInquiry, { foreignKey: 'inquirerId', as: 'shortletInquiries' });

ShortletFavorite.belongsTo(ShortletProperty, { foreignKey: 'propertyId', as: 'property' });
ShortletProperty.hasMany(ShortletFavorite, { foreignKey: 'propertyId', as: 'favorites' });

ShortletFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ShortletFavorite, { foreignKey: 'userId', as: 'favoriteShortlets' });
