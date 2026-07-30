import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Neon serverless / pooler connections
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Neon PostgreSQL database successfully.');
  } catch (error: any) {
    console.error('❌ Database connection issue:', error?.message || error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Dev Mode: Continuing server execution so routes and endpoints remain accessible.');
    }
  }
};
