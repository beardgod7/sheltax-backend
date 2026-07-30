import dotenv from 'dotenv';
dotenv.config({ override: true });
import sequelize from './src/config/dbconfig';
import { User } from './src/features/Authentication/model';
import { OwnerProfile, BrokerProfile } from './src/features/Profile/model';

async function resetKyc() {
  try {
    await sequelize.authenticate();
    const email = 'igwechinonso77+01@gmail.com';
    const user: any = await User.findOne({ where: { email } });

    if (!user) {
      console.log(`User with email ${email} not found!`);
      process.exit(1);
    }

    console.log(`Found user ${user.id} (${user.firstName} ${user.surname}). Resetting KYC submission...`);

    user.ninVerification = null;
    user.governmentId = null;
    user.ninCacDocument = null;
    user.profilePicture = null;
    user.businessRegistrationNumber = null;
    user.kycStatus = 'UNSUBMITTED';
    user.kycLevel = 'BASIC';
    user.verified = false;

    await user.save();

    const ownerProfile: any = await OwnerProfile.findOne({ where: { userId: user.id } });
    if (ownerProfile) {
      ownerProfile.profilePicture = null;
      ownerProfile.governmentId = null;
      ownerProfile.governmentIdType = null;
      ownerProfile.ninCacNumber = null;
      ownerProfile.businessRegistrationNumber = null;
      await ownerProfile.save();
    }

    const brokerProfile: any = await BrokerProfile.findOne({ where: { userId: user.id } });
    if (brokerProfile) {
      brokerProfile.profilePicture = null;
      brokerProfile.governmentId = null;
      brokerProfile.governmentIdType = null;
      brokerProfile.ninCacNumber = null;
      brokerProfile.businessRegistrationNumber = null;
      await brokerProfile.save();
    }

    console.log('SUCCESS: KYC submission reset to UNSUBMITTED for igwechinonso77+01@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting KYC:', error);
    process.exit(1);
  }
}

resetKyc();
