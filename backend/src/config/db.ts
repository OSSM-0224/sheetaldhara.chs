import mongoose from 'mongoose';
import { ENV } from './env.ts';
import { seedDatabase } from '../db/seed.ts';

const CONNECT_TIMEOUT_MS = 5000;

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * MONGODB_URI unset -> local JSON store (development, single instance only).
 * MONGODB_URI set   -> MongoDB is required; startup fails if it cannot be reached.
 */
export async function connectDB(): Promise<void> {
  if (!ENV.MONGODB_URI) {
    console.warn(
      '[Database] MONGODB_URI is not set. Using the local JSON store: data is not shared between instances and is lost on restart.'
    );
    return;
  }

  try {
    await mongoose.connect(ENV.MONGODB_URI, { serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS });
  } catch (err) {
    // MONGODB_URI is configured, so silently using the per-instance JSON store here would
    // split data across instances and lose writes on restart. Fail loudly instead.
    console.error('[Database] Could not connect to MongoDB:', describe(err));
    throw err;
  }

  console.log('[Database] Connected to MongoDB.');

  try {
    await seedDatabase(false);
  } catch (err) {
    console.warn('[Database] Initial seed skipped:', describe(err));
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/** True only when MongoDB was deliberately left unconfigured. */
export function isLocalMode(): boolean {
  return !ENV.MONGODB_URI;
}

export function getDbStatus() {
  const connected = isDbConnected();
  return {
    connected,
    mode: connected ? 'mongodb' : 'local_storage',
    message: connected
      ? 'Connected to MongoDB'
      : isLocalMode()
        ? 'MONGODB_URI is not set; using the local JSON store.'
        : 'MongoDB is not connected. Configured MONGODB_URI is not being used.',
  };
}

// Without an 'error' listener, a dropped connection is an unhandled event and takes
// the process down. Log it and let the request path surface the failure.
mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error:', describe(err));
});

// Mongoose also emits 'disconnected' while a first connection attempt is failing,
// so only report a loss once a connection has actually been established.
let everConnected = false;
mongoose.connection.on('connected', () => {
  everConnected = true;
});

mongoose.connection.on('disconnected', () => {
  if (everConnected) {
    console.error('[Database] Lost MongoDB connection. Requests will fail until it recovers.');
  }
});
