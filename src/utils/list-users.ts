import { sequelize } from '../config/database';
import { User } from '../models';

async function listUsers() {
  await sequelize.authenticate();
  const users = await User.findAll({
    attributes: ['id', 'email', 'firstName', 'surname', 'role', 'isVerified'],
    raw: true,
  });
  console.log('Registered Users:', users);
}

listUsers().then(() => process.exit(0));
