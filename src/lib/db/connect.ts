// PHASE 2 INTEGRATION — not active in preview.
// This connection helper is written ahead of time so Phase 2 only needs to
// wire /lib/data/*.ts calls over to the models in this folder. Nothing in
// this file is imported by any page or component yet.

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// eslint-disable-next-line no-var
declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. This is expected in the Phase 0 preview build — " +
        "dbConnect() is not called anywhere yet."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
