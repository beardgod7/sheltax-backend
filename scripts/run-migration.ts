import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

  const fileName = process.argv[2];
  if (!fileName) {
    throw new Error(
      'Usage: npx tsx scripts/run-migration.ts <file.sql>\n' +
        `Available: ${fs
          .readdirSync(path.join(__dirname, '..', 'migrations'))
          .filter((name) => name.endsWith('.sql'))
          .join(', ')}`
    );
  }

  const migrationPath = path.join(__dirname, '..', 'migrations', fileName);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration not found: ${fileName}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Migration completed: ${fileName}`);
  } finally {
    await client.end();
  }
}

main().catch((error: any) => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
});
