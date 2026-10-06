import bcrypt from "bcryptjs";
import { randomInt, timingSafeEqual } from "crypto";

const SALT_ROUNDS = 12;

export const EMAIL_OTP_TTL_MS = 15 * 60 * 1000;
export const EMAIL_OTP_MAX_ATTEMPTS = 5;
export const EMAIL_OTP_RESEND_COOLDOWN_MS = 60 * 1000;

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

export function createEmailOtp(): string {
  return String(randomInt(100000, 1000000));
}

export async function hashEmailOtp(otp: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`ffz-email-otp:v1:${otp}`),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyEmailOtp(otp: string, hash?: string): Promise<boolean> {
  if (!hash || !/^\d{6}$/.test(otp)) return false;
  const candidate = Buffer.from(await hashEmailOtp(otp), "hex");
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
