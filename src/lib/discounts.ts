import type { Coupon, CouponTier } from "@/lib/types";

/**
 * Automatic tiered cart rewards.
 *
 * This module is intentionally dependency-free so the same calculation is used
 * by the cart UI, checkout API, Diwali booking API and the admin preview.
 * All money is converted to integer paise before comparing or adding.
 */

/** Reserved "code" stored on orders that received the automatic reward. */
export const TIERED_DISCOUNT_CODE = "AUTO-TIER";
/** Document id used by the existing coupons admin/API for the tier config. */
export const TIERED_DISCOUNT_ID = "cpn-auto-tier";

/**
 * Hard business ceiling. Admin configuration is clamped to this value, so a
 * malformed/hostile config can never produce a larger per-order reward.
 */
export const TIERED_DISCOUNT_ABSOLUTE_CAP = 500;

export type DiscountChannel = "orders" | "diwali";

export interface TieredDiscountConfig {
  active: boolean;
  /** Maximum reward per order, in rupees. Always <= TIERED_DISCOUNT_ABSOLUTE_CAP. */
  maxDiscount: number;
  appliesToOrders: boolean;
  appliesToDiwali: boolean;
  tiers: CouponTier[];
}

export interface TierCheckpoint extends CouponTier {
  unlocked: boolean;
  /** The next milestone the customer is currently progressing toward. */
  active: boolean;
}

export interface TieredDiscountResult {
  enabled: boolean;
  channel: DiscountChannel;
  eligibleSubtotal: number;
  discount: number;
  activeTier: CouponTier | null;
  nextTier: CouponTier | null;
  /** Exact gap in rupees. UI rounds up so it never understates the amount. */
  amountToNext: number;
  maxUnlocked: boolean;
  maxDiscount: number;
  /** 0–1 progress against the highest configured threshold. */
  progress: number;
  checkpoints: TierCheckpoint[];
}

export const DEFAULT_TIERS: CouponTier[] = [
  { threshold: 1_000, amount: 50 },
  { threshold: 2_000, amount: 100 },
  { threshold: 5_000, amount: 250 },
  { threshold: 10_000, amount: 500 },
];

export const DEFAULT_TIERED_DISCOUNT_CONFIG: TieredDiscountConfig = {
  active: true,
  maxDiscount: TIERED_DISCOUNT_ABSOLUTE_CAP,
  appliesToOrders: true,
  appliesToDiwali: true,
  tiers: DEFAULT_TIERS,
};

function toPaise(value: number): number {
  return Math.round(value * 100);
}

function fromPaise(value: number): number {
  return value / 100;
}

/** Null for anything that is not a finite, safe money value. */
function safePaise(value: unknown): number | null {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number" || !Number.isFinite(numeric)) return null;
  const paise = Math.round(numeric * 100);
  return Number.isSafeInteger(paise) ? paise : null;
}

/**
 * Sanitises admin/user supplied configuration.
 *
 * - drops non-numeric, zero/negative and duplicate tiers
 * - sorts by threshold (highest eligible tier wins)
 * - clamps every amount and the overall cap to ₹500
 * - never throws, so a bad config simply yields no/smaller discounts
 */
export function normalizeTieredDiscountConfig(
  input: Partial<TieredDiscountConfig> | null | undefined,
): TieredDiscountConfig {
  const source = input ?? {};
  const requestedCap =
    safePaise(source.maxDiscount) ?? toPaise(TIERED_DISCOUNT_ABSOLUTE_CAP);
  const capPaise = Math.min(
    Math.max(0, requestedCap),
    toPaise(TIERED_DISCOUNT_ABSOLUTE_CAP),
  );

  const byThreshold = new Map<number, number>();
  const rawTiers = Array.isArray(source.tiers) ? source.tiers.slice(0, 20) : [];
  for (const rawTier of rawTiers) {
    if (!rawTier || typeof rawTier !== "object") continue;
    const thresholdPaise = safePaise((rawTier as CouponTier).threshold);
    const amountPaise = safePaise((rawTier as CouponTier).amount);
    if (
      thresholdPaise === null ||
      amountPaise === null ||
      thresholdPaise <= 0 ||
      amountPaise <= 0
    ) {
      continue;
    }
    const cappedAmount = Math.min(amountPaise, capPaise);
    if (cappedAmount <= 0) continue;
    byThreshold.set(
      thresholdPaise,
      Math.max(byThreshold.get(thresholdPaise) ?? 0, cappedAmount),
    );
  }

  const tiers = [...byThreshold.entries()]
    .sort(([left], [right]) => left - right)
    .map(([thresholdPaise, amountPaise]) => ({
      threshold: fromPaise(thresholdPaise),
      amount: fromPaise(amountPaise),
    }));

  return {
    active: source.active !== false,
    maxDiscount: fromPaise(capPaise),
    appliesToOrders: source.appliesToOrders !== false,
    appliesToDiwali: source.appliesToDiwali !== false,
    tiers,
  };
}

