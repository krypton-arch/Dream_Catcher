import pool from './database.js';

// Create dreams table and indexes in PostgreSQL if they don't exist
export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dreams (
        id SERIAL PRIMARY KEY,
        dream_text TEXT NOT NULL,
        interpretation TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams (created_at DESC);
    `);
    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default { initDatabase };
