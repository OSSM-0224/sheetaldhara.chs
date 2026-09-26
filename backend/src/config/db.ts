import tls from 'tls';
import dns from 'dns/promises';
import mongoose from 'mongoose';
import { ENV } from './env.ts';
import { seedDatabase } from '../db/seed.ts';

let isConnected = false;

/**
 * Perform a clean, non-disruptive TLS handshake check to the Atlas cluster endpoint.
 * This determines whether the current Cloud Run / environment IP is whitelisted on MongoDB Atlas
 * without triggering unhandled OpenSSL error alerts or server crashes.
 */
async function probeAtlasTlsHandshake(uri: string): Promise<{ reachable: boolean; ipWhitelistRequired?: boolean }> {
  try {
    const parsed = new URL(uri);
    const host = parsed.host;
    let targetHost = host;
    let targetPort = 27017;

    if (parsed.protocol === 'mongodb+srv:') {
      try {
        const srvRecords = await dns.resolveSrv('_mongodb._tcp.' + host);
        if (srvRecords && srvRecords.length > 0) {
          targetHost = srvRecords[0].name;
          targetPort = srvRecords[0].port || 27017;
        }
      } catch {
        return { reachable: false };
      }
    }

    return await new Promise((resolve) => {
      const socket = tls.connect(
        targetPort,
        targetHost,
        { servername: targetHost, timeout: 2500 },
        () => {
          socket.end();
          resolve({ reachable: true });
        }
      );

      socket.on('error', (err) => {
        socket.destroy();
        const msg = String(err?.message || '');
        if (msg.includes('alert internal error') || msg.includes('SSL alert') || msg.includes('alert number 80')) {
          resolve({ reachable: false, ipWhitelistRequired: true });
        } else {
          resolve({ reachable: false });
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ reachable: false });
      });
    });
  } catch {
    return { reachable: false };
  }
}

/**
 * Connect to MongoDB Atlas cluster using MONGODB_URI.
 * Connects with a fast pre-check and falls back cleanly to local persistent storage
 * if the MongoDB Atlas cluster IP is not yet whitelisted.
 */
export async function connectDB(timeoutMs = 3000): Promise<boolean> {
  const uri = process.env.MONGODB_URI || ENV.MONGODB_URI;

  if (!uri) {
    console.log('[Database] MONGODB_URI is not set; running in local database mode.');
    return false;
  }

  const isLocalMongo = /^mongodb:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::|\/)/i.test(uri);

  if (!isLocalMongo) {
    const probe = await probeAtlasTlsHandshake(uri);
    if (!probe.reachable) {
      isConnected = false;
      if (probe.ipWhitelistRequired) {
        console.log('[Database] MongoDB Atlas cluster is awaiting IP whitelist approval (add 0.0.0.0/0 to Atlas IP Access List).');
      } else {
        console.log('[Database] MongoDB Atlas cluster is currently unreachable.');
      }
      console.log('[Database] Running seamlessly in persistent local society database mode.');
      return false;
    }
  }

  try {
    console.log(`[Database] Connecting to MongoDB${isLocalMongo ? '' : ' Atlas cluster'}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    isConnected = true;
    console.log('[Database] Connected successfully to MongoDB.');

    // Seed initial demo dataset if collections are empty
    await seedDatabase(false).catch((seedErr) => {
      console.log('[Database] Initial seed check note:', seedErr?.message || 'Completed');
    });

    return true;
  } catch {
    isConnected = false;
    await mongoose.disconnect().catch(() => {});
    console.log('[Database] Operating seamlessly in persistent local database mode.');
    return false;
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] Disconnected from MongoDB.');
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  const connected = isDbConnected();
  return {
    connected,
    mode: connected ? 'mongodb' : 'local_storage',
    message: connected
      ? 'Connected to MongoDB'
      : 'Operating in persistent local database mode. Check MONGODB_URI and the database server status.',
  };
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('error', () => {
  isConnected = false;
});
