import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { getCouponByCode } from "@/lib/db/repositories";
import { jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { couponValidationSchema } from "@/lib/validation";
import {
  TIERED_DISCOUNT_CODE,
  computeTieredDiscount,
  couponDiscount,
} from "@/lib/discounts";
import { getTieredDiscountConfig } from "@/lib/server/tiered-discount";

export const dynamic = "force-dynamic";

/**
 * Display-only validation for the cart's coupon field.
 *
 * This endpoint never creates an order and its answer is never trusted: the
 * checkout API repeats the same authoritative calculation against DB prices.
 */
export async function POST(request: NextRequest) {
  return safe(async () => {
    const input = parseOrThrow(
      couponValidationSchema,
      await readJson(request),
    );
    await dbConnect();

    const config = await getTieredDiscountConfig();
    const tier = computeTieredDiscount(input.subtotal, config, "orders");
    if (tier.discount > 0) {
      return jsonOk({
        ok: true,
        source: "tiered",
        discount: tier.discount,
        codes: [],
        message: `Automatic ${tier.discount} reward applied — coupon codes can't be combined.`,
      });
    }

    let discount = 0;
    const applied: string[] = [];
    const seen = new Set<string>();
    const now = Date.now();

    for (const rawCode of input.codes) {
      const code = rawCode.trim().toUpperCase();
      if (!code || code === TIERED_DISCOUNT_CODE || seen.has(code)) continue;
      seen.add(code);

      const coupon = await getCouponByCode(code);
      if (!coupon || !coupon.active || coupon.autoApply) continue;
      if (coupon.validFrom && new Date(coupon.validFrom).getTime() > now) continue;
      if (coupon.validUntil && new Date(coupon.validUntil).getTime() < now) continue;
      if (coupon.minOrderValue && input.subtotal < coupon.minOrderValue) continue;

      discount += couponDiscount(input.subtotal, coupon);
      applied.push(coupon.code);
    }

    discount = Math.min(
      Math.round(discount * 100) / 100,
      Math.round(input.subtotal * 100) / 100,
    );

    return jsonOk({
      ok: true,
      source: applied.length ? "coupon" : "none",
      discount,
      codes: applied,
      message: applied.length
        ? `Coupon applied: ${applied.join(", ")}`
        : "That code is not valid for this order.",
    });
  });
}
