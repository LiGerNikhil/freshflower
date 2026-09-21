import type { NextRequest, NextResponse } from "next/server";

export const CUSTOMER_SESSION_COOKIE = "ff_customer_session";
const CUSTOMER_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

interface CustomerSessionPayload {
  customerId: string;
  exp: number;
}

function secret(): string {
  const value = process.env.CUSTOMER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? process.env.MONGODB_URI;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("Missing CUSTOMER_SESSION_SECRET.");
  }
  return value ?? "freshflower-preview-customer-session-secret-change-me";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJson(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = base64UrlToBytes(left);
  const b = base64UrlToBytes(right);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

export async function createCustomerSessionToken(customerId: string): Promise<string> {
  const payload = encodeJson({
    customerId,
    exp: Math.floor(Date.now() / 1000) + CUSTOMER_SESSION_TTL_SECONDS,
  } satisfies CustomerSessionPayload);
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyCustomerSessionToken(token: string | undefined): Promise<CustomerSessionPayload | null> {
  if (!token) return null;
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;
  const expected = await hmac(payloadPart);
  if (!constantTimeEqual(signature, expected)) return null;
  const payload = decodeJson<CustomerSessionPayload>(payloadPart);
  if (!payload.customerId || payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function getCustomerSession(request: NextRequest | Request): Promise<CustomerSessionPayload | null> {
  const token =
    "cookies" in request
      ? request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
      : request.headers
          .get("cookie")
          ?.split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith(`${CUSTOMER_SESSION_COOKIE}=`))
          ?.slice(CUSTOMER_SESSION_COOKIE.length + 1);
  return verifyCustomerSessionToken(token);
}

export async function setCustomerSessionCookie(response: NextResponse, customerId: string) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, await createCustomerSessionToken(customerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_SESSION_TTL_SECONDS,
  });
}
