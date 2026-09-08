import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Local ISO date string, offset days from today (e.g. 1 = tomorrow). */
export function isoDay(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
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
