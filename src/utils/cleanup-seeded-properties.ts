import { sequelize } from '../config/database';
import { User, Property } from '../models';

export async function cleanupSeededProperties() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Connected to database.');

    const seedOwner = await User.findOne({
      where: { email: 'owner@sheltax.com' },
    });

    if (seedOwner) {
      console.log(`👤 Seed owner found: ${seedOwner.email} (${seedOwner.id})`);
      const deletedCount = await Property.destroy({
        where: {
          ownerId: seedOwner.id,
        },
      });
      console.log(`🧹 Deleted ${deletedCount} seeded properties owned by ${seedOwner.email}.`);
    } else {
      console.log('⚠️ Seed owner owner@sheltax.com not found.');
    }
  } catch (error) {
    console.error('❌ Error cleaning up seeded properties:', error);
  }
}

if (require.main === module) {
  cleanupSeededProperties().then(() => {
    console.log('Done cleaning up.');
    process.exit(0);
  });
}
