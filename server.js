import 'dotenv/config';
console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);
console.log("Gemini model:", process.env.GEMINI_MODEL);
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet'
import pool from './config/database.js';
import { initDatabase } from './config/database-init.js';
import dreamsRouter from './routes/dreams.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();


if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}
// Needed for security headers! Do not delete!
// app.use(helmet());

const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Application and Database Health Check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'UP',
      application: 'Dream Catcher',
      database: 'CONNECTED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      status: 'DOWN',
      application: 'Dream Catcher',
      database: 'DISCONNECTED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/shutdown', (req, res) => {
  console.log('=== MANUAL SHUTDOWN TRIGGERED ===');
  res.send('Shutting down...');
  
  setTimeout(() => {
    process.kill(process.pid, 'SIGTERM');
  }, 100);
});



// API Routes
app.use('/api/dreams', dreamsRouter);

process.on('SIGINT', ()=> {
  console.log('Starting graceful shutdown')
})

let server
let isShuttingDown = false;

// Start HTTP server immediately so cloud platforms (Render, Railway, Heroku) detect port binding
server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Initialize database with retries to handle cloud database boot delays gracefully
async function initializeDatabaseWithRetry(maxRetries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initDatabase();
      console.log('Database connected and initialized successfully');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(
          'Could not connect to PostgreSQL. The server will stay running to respond to /health (reporting DOWN). ' +
          'Please verify that DATABASE_URL is set in your environment variables.'
        );
      }
    }
  }
}

initializeDatabaseWithRetry();


async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received, shutting down gracefully`);

  // Stop accepting new HTTP requests
  if (server) {
    server.close(async (error) => {
      if (error) {
        console.error('Error closing HTTP server:', error);
        process.exitCode = 1;
      } else {
        console.log('HTTP server closed');
      }

      try {
        await pool.end();
        console.log('Database pool closed');
      } catch (dbError) {
        console.error('Error closing database pool:', dbError);
        process.exitCode = 1;
      }
    });
  } else {
    try {
      await pool.end();
      console.log('Database pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
      process.exitCode = 1;
    }
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
