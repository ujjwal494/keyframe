import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;


/**
 * Global cache for the MongoDB connection.
 * In development, Next.js hot-reloads and re-runs module-level code,
 * which would create multiple connections without this cache.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Ensure all model collections exist in the database.
 *
 * MongoDB transactions cannot create collections — they can only read/write
 * to collections that already exist. If a transaction tries to insert into a
 * collection that hasn't been created yet, it will fail with a
 * "Cannot create namespace in multi-document transaction" error.
 *
 * This function is called once after the first connection and uses Mongoose's
 * `createCollection()` which is a no-op if the collection already exists.
 */
async function ensureCollections() {
  const Answer = (await import("@/app/models/answer")).default;
  const Vote = (await import("@/app/models/vote")).default;
  const Question = (await import("@/app/models/question")).default;
  const User = (await import("@/app/models/user")).default;

  await Promise.all([
    Answer.createCollection(),
    Vote.createCollection(),
    Question.createCollection(),
    User.createCollection(),
  ]);
}

async function dbConnect() {
  // If already connected, return the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      // Pre-create all collections so transactions never fail due to
      // missing collections (MongoDB limitation).
      await ensureCollections();
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
