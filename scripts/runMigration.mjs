/**
 * Run the Supabase database migration using direct PostgreSQL connection.
 * Uses SUPABASE_DATABASE_URL from .env
 *
 * Run: node scripts/runMigration.mjs
 */
import pg from 'pg';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

const DB_URL = process.env.SUPABASE_DATABASE_URL;

if (!DB_URL) {
  console.error('❌ SUPABASE_DATABASE_URL not set in .env');
  process.exit(1);
}

async function main() {
  console.log('🗄️  TravelStreams Database Migration Runner');
  console.log('📡 Connecting to Supabase PostgreSQL...');

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const sql = await readFile(sqlPath, 'utf8');

    console.log('🚀 Running migration...');
    await client.query(sql);
    console.log('✅ Migration executed successfully');
    console.log('\n🌱 Now run the seeder:');
    console.log('   npm run db:seed');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

