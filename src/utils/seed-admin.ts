import bcrypt from 'bcryptjs';
import sequelize from '../config/dbconfig';
import { User } from '../features/Authentication/model';
import logger from './logger';

export async function seedSuperAdmin() {
  try {
    const adminEmail = 'admin@sheltax.com';
    const adminPassword = '!Shelta-x@12026!';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let admin: any = await User.findOne({ where: { email: adminEmail } });

    if (admin) {
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.firstName = 'Super';
      admin.surname = 'Admin';
      admin.isVerified = true;
      await admin.save();
      logger.success(`Super Admin user updated: ${adminEmail}`);
    } else {
      admin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Super',
        surname: 'Admin',
        role: 'admin',
        isVerified: true,
      });
      logger.success(`Super Admin user seeded: ${adminEmail}`);
    }
  } catch (error) {
    logger.error('Failed to seed Super Admin:', error);
  }
}

if (require.main === module) {
  sequelize.authenticate().then(() => {
    seedSuperAdmin().then(() => {
      process.exit(0);
    });
  });
}
