import type { Flower } from "@/lib/types";

/** Lowest price across colour variants, or the base price when there are none. */
export function lowestPrice(flower: Flower): number {
  const variants = flower.colorVariants ?? [];
  if (!variants.length) return flower.price;
  return Math.min(...variants.map((variant) => variant.price));
}

/**
 * Compare-at price to display as the struck-through "was" price. Seeded and
 * admin-edited products carry it either at the top level or per colour
 * variant, so take the highest one that is actually a discount.
 */
export function effectiveCompareAtPrice(flower: Flower): number | undefined {
  const candidates: number[] = [];

  if (flower.compareAtPrice && flower.compareAtPrice > flower.price) {
    candidates.push(flower.compareAtPrice);
  }

  for (const variant of flower.colorVariants ?? []) {
    if (variant.compareAtPrice && variant.compareAtPrice > variant.price) {
      candidates.push(variant.compareAtPrice);
    }
  }

  if (!candidates.length) return undefined;
  const best = Math.max(...candidates);
  return best > lowestPrice(flower) ? best : undefined;
}

/** Whole-percent saving to render as a "% OFF" badge, or null when not on sale. */
export function discountPercent(flower: Flower): number | null {
  const compareAt = effectiveCompareAtPrice(flower);
  if (!compareAt) return null;
  const percent = Math.round((1 - lowestPrice(flower) / compareAt) * 100);
  return percent > 0 ? Math.min(percent, 99) : null;
}

/** True when the flower has any verifiable saving to merchandise. */
export function isOnSale(flower: Flower): boolean {
  return discountPercent(flower) !== null;
}
