import { DataTypes } from 'sequelize';
import sequelize from '../../config/dbconfig';

export const FormFieldTemplate = sequelize.define(
  'FormFieldTemplate',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    EventId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fields: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

export const EventBooking = sequelize.define(
  'EventBooking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    EventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    registrationType: {
      type: DataTypes.ENUM('Register', 'Volunteer', 'Sponsor'),
      allowNull: false,
      defaultValue: 'Register',
    },
    attendanceStatus: {
      type: DataTypes.ENUM('registered', 'confirmed', 'attended', 'cancelled'),
      allowNull: false,
      defaultValue: 'registered',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);
