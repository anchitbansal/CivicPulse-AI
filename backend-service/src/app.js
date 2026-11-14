import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ticketRoutes from './routes/tickets.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/workers.js';
import assignmentRoutes from './routes/assignments.js';
import verificationRoutes from './routes/verifications.js';
import notificationRoutes from './routes/notifications.js';
import { authenticate, requireRole } from './middleware/auth.js';
import { logger } from './services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const details = {
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      responseTimeMs: Number(durationMs.toFixed(2)),
    };
    if (res.statusCode >= 400) {
      logger.warn('HTTP request failed', details);
    } else {
      logger.info('HTTP request', details);
    }
  });
  next();
});

// Serve uploaded media files statically
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CivicPulse Multi-Portal backend' });
});

// Portal API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', authenticate, ticketRoutes);
app.use('/api/workers', authenticate, requireRole('admin', 'supervisor'), workerRoutes);
app.use('/api/assignments', authenticate, assignmentRoutes);
app.use('/api/verifications', authenticate, verificationRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/chat', authenticate, chatRoutes);

app.use((err, _req, res, _next) => {
  logger.error('Unhandled backend exception', {
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

export default app;
