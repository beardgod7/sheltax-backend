import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';
import sequelize from '../src/config/dbconfig';

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

  const fileName = process.argv[2];
  const migrationsDir = path.join(__dirname, '..', 'migrations');

  if (!fileName) {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((name) => name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.sql'));
    throw new Error(`Usage: npx tsx scripts/run-migration.ts <file>\nAvailable: ${files.join(', ')}`);
  }

  const migrationPath = path.join(migrationsDir, fileName);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration not found: ${fileName}`);
  }

  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();

  try {
    if (fileName.endsWith('.sql')) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await sequelize.query(sql);
    } else {
      const migration = require(migrationPath);
      const up = migration.up || migration.default?.up;
      if (typeof up !== 'function') {
        throw new Error(`Migration file ${fileName} does not export an up() function.`);
      }
      await up(queryInterface, DataTypes);
    }
    console.log(`✅ Migration completed cleanly using Sequelize ORM: ${fileName}`);
  } finally {
    await sequelize.close();
  }
}

main().catch((error: any) => {
  console.error('❌ Migration failed:', error.message);
  process.exitCode = 1;
});
