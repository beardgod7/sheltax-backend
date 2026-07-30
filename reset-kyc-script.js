require("dotenv").config({ override: true });
const sequelize = require("./src/config/dbconfig");
const { User } = require("./src/features/Authentication/model");
const { OwnerProfile, BrokerProfile } = require("./src/features/Profile/model");

async function resetKyc() {
  try {
    await sequelize.authenticate();
    const email = "igwechinonso77+01@gmail.com";
    const user = await User.findOne({ where: { email } });

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
    user.kycStatus = "UNSUBMITTED";
    user.kycLevel = "BASIC";
    user.verified = false;

    await user.save();

    const ownerProfile = await OwnerProfile.findOne({ where: { userId: user.id } });
    if (ownerProfile) {
      ownerProfile.profilePicture = null;
      ownerProfile.governmentId = null;
      ownerProfile.governmentIdType = null;
      ownerProfile.ninCacNumber = null;
      ownerProfile.businessRegistrationNumber = null;
      await ownerProfile.save();
    }

    const brokerProfile = await BrokerProfile.findOne({ where: { userId: user.id } });
    if (brokerProfile) {
      brokerProfile.profilePicture = null;
      brokerProfile.governmentId = null;
      brokerProfile.governmentIdType = null;
      brokerProfile.ninCacNumber = null;
      brokerProfile.businessRegistrationNumber = null;
      await brokerProfile.save();
    }

    console.log("SUCCESS: KYC submission reset to UNSUBMITTED for igwechinonso77+01@gmail.com");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting KYC:", error);
    process.exit(1);
  }
}

resetKyc();
