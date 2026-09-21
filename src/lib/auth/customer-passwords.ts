import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export async function hashCustomerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyCustomerPassword(password: string, hash?: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createEmailVerificationToken(customerId: string, email: string): Promise<string> {
  const data = `${customerId}:${email}:${Date.now()}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