/**
 * Highest eligible tier only. No stacking: the returned discount is a single
 * tier amount, additionally clamped by the configured cap and the subtotal.
 */
export function computeTieredDiscount(
  subtotal: number,
  config: Partial<TieredDiscountConfig> | null | undefined,
  channel: DiscountChannel = "orders",
): TieredDiscountResult {
  const normalized = normalizeTieredDiscountConfig(config);
  const subtotalPaise = Number.isFinite(subtotal)
    ? Math.max(0, Math.round(subtotal * 100))
    : 0;
  const enabled =
    normalized.active &&
    normalized.tiers.length > 0 &&
    (channel === "orders"
      ? normalized.appliesToOrders
      : normalized.appliesToDiwali);
  const capPaise = toPaise(normalized.maxDiscount);

  let activeIndex = -1;
  normalized.tiers.forEach((tier, index) => {
    if (subtotalPaise >= toPaise(tier.threshold)) activeIndex = index;
  });

  const activeTier = activeIndex >= 0 ? normalized.tiers[activeIndex] : null;
  const nextTier =
    activeIndex + 1 < normalized.tiers.length
      ? normalized.tiers[activeIndex + 1]
      : null;
  const maxUnlocked = enabled && !nextTier && Boolean(activeTier);
  const highestThresholdPaise = toPaise(
    normalized.tiers[normalized.tiers.length - 1]?.threshold ?? 0,
  );

  const discountPaise =
    enabled && activeTier
      ? Math.min(toPaise(activeTier.amount), capPaise, subtotalPaise)
      : 0;
  const amountToNextPaise =
    enabled && nextTier
      ? Math.max(0, toPaise(nextTier.threshold) - subtotalPaise)
      : 0;
  const progress =
    highestThresholdPaise > 0
      ? Math.min(1, subtotalPaise / highestThresholdPaise)
      : 0;

  const checkpoints: TierCheckpoint[] = normalized.tiers.map((tier) => ({
    ...tier,
    unlocked: enabled && subtotalPaise >= toPaise(tier.threshold),
    active: enabled && nextTier?.threshold === tier.threshold,
  }));

  return {
    enabled,
    channel,
    eligibleSubtotal: fromPaise(subtotalPaise),
    discount: fromPaise(discountPaise),
    activeTier,
    nextTier,
    amountToNext: fromPaise(amountToNextPaise),
    maxUnlocked,
    maxDiscount: normalized.maxDiscount,
    progress,
    checkpoints,
  };
}

/**
 * Integer-paise calculator for manually entered coupons. Kept here so the
 * checkout API and the public validation endpoint cannot drift.
 */
export function couponDiscount(
  subtotal: number,
  coupon: Pick<
    Coupon,
    "discountType" | "discountValue" | "maxDiscountCap" | "minOrderValue"
  >,
): number {
  const subtotalPaise = Number.isFinite(subtotal)
    ? Math.max(0, Math.round(subtotal * 100))
    : 0;
  const value = Number.isFinite(coupon.discountValue)
    ? Math.max(0, coupon.discountValue)
    : 0;
  const cap =
    coupon.maxDiscountCap === undefined
      ? Number.MAX_SAFE_INTEGER
      : Math.max(0, Math.round(coupon.maxDiscountCap * 100));

  const rawPaise =
    coupon.discountType === "percentage"
      ? Math.round((subtotalPaise * value) / 100)
      : Math.round(value * 100);

  return fromPaise(
    Math.max(0, Math.min(rawPaise, cap, subtotalPaise)),
  );
}

/** ₹1,050 / ₹1,050.50 — only shows paise when they exist. */
export function formatDiscountINR(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(safe) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safe);
}
