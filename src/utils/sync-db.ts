import sequelize from '../config/dbconfig';
import { User, Token } from '../features/Authentication/model';
import { UserVerification, VerificationDocument, PropertyOwnershipRecord, PropertyVerification } from '../features/Verification/model';
import { Session } from '../features/Session/model';
import { AdminPermission } from '../features/Admin/permissionModel';
import { AuditLog } from '../features/Audit/model';

async function sync() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Synchronizing schema models with Neon Postgres...');
    await sequelize.sync({ alter: { drop: false } });
    console.log('✅ Database schema synchronized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema sync failed:', error);
    process.exit(1);
  }
}

sync();
