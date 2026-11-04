import 'dotenv/config';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { initDatabase } from '../config/database-init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  const dbPath = process.env.DATABASE_PATH || join(dirname(__dirname), 'dreams.db');
  
  if (!existsSync(dbPath)) {
    console.log(`SQLite database not found at ${dbPath}. Skipping migration.`);
    await pool.end();
    return;
  }

  console.log(`Reading SQLite database at ${dbPath}...`);
  const sqliteDb = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const dreams = await sqliteDb.all('SELECT * FROM dreams ORDER BY id ASC');
  console.log(`Found ${dreams.length} dream records in SQLite.`);

  console.log('Ensuring PostgreSQL tables are initialized...');
  await initDatabase();

  let insertedCount = 0;
  for (const dream of dreams) {
    const result = await pool.query(
      `INSERT INTO dreams (id, dream_text, interpretation, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET dream_text = EXCLUDED.dream_text,
           interpretation = EXCLUDED.interpretation,
           created_at = EXCLUDED.created_at`,
      [dream.id, dream.dream_text, dream.interpretation, dream.created_at]
    );
    if (result.rowCount > 0) {
      insertedCount++;
    }
  }

  // Update sequence to avoid duplicate primary key errors on future inserts
  await pool.query(`
    SELECT setval(
      pg_get_serial_sequence('dreams', 'id'),
      COALESCE((SELECT MAX(id) FROM dreams), 1),
      true
    );
  `);

  console.log(`Successfully migrated ${insertedCount} records into PostgreSQL!`);

  await sqliteDb.close();
  await pool.end();
}

migrate().catch(async (error) => {
  console.error('Migration failed:', error);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
