import { Sequelize } from 'sequelize';
import * as neon from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const databaseUrl = process.env.DATABASE_URL;
const useNeonWebSocket = Boolean(databaseUrl?.includes('.neon.tech'));

if (useNeonWebSocket) {
  neon.neonConfig.webSocketConstructor = ws as any;
}

const sequelize = new Sequelize(databaseUrl || '', {
  dialect: 'postgres',
  ...(useNeonWebSocket ? { dialectModule: neon } : {}),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 15000,
    idle: 10000,
  },
  logging: false,
});

sequelize
  .authenticate()
  .then(async () => {
    console.log('Database connected successfully!');
    try {
      await sequelize.sync({ alter: { drop: false } });
      console.log('Sequelize schema synchronized successfully.');
    } catch (syncErr: any) {
      console.error('Error synchronizing database schema:', syncErr?.message || syncErr);
    }
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

export default sequelize;
