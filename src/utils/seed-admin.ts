import bcrypt from 'bcryptjs';
import sequelize from '../config/dbconfig';
import { User } from '../features/Authentication/model';
import logger from './logger';

export async function seedSuperAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      logger.info('Skipping Super Admin seeding: ADMIN_EMAIL and ADMIN_PASSWORD environment variables not provided.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let admin: any = await User.findOne({ where: { email: adminEmail } });

    if (admin) {
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.firstName = admin.firstName || 'Super';
      admin.surname = admin.surname || 'Admin';
      admin.verified = true;
      await admin.save();
      logger.success(`Super Admin user updated: ${adminEmail}`);
    } else {
      admin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Super',
        surname: 'Admin',
        role: 'admin',
        verified: true,
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
