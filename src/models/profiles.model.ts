import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// --- Seeker Profile ---
export interface SeekerProfileAttributes {
  id: string;
  userId: string;
  middleName?: string | null;
  stateOfResidence?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  ninVerification?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type SeekerProfileCreationAttributes = Optional<
  SeekerProfileAttributes,
  'id' | 'stateOfResidence' | 'gender' | 'dateOfBirth' | 'ninVerification'
>;

export class SeekerProfile extends Model<SeekerProfileAttributes, SeekerProfileCreationAttributes>
  implements SeekerProfileAttributes {
  declare id: string;
  declare userId: string;
  declare middleName: string | null;
  declare stateOfResidence: string | null;
  declare gender: string | null;
  declare dateOfBirth: string | null;
  declare ninVerification: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
SeekerProfile.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    middleName: { type: DataTypes.STRING, allowNull: true },
    stateOfResidence: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    dateOfBirth: { type: DataTypes.STRING, allowNull: true },
    ninVerification: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'seeker_profiles', timestamps: true }
);

// --- Owner Profile ---
export interface OwnerProfileAttributes {
  id: string;
  userId: string;
  stateOfResidence?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  ninVerification?: string | null;
  ownerType?: string | null;
  companyName?: string | null;
  businessRegistrationNumber?: string | null;
  bio?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  location?: string | null;
  propertyTypes?: string | null;
  listingIntent?: string | null;
  profilePictureUrl?: string | null;
  governmentIdUrl?: string | null;
  governmentIdType?: string | null;
  ninCacDocumentUrl?: string | null;
  ninDocumentUrl?: string | null;
  cacDocumentUrl?: string | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type OwnerProfileCreationAttributes = Optional<OwnerProfileAttributes, 'id'>;

export class OwnerProfile extends Model<OwnerProfileAttributes, OwnerProfileCreationAttributes>
  implements OwnerProfileAttributes {
  declare id: string;
  declare userId: string;
  declare stateOfResidence: string | null;
  declare gender: string | null;
  declare dateOfBirth: string | null;
  declare ninVerification: string | null;
  declare ownerType: string | null;
  declare companyName: string | null;
  declare businessRegistrationNumber: string | null;
  declare bio: string | null;
  declare website: string | null;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare zipCode: string | null;
  declare location: string | null;
  declare propertyTypes: string | null;
  declare listingIntent: string | null;
  declare profilePictureUrl: string | null;
  declare governmentIdUrl: string | null;
  declare governmentIdType: string | null;
  declare ninCacDocumentUrl: string | null;
  declare ninDocumentUrl: string | null;
  declare cacDocumentUrl: string | null;
  declare rejectionReason: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
OwnerProfile.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    stateOfResidence: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    dateOfBirth: { type: DataTypes.STRING, allowNull: true },
    ninVerification: { type: DataTypes.STRING, allowNull: true },
    ownerType: { type: DataTypes.STRING, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: true },
    businessRegistrationNumber: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    zipCode: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    propertyTypes: { type: DataTypes.TEXT, allowNull: true },
    listingIntent: { type: DataTypes.TEXT, allowNull: true },
    profilePictureUrl: { type: DataTypes.TEXT, allowNull: true },
    governmentIdUrl: { type: DataTypes.TEXT, allowNull: true },
    governmentIdType: { type: DataTypes.STRING, allowNull: true },
    ninCacDocumentUrl: { type: DataTypes.TEXT, allowNull: true },
    ninDocumentUrl: { type: DataTypes.TEXT, allowNull: true },
    cacDocumentUrl: { type: DataTypes.TEXT, allowNull: true },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'owner_profiles', timestamps: true }
);

// --- Broker Profile ---
export interface BrokerProfileAttributes {
  id: string;
  userId: string;
  stateOfResidence?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  ninVerification?: string | null;
  brokerProfileType?: string | null;
  yearsOfExperience?: number | null;
  bio?: string | null;
  specialization?: string | null;
  agencyCompanyName?: string | null;
  companyYearsOfExistence?: string | null;
  operatingLocations?: string[] | null;
  companySize?: string | null;
  portfolioSummary?: string | null;
  profilePictureUrl?: string | null;
  governmentIdUrl?: string | null;
  governmentIdType?: string | null;
  ninCacDocumentUrl?: string | null;
  ninDocumentUrl?: string | null;
  cacDocumentUrl?: string | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type BrokerProfileCreationAttributes = Optional<BrokerProfileAttributes, 'id'>;

export class BrokerProfile extends Model<BrokerProfileAttributes, BrokerProfileCreationAttributes>
  implements BrokerProfileAttributes {
  declare id: string;
  declare userId: string;
  declare stateOfResidence: string | null;
  declare gender: string | null;
  declare dateOfBirth: string | null;
  declare ninVerification: string | null;
  declare brokerProfileType: string | null;
  declare yearsOfExperience: number | null;
  declare bio: string | null;
  declare specialization: string | null;
  declare agencyCompanyName: string | null;
  declare companyYearsOfExistence: string | null;
  declare operatingLocations: string[] | null;
  declare companySize: string | null;
  declare portfolioSummary: string | null;
  declare profilePictureUrl: string | null;
  declare governmentIdUrl: string | null;
  declare governmentIdType: string | null;
  declare ninCacDocumentUrl: string | null;
  declare ninDocumentUrl: string | null;
  declare cacDocumentUrl: string | null;
  declare rejectionReason: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
BrokerProfile.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    stateOfResidence: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    dateOfBirth: { type: DataTypes.STRING, allowNull: true },
    ninVerification: { type: DataTypes.STRING, allowNull: true },
    brokerProfileType: { type: DataTypes.STRING, allowNull: true },
    yearsOfExperience: { type: DataTypes.INTEGER, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    specialization: { type: DataTypes.STRING, allowNull: true },
    agencyCompanyName: { type: DataTypes.STRING, allowNull: true },
    companyYearsOfExistence: { type: DataTypes.STRING, allowNull: true },
    operatingLocations: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
    companySize: { type: DataTypes.STRING, allowNull: true },
    portfolioSummary: { type: DataTypes.TEXT, allowNull: true },
    profilePictureUrl: { type: DataTypes.TEXT, allowNull: true },
    governmentIdUrl: { type: DataTypes.TEXT, allowNull: true },
    governmentIdType: { type: DataTypes.STRING, allowNull: true },
    ninCacDocumentUrl: { type: DataTypes.TEXT, allowNull: true },
    ninDocumentUrl: { type: DataTypes.TEXT, allowNull: true },
    cacDocumentUrl: { type: DataTypes.TEXT, allowNull: true },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'broker_profiles', timestamps: true }
);
