import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const configuredUri = process.env.MONGODB_URI;

  if (configuredUri) {
    try {
      await mongoose.connect(configuredUri, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB connected successfully using configured URI');
      return;
    } catch (error) {
      console.warn('Configured MongoDB URI failed; falling back to local in-memory database.', error.message);
    }
  }

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
    console.log('MongoDB connected successfully using in-memory fallback');
  } catch (error) {
    console.error('MongoDB unavailable in configured and fallback modes.', error.message);
  }
};
