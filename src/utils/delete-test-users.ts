import sequelize from '../config/dbconfig';
import { User } from '../features/Authentication/model';
import { Profile, OwnerProfile, BrokerProfile } from '../features/Profile/model';
import { SavedListing } from '../features/SavedListing/model';

const targetEmails = [
  'igwechinonso77@gmail.com',
  'igwechinonso77+01@gmail.com',
  'igwechinonso77+02@gmail.com',
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    for (const email of targetEmails) {
      const user: any = await User.findOne({ where: { email } });
      if (user) {
        await Profile.destroy({ where: { userId: user.id } });
        await OwnerProfile.destroy({ where: { userId: user.id } });
        await BrokerProfile.destroy({ where: { userId: user.id } });
        await SavedListing.destroy({ where: { userId: user.id } });
        await user.destroy();
        console.log(`✅ Deleted user: ${email} (${user.id})`);
      } else {
        console.log(`ℹ️ User not found: ${email}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error deleting users:', err);
    process.exit(1);
  }
}

run();
