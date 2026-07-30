import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';

export const PropertyRequest = sequelize.define(
  'PropertyRequest',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seekerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    propertyCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Property category (e.g. apartment, house, land, commercial)',
    },
    listingType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Listing type (e.g. rent, buy, shortlet)',
    },
    maximumBudget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    minimumBudget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timeline: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Timeline/due date (e.g. immediate, 1 week, 1 month, 3 months)',
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Duration (e.g. flexible, 6 months, 1 year)',
    },
    otherInformation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'fulfilled', 'cancelled', 'expired'),
      allowNull: false,
      defaultValue: 'active',
    },
    responseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'PropertyRequests',
    timestamps: true,
    indexes: [
      { fields: ['seekerId'] },
      { fields: ['propertyCategory'] },
      { fields: ['listingType'] },
      { fields: ['state'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export const PropertyRequestResponse = sequelize.define(
  'PropertyRequestResponse',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PropertyRequest,
        key: 'id',
      },
    },
    responderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      comment: 'Broker or Owner responding to the request',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to a specific property listing (optional)',
    },
    propertyType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    propertyImages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of image URLs',
    },
    propertyDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    status: {
      type: DataTypes.ENUM('pending', 'viewed', 'interested', 'rejected', 'accepted'),
      allowNull: false,
      defaultValue: 'pending',
    },
    seekerFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seekerRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
    },
  },
  {
    tableName: 'PropertyRequestResponses',
    timestamps: true,
    indexes: [
      { fields: ['requestId'] },
      { fields: ['responderId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

PropertyRequest.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });
User.hasMany(PropertyRequest, { foreignKey: 'seekerId', as: 'propertyRequests' });

PropertyRequestResponse.belongsTo(PropertyRequest, { foreignKey: 'requestId', as: 'request' });
PropertyRequest.hasMany(PropertyRequestResponse, { foreignKey: 'requestId', as: 'responses' });

PropertyRequestResponse.belongsTo(User, { foreignKey: 'responderId', as: 'responder' });
User.hasMany(PropertyRequestResponse, { foreignKey: 'responderId', as: 'requestResponses' });
