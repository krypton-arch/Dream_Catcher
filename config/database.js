import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

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
