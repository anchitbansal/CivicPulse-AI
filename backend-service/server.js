import http from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { registerSocketHandlers } from './src/socket/index.js';
import { logger } from './src/services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer backend-service/.env when present, with the repository-root .env as a fallback.
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);
const io = registerSocketHandlers(server);

app.set('io', io);

try {
  const database = await connectDB();
  server.listen(port, () => {
    logger.info('CivicPulse backend listening', {
      port,
      databaseMode: database.mode,
      database: database.databaseName,
    });
  });
} catch (error) {
  logger.error('Backend startup aborted because the database is unavailable', {
    message: error.message,
    code: error.code || error.name || 'UNKNOWN',
  });
  process.exitCode = 1;
}
