import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Google Maps listing share link (office: Ghazipur Flower Market). */
export const GOOGLE_MAPS_URL = "https://share.google/DyRUEeYiTtzBUQCWm";

/** Local ISO date string, offset days from today (e.g. 1 = tomorrow). */
export function isoDay(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function parseAppDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Option keys that `toLocaleDateString` rejects because they carry time. */
const TIME_BEARING_KEYS = ["timeStyle", "hour", "minute", "second", "fractionalSecondDigits"] as const;

export function formatAppDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
  fallback = "Date pending",
): string {
  const date = parseAppDate(value);
  if (!date) return fallback;
  // `timeStyle`/`hour`/... throw "Invalid option" on toLocaleDateString, so
  // delegate to toLocaleString when a caller asks for a time component.
  const wantsTime = TIME_BEARING_KEYS.some((key) => options[key] !== undefined);
  return wantsTime ? date.toLocaleString("en-IN", options) : date.toLocaleDateString("en-IN", options);
}

export function formatAppDateTime(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
  fallback = "Date pending",
): string {
  const date = parseAppDate(value);
  return date ? date.toLocaleString("en-IN", options) : fallback;
}

/** Converts a product/category name into a URL-safe slug ("Red Rose (12)" → "red-rose-12"). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

/** Maps a preview-only gradient token (e.g. "gradient-blush") to a CSS
 * background used in place of real product photography. See PROJECT_CONTEXT.md
 * — Phase 2 will swap these for real next/image sources.
 */
export const GRADIENT_TOKENS: Record<string, string> = {
  "gradient-blush": "linear-gradient(135deg, #F7E9E3 0%, #EECFC4 100%)",
  "gradient-gold": "linear-gradient(135deg, #F4ECD8 0%, #E3CD93 100%)",
  "gradient-ivory": "linear-gradient(135deg, #FBF7F0 0%, #F4EDE1 100%)",
  "gradient-sage": "linear-gradient(135deg, #EEF1E4 0%, #D8E0C8 100%)",
  "gradient-lavender": "linear-gradient(135deg, #E9E3F0 0%, #D6CBE4 100%)",
};

/** True when a preview token is actually a remote URL (client-supplied real
 * photography) rather than a gradient token. Components use this to decide
 * between next/image and the GRADIENT_TOKENS fallback. */
export function isRemoteImage(src?: string): boolean {
  return Boolean(src && /^https?:\/\//i.test(src));
}

const DIGITS_ONLY = /[^\d]/g;

/** "tel:+918506951873" href from a display number like "+91 85069 51873". */
export function telHref(number?: string): string {
  const digits = (number ?? "+91 85069 51873").replace(DIGITS_ONLY, "");
  return `tel:+${digits}`;
}

/** "https://wa.me/918506951873" href (country code digits only). */
export function waMeHref(number?: string): string {
  const digits = (number ?? "+91 85069 51873").replace(DIGITS_ONLY, "");
  return `https://wa.me/${digits}`;
}
