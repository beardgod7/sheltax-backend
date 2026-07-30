import { sequelize } from '../config/database';
import { User, UserRole } from './user.model';
import { SeekerProfile, OwnerProfile, BrokerProfile } from './profiles.model';
import { Property, PropertyIntent } from './property.model';
import { SavedProperty } from './saved-property.model';
import { Notification } from './notification.model';
import { Inspection } from './inspection.model';

// Associations
User.hasOne(SeekerProfile, { foreignKey: 'userId', as: 'seekerProfile', onDelete: 'CASCADE' });
SeekerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(OwnerProfile, { foreignKey: 'userId', as: 'ownerProfile', onDelete: 'CASCADE' });
OwnerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(BrokerProfile, { foreignKey: 'userId', as: 'brokerProfile', onDelete: 'CASCADE' });
BrokerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Property, { foreignKey: 'ownerId', as: 'properties', onDelete: 'CASCADE' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(SavedProperty, { foreignKey: 'userId', as: 'savedProperties', onDelete: 'CASCADE' });
SavedProperty.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Property.hasMany(SavedProperty, { foreignKey: 'propertyId', as: 'savedByUsers', onDelete: 'CASCADE' });
SavedProperty.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Inspection, { foreignKey: 'seekerId', as: 'seekerInspections', onDelete: 'CASCADE' });
Inspection.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });

User.hasMany(Inspection, { foreignKey: 'ownerId', as: 'ownerInspections', onDelete: 'CASCADE' });
Inspection.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Property.hasMany(Inspection, { foreignKey: 'propertyId', as: 'inspections', onDelete: 'CASCADE' });
Inspection.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

export {
  sequelize,
  User,
  UserRole,
  SeekerProfile,
  OwnerProfile,
  BrokerProfile,
  Property,
  PropertyIntent,
  SavedProperty,
  Notification,
  Inspection,
};

export const initModels = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Sequelize models & associations synchronized with database.');
  } catch (error) {
    console.error('⚠️ Sequelize sync error:', error);
  }
};
