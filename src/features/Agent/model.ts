import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';
import { MainProperty as Listing } from '../Owner/model';

// Owner-Agent Authorization Model
export const PropertyAgentAuthorization = sequelize.define(
  'PropertyAgentAuthorization',
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
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Listing,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    authorizedIntents: {
      type: DataTypes.JSON,
      defaultValue: ['RENT', 'BUY', 'SHORTLET', 'SWAP'],
      allowNull: false,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.00,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'PropertyAgentAuthorizations',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['agentId'] },
      { fields: ['propertyId'] },
      { fields: ['status'] },
    ],
  }
);

// Commission Ledger Model
export const Commission = sequelize.define(
  'Commission',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Listing,
        key: 'id',
      },
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00,
    },
    status: {
      type: DataTypes.ENUM('ACCRUED', 'PENDING_PAYOUT', 'PAID', 'CANCELLED'),
      defaultValue: 'ACCRUED',
      allowNull: false,
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'Commissions',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['ownerId'] },
      { fields: ['propertyId'] },
      { fields: ['status'] },
    ],
  }
);

// Agent Rating Model
export const AgentRating = sequelize.define(
  'AgentRating',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    seekerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'AgentRatings',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['seekerId'] },
    ],
  }
);

// Associations
User.hasMany(PropertyAgentAuthorization, { foreignKey: 'agentId', as: 'agentAuthorizations' });
User.hasMany(PropertyAgentAuthorization, { foreignKey: 'ownerId', as: 'ownerAuthorizations' });
PropertyAgentAuthorization.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
PropertyAgentAuthorization.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
PropertyAgentAuthorization.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });

User.hasMany(Commission, { foreignKey: 'agentId', as: 'commissions' });
Commission.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
Commission.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Commission.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });

User.hasMany(AgentRating, { foreignKey: 'agentId', as: 'agentRatings' });
AgentRating.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
AgentRating.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });
