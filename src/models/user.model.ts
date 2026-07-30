import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'user' | 'seeker' | 'owner' | 'broker' | 'admin';
export type UserKycLevel = 'BASIC' | 'NIN_VERIFIED' | 'CAC_VERIFIED';
export type UserKycStatus = 'UNSUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserAttributes {
  id: string;
  email: string;
  phoneNumber?: string | null;
  firstName: string;
  middleName?: string | null;
  surname: string;
  role: UserRole;
  kycLevel: UserKycLevel;
  kycStatus: UserKycStatus;
  password?: string | null;
  isVerified: boolean;
  otpHash?: string | null;
  otpExpiresAt?: Date | null;
  otpLastSentAt?: Date | null;
  refreshToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'role'
  | 'kycLevel'
  | 'kycStatus'
  | 'phoneNumber'
  | 'password'
  | 'isVerified'
  | 'otpHash'
  | 'otpExpiresAt'
  | 'otpLastSentAt'
  | 'refreshToken'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare phoneNumber: string | null;
  declare firstName: string;
  declare middleName: string | null;
  declare surname: string;
  declare role: UserRole;
  declare kycLevel: UserKycLevel;
  declare kycStatus: UserKycStatus;
  declare password: string | null;
  declare isVerified: boolean;
  declare otpHash: string | null;
  declare otpExpiresAt: Date | null;
  declare otpLastSentAt: Date | null;
  declare refreshToken: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'seeker', 'owner', 'broker', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    kycLevel: {
      type: DataTypes.ENUM('BASIC', 'NIN_VERIFIED', 'CAC_VERIFIED'),
      allowNull: false,
      defaultValue: 'BASIC',
    },
    kycStatus: {
      type: DataTypes.ENUM('UNSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'UNSUBMITTED',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    otpHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    otpLastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
