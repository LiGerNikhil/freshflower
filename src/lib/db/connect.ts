import dns from "node:dns";
import mongoose from "mongoose";
import { MONGODB_URI } from "@/lib/env";

/**
 * Atlas connection made robust against flaky OS resolvers.
 *
 * Some dev machines report DNS through a loopback stub / router / VPN that
 * refuses SRV lookups, which breaks `mongodb+srv://` Atlas URLs and surfaces as
 * `querySrv ECONNREFUSED`. Atlas itself is whitelisted for all IPs, so the only
 * failure point left is client-side DNS. Defence-in-depth below:
 *
 *  1. Pin the process to public resolvers at module load (before the driver
 *     ever resolves anything). `dns.setServers()` is honoured by the MongoDB
 *     driver's SRV resolution.
 *  2. On any DNS-class failure, re-pin and retry with a short backoff.
 *  3. As a last resort, resolve the SRV records ourselves and retry with a
 *     direct `mongodb://` seed-list URI — no SRV lookup needed at all.
 *
 * Works the same in development and production.
 */
const PUBLIC_RESOLVERS = ["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"];

function pinPublicResolvers(): void {
  try {
    const current = dns.getServers();
    const already = PUBLIC_RESOLVERS.every((s) => current.includes(s));
    if (!already) dns.setServers(PUBLIC_RESOLVERS);
  } catch {
    /* dns.setServers can throw for invalid IPs — never fatal here. */
  }
}

pinPublicResolvers();

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Build a direct `mongodb://` URI from the SRV records of an srv-style URL. */
function buildDirectUri(srvUri: string): Promise<string> {
  const url = new URL(srvUri);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("MongoDB SRV lookup timed out"));
    }, 2500);
    // Callback API on the pinned (real) dns builtin. Turbopack's server bundles
    // can contain a second `dns` copy for `node:dns/promises` that does NOT see
    // dns.setServers() — the callback module is consistently the real builtin.
    dns.resolveSrv(`_mongodb._tcp.${url.hostname}`, (error, records) => {
      if (error) {
        clearTimeout(timeout);
        reject(error);
        return;
      }
      const sorted = [...records].sort(
        (a, b) => a.priority - b.priority || b.weight - a.weight,
      );
      const hosts = sorted
        .slice(0, 3)
        .map((record) => `${record.name}:${record.port}`);
      const creds = url.username
        ? `${encodeURIComponent(decodeURIComponent(url.username))}:${encodeURIComponent(
            decodeURIComponent(url.password),
          )}@`
        : "";
      const params = new URLSearchParams(url.search);
      params.delete("srvMaxHosts");
      params.delete("srvServiceName");
      if (!params.get("authSource")) params.set("authSource", "admin");
      if (!params.get("tls") && !params.get("ssl")) params.set("tls", "true");
      const dbPath = url.pathname || "/";
      clearTimeout(timeout);
      resolve(`mongodb://${creds}${hosts.join(",")}${dbPath}?${params.toString()}`);
    });
  });
}

async function connectWithRetry(): Promise<typeof mongoose> {
  const originalUri = MONGODB_URI();
  let lastError: unknown;

  if (originalUri.startsWith("mongodb+srv://")) {
    // Prefer a direct seed-list URI: SRV resolution goes through this process's
    // own dns (which is pinned and verified), so the bundled driver never has
    // to perform its own SRV lookup — avoiding the `querySrv ECONNREFUSED`
    // failure mode seen on machines whose OS resolver refuses SRV.
    try {
      const directUri = await buildDirectUri(originalUri);
      lastError = await mongoose.connect(directUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      return lastError as typeof mongoose;
    } catch (error) {
      lastError = error;
      pinPublicResolvers();
    }
  }

  // Fallback: the original SRV URI (canonical on platforms with working DNS).
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await mongoose.connect(originalUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
    } catch (error) {
      lastError = error;
      pinPublicResolvers();
      await sleep(400 * attempt);
    }
  }

  throw lastError;
}

/**
 * Serverless-safe MongoDB connection via the official MongoDB driver
 * (through Mongoose). Caches the singleton on `global` in dev so hot-reload
 * doesn't open duplicate connections, and reuses a single promise so
 * concurrent requests share one handshake. Fails loudly if the env var is
 * missing rather than silently continuing without a database.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  pinPublicResolvers();

  if (!cached.promise) {
    cached.promise = connectWithRetry();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
