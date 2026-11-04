import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString && !process.env.PGHOST) {
  console.warn(
    '\n⚠️  [Database Warning] DATABASE_URL is not set!\n' +
    'The app is falling back to localhost:5432. On cloud hosts like Render, this will cause ECONNREFUSED.\n' +
    'To fix this on Render:\n' +
    '  1. Create a PostgreSQL database on Render (Dashboard -> New -> PostgreSQL)\n' +
    '  2. Copy its "Internal Database URL"\n' +
    '  3. Add DATABASE_URL to your Web Service Environment variables in the Render dashboard.\n'
  );
}

const poolConfig = connectionString
  ? {
      connectionString,
      ssl:
        process.env.DATABASE_SSL === 'true' ||
        (process.env.NODE_ENV === 'production' &&
          !connectionString.includes('localhost') &&
          !connectionString.includes('127.0.0.1'))
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      user: process.env.PGUSER || process.env.DB_USER || 'postgres',
      host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
      database: process.env.PGDATABASE || process.env.DB_NAME || 'dream_catcher',
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
export { pool };
