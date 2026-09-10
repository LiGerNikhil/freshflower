/**
 * Environment configuration — validated once at startup.
 *
 * These secrets are server-only (no NEXT_PUBLIC_ prefix). Any code that
 * touches MongoDB or Cloudinary must go through `env()` (or `env.` accessors)
 * so a missing/invalid configuration fails loudly at first use instead of
 * silently falling back to dummy data in production.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        "Add it to .env.local (see .env.example) or the hosting platform's environment settings.",
    );
  }
  return value.trim();
}

/**
 * Validates the shared MONGODB_URI + CLOUDINARY_URL pair. Both are required
 * for THIS application in every environment (dev, preview, production) — one
 * shared Atlas cluster and one shared Cloudinary account, never a second
 * local/dev database.
 */
export function env(): { MONGODB_URI: string; CLOUDINARY_URL: string } {
  const MONGODB_URI = requireEnv("MONGODB_URI");
  const CLOUDINARY_URL = requireEnv("CLOUDINARY_URL");
  return { MONGODB_URI, CLOUDINARY_URL };
}

export const MONGODB_URI = () => env().MONGODB_URI;
export const CLOUDINARY_URL = () => env().CLOUDINARY_URL;