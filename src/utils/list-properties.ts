import { sequelize } from '../config/database';
import { Property, User } from '../models';

async function listProperties() {
  await sequelize.authenticate();
  const properties = await Property.findAll({
    include: [{ model: User, as: 'owner', attributes: ['id', 'email', 'firstName', 'surname'] }],
  });
  console.log(`Total properties in DB: ${properties.length}`);
  properties.forEach((p) => {
    console.log(`ID: ${p.id} | Title: "${p.title}" | Owner: ${(p as any).owner?.email} | Status: ${p.approvalStatus}`);
  });
}

listProperties().then(() => process.exit(0));
