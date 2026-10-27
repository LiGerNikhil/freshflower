import "server-only";
import { CouponModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import {
  DEFAULT_TIERED_DISCOUNT_CONFIG,
  TIERED_DISCOUNT_ID,
  normalizeTieredDiscountConfig,
  type TieredDiscountConfig,
} from "@/lib/discounts";

/**
 * Loads the automatic tier configuration from the existing Coupon collection.
 *
 * No migration is required: when the document does not exist (fresh install or
 * an older database) the safe defaults are used. Once an admin saves the
 * configuration, that document — including `active: false` — wins.
 */
export async function getTieredDiscountConfig(): Promise<TieredDiscountConfig> {
  await dbConnect();
  const doc = await CouponModel.findOne({
    $or: [{ autoApply: true }, { _id: TIERED_DISCOUNT_ID }],
  }).lean<{
    active?: boolean;
    maxDiscountCap?: number;
    appliesToOrders?: boolean;
    appliesToDiwali?: boolean;
    tiers?: Array<{ threshold?: number; amount?: number }>;
  }>();

  if (!doc) {
    // normalise (and copy) so callers can never mutate the shared default.
    return normalizeTieredDiscountConfig(DEFAULT_TIERED_DISCOUNT_CONFIG);
  }

  return normalizeTieredDiscountConfig({
    active: doc.active !== false,
    maxDiscount: doc.maxDiscountCap,
    appliesToOrders: doc.appliesToOrders,
    appliesToDiwali: doc.appliesToDiwali,
    tiers: Array.isArray(doc.tiers)
      ? doc.tiers.map((tier) => ({
          threshold: Number(tier?.threshold),
          amount: Number(tier?.amount),
        }))
      : undefined,
  });
}
