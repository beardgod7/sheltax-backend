import sequelize from '../config/dbconfig';
import { User } from '../features/Authentication/model';
import { Op } from 'sequelize';

export async function cleanupTestUsers() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Connected to database.');

    const deletedCount = await User.destroy({
      where: {
        [Op.or]: [
          { email: 'owner@sheltax.com' },
          { email: 'flytest@example.com' },
          { email: { [Op.iLike]: '%example.com' } },
          { email: { [Op.iLike]: 'testuser_%' } },
          { email: { [Op.iLike]: 'seeker_profile_%' } },
        ],
      },
    });

    console.log(`🧹 Deleted ${deletedCount} test/dummy user accounts.`);

    const remainingUsers = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'surname', 'role', 'isVerified'],
      raw: true,
    });
    console.log('📋 Remaining Active Users in DB:', remainingUsers);
  } catch (error) {
    console.error('❌ Error cleaning up test users:', error);
  }
}

if (require.main === module) {
  cleanupTestUsers().then(() => {
    console.log('Done cleaning up users.');
    process.exit(0);
  });
}
