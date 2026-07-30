import sequelize from '../config/dbconfig';
import { Listing } from '../features/Listing/model';
import { User } from '../features/Authentication/model';

async function listProperties() {
  await sequelize.authenticate();
  const properties = await Listing.findAll({
    include: [{ model: User, as: 'owner', attributes: ['id', 'email', 'firstName', 'surname'] }],
  });
  console.log(`Total properties in DB: ${properties.length}`);
  properties.forEach((p: any) => {
    console.log(`ID: ${p.id} | Title: "${p.title}" | Owner: ${p.owner?.email} | Status: ${p.approvalStatus}`);
  });
}

listProperties().then(() => process.exit(0));
