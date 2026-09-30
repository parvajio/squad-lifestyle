import mongoose from 'mongoose';

function resolveMongoUri(): string {
  const raw = process.env.MONGODB_URI;
  if (raw && raw.trim()) {
    // Ensure a db name — Atlas URIs without one silently land in `test`
    // and look like data loss. Default to squad_lifestyle.
    try {
      const url = new URL(raw.replace(/^mongodb\+srv:\/\//, 'https://'));
      if (!url.pathname || url.pathname === '/') {
        // Handle both `...mongodb.net` and `...mongodb.net/?appName=x`
        // (trailing slash before query string).
        if (raw.includes('?')) {
          return raw.replace(/(\.net)\/?(\?.*)$/, '$1/squad_lifestyle$2');
        }
        return raw.replace(/(\.net)\/?$/, '$1/squad_lifestyle');
      }
    } catch {
      // fall through with raw value
    }
    return raw;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URI is not set. Set it in Vercel Dashboard > Project > Settings > Environment Variables.'
    );
  }
  return 'mongodb://127.0.0.1:27017/squad_lifestyle';
}

export function getDbInfo() {
  const conn = cached.conn;
  const host = conn?.connection?.host ?? 'disconnected';
  const dbName = conn?.connection?.db?.databaseName ?? conn?.connection?.name ?? 'unknown';
  const isMemory = host.includes('127.0.0.1') && String(global.mongoMemoryInstance ?? '').length > 0;
  return { host, dbName, isMemory, readyState: conn?.connection?.readyState ?? 0 };
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var mongoMemoryInstance: unknown;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 10000 : 5000,
    };

    const uri = resolveMongoUri();

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log(`Connected to MongoDB: host=${m.connection.host} db=${m.connection.name}`);
        return m;
      })
      .catch(async (primaryError) => {
        const hint =
          'Could not reach MongoDB Atlas. If on Vercel, add 0.0.0.0/0 in Atlas > Network Access. Locally, whitelist your IP.';
        console.error(hint, primaryError?.message ?? primaryError);

        // Never silently fall back to ephemeral memory DB — that is what
        // made localhost products "disappear after restart".
        // Opt-in only: ALLOW_MEMORY_FALLBACK=1 + non-production.
        if (
          process.env.NODE_ENV === 'production' ||
          process.env.ALLOW_MEMORY_FALLBACK !== '1'
        ) {
          throw primaryError;
        }

        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          let mongoServer = global.mongoMemoryInstance as InstanceType<typeof MongoMemoryServer>;
          if (!mongoServer) {
            mongoServer = await MongoMemoryServer.create();
            global.mongoMemoryInstance = mongoServer;
          }
          const mongoUri = mongoServer.getUri();
          console.log('Connected to Fallback In-Memory MongoDB Server:', mongoUri);
          return await mongoose.connect(mongoUri, { bufferCommands: false });
        } catch (fallbackError) {
          console.error('Fallback MongoDB also failed:', fallbackError);
          throw primaryError;
        }
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
