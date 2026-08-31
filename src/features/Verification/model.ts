import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { User } from '../Authentication/model';
import { Listing } from '../Listing/model';

export const UserVerification = sequelize.define(
  'UserVerification',
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
        model: User,
        key: 'id',
      },
    },
    verificationType: {
      type: DataTypes.ENUM(
        'EMAIL',
        'PHONE',
        'IDENTITY',
        'NIN',
        'CAC',
        'BANK_ACCOUNT',
        'AGENT_LICENCE'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('UNSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'UNSUBMITTED',
      allowNull: false,
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cycle: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: 'UserVerifications',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'verificationType'], unique: true },
      { fields: ['status'] },
    ],
  }
);

export const VerificationDocument = sequelize.define(
  'VerificationDocument',
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
        model: User,
        key: 'id',
      },
    },
    verificationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: UserVerification,
        key: 'id',
      },
    },
    documentType: {
      type: DataTypes.ENUM(
        'PROFILE_PICTURE',
        'GOVERNMENT_ID',
        'NIN_SLIP',
        'CAC_CERTIFICATE',
        'TITLE_DEED',
        'UTILITY_BILL',
        'OTHER'
      ),
      allowNull: false,
    },
    storageKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
  },
  {
    tableName: 'VerificationDocuments',
    timestamps: true,
    indexes: [{ fields: ['userId'] }, { fields: ['verificationId'] }],
  }
);

export const PropertyOwnershipRecord = sequelize.define(
  'PropertyOwnershipRecord',
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
        model: Listing,
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
    ownershipType: {
      type: DataTypes.ENUM(
        'TITLE_DEED',
        'CERTIFICATE_OF_OCCUPANCY',
        'DEED_OF_ASSIGNMENT',
        'POWER_OF_ATTORNEY',
        'OWNER_LETTER'
      ),
      allowNull: false,
    },
    documentUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    verificationStatus: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'PropertyOwnershipRecords',
    timestamps: true,
    indexes: [{ fields: ['propertyId'] }, { fields: ['ownerId'] }],
  }
);

export const PropertyVerification = sequelize.define(
  'PropertyVerification',
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
        model: Listing,
        key: 'id',
      },
    },
    verificationType: {
      type: DataTypes.ENUM('TITLE_DOCUMENT', 'OWNERSHIP_PROOF', 'PHYSICAL_INSPECTION'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'PropertyVerifications',
    timestamps: true,
    indexes: [{ fields: ['propertyId'] }],
  }
);

UserVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserVerification.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
VerificationDocument.belongsTo(User, { foreignKey: 'userId', as: 'user' });
VerificationDocument.belongsTo(UserVerification, { foreignKey: 'verificationId', as: 'verification' });
PropertyOwnershipRecord.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });
PropertyOwnershipRecord.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
PropertyVerification.belongsTo(Listing, { foreignKey: 'propertyId', as: 'property' });
PropertyVerification.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
