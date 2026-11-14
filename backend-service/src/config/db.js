import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabaseIfNeeded } from '../seed/seedData.js';
import { logger } from '../services/logger.js';

let memoryServer;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return { mode: 'configured', databaseName: mongoose.connection.name };
  }

  const configuredUri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (configuredUri) {
    logger.info('Database connection attempt', { mode: 'configured' });
    try {
      await mongoose.connect(configuredUri, { serverSelectionTimeoutMS: 5000 });
    } catch (error) {
      logger.error('Configured database connection failed', {
        message: error.message,
        code: error.code || error.name || 'UNKNOWN',
      });
      if (isProduction) {
        throw new Error('Configured MongoDB connection failed in production.');
      }
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }

    if (mongoose.connection.readyState === 1) {
      logger.info('Database connection established', {
        mode: configuredUri.startsWith('mongodb+srv://') ? 'atlas' : 'configured',
        database: mongoose.connection.name,
      });
      await seedDatabaseIfNeeded();
      return { mode: 'configured', databaseName: mongoose.connection.name };
    }
  } else if (isProduction) {
    logger.error('MONGODB_URI is missing in production');
    throw new Error('MONGODB_URI must be configured in production.');
  }

  logger.warn('Using temporary in-memory database; data will not persist across restarts.', {
    mode: 'in-memory-fallback',
  });
  try {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        binary: {
          version: '7.0.14',
        },
      });
    }

    const uri = memoryServer.getUri('civicpulse');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    logger.warn('In-memory database connection established; persistence is disabled.', {
      mode: 'in-memory-fallback',
      database: mongoose.connection.name,
    });
    await seedDatabaseIfNeeded();
    return { mode: 'in-memory-fallback', databaseName: mongoose.connection.name };
  } catch (error) {
    logger.error('Database unavailable in configured and fallback modes', {
      message: error.message,
      code: error.code || error.name || 'UNKNOWN',
    });
    throw error;
  }
};
