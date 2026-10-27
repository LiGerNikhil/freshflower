import assert from "node:assert/strict";
import {
  DEFAULT_TIERED_DISCOUNT_CONFIG,
  TIERED_DISCOUNT_ABSOLUTE_CAP,
  computeTieredDiscount,
  couponDiscount,
  normalizeTieredDiscountConfig,
} from "../src/lib/discounts";

let checks = 0;

function check(name: string, fn: () => void) {
  fn();
  checks += 1;
  console.log(`  ok  ${name}`);
}

function discountFor(subtotal: number): number {
  return computeTieredDiscount(subtotal, DEFAULT_TIERED_DISCOUNT_CONFIG).discount;
}

console.log("Tiered discount engine");

check("empty cart has no reward", () => {
  const result = computeTieredDiscount(0, DEFAULT_TIERED_DISCOUNT_CONFIG);
  assert.equal(result.discount, 0);
  assert.equal(result.enabled, true);
  assert.equal(result.activeTier, null);
  assert.equal(result.nextTier?.threshold, 1000);
});

check("below ₹1,000 has no reward", () => {
  assert.equal(discountFor(800), 0);
  assert.equal(discountFor(999), 0);
  assert.equal(discountFor(999.99), 0);
});

check("₹1,000 unlocks exactly ₹50", () => {
  assert.equal(discountFor(1000), 50);
  assert.equal(discountFor(1500), 50);
  assert.equal(discountFor(1999.99), 50);
});

check("₹2,000 unlocks exactly ₹100", () => {
  assert.equal(discountFor(2000), 100);
  assert.equal(discountFor(4999), 100);
  assert.equal(discountFor(4999.99), 100);
});

check("₹5,000 unlocks exactly ₹250", () => {
  assert.equal(discountFor(5000), 250);
  assert.equal(discountFor(9999), 250);
  assert.equal(discountFor(9999.99), 250);
});

check("₹10,000 unlocks exactly ₹500", () => {
  assert.equal(discountFor(10000), 500);
  assert.equal(discountFor(25000), 500);
  assert.equal(discountFor(100000), 500);
});

check("only the highest tier applies (no stacking)", () => {
  const result = computeTieredDiscount(10000, DEFAULT_TIERED_DISCOUNT_CONFIG);
  assert.equal(result.discount, 500);
  assert.equal(result.activeTier?.amount, 500);
  assert.equal(result.maxUnlocked, true);
});

check("next-milestone gaps are dynamic and correct", () => {
  const cases: Array<[number, number, number]> = [
    [700, 300, 50],
    [1500, 500, 100],
    [3000, 2000, 250],
    [7000, 3000, 500],
  ];
  for (const [subtotal, gap, nextAmount] of cases) {
    const result = computeTieredDiscount(subtotal, DEFAULT_TIERED_DISCOUNT_CONFIG);
    assert.equal(result.amountToNext, gap, `gap at ${subtotal}`);
    assert.equal(result.nextTier?.amount, nextAmount, `next amount at ${subtotal}`);
  }
  const maxed = computeTieredDiscount(10000, DEFAULT_TIERED_DISCOUNT_CONFIG);
  assert.equal(maxed.maxUnlocked, true);
  assert.equal(maxed.amountToNext, 0);
  assert.equal(maxed.nextTier, null);
});

check("paise subtotals round safely at the threshold", () => {
  assert.equal(discountFor(999.99), 0);
  assert.equal(discountFor(999.995), 50);
  assert.equal(discountFor(1999.999), 100);
  assert.equal(discountFor(1999.994), 50);
});

check("discount can never exceed the ₹500 hard cap", () => {
  const result = computeTieredDiscount(
    50000,
    normalizeTieredDiscountConfig({
      active: true,
      maxDiscount: 5000,
      tiers: [{ threshold: 1000, amount: 5000 }],
    }),
  );
  assert.equal(result.discount, TIERED_DISCOUNT_ABSOLUTE_CAP);
  assert.equal(result.maxDiscount, TIERED_DISCOUNT_ABSOLUTE_CAP);
});

check("admin cap below ₹500 is respected", () => {
  const config = normalizeTieredDiscountConfig({
    active: true,
    maxDiscount: 120,
    tiers: [
      { threshold: 1000, amount: 50 },
      { threshold: 2000, amount: 100 },
      { threshold: 5000, amount: 250 },
    ],
  });
  assert.equal(computeTieredDiscount(1000, config).discount, 50);
  assert.equal(computeTieredDiscount(2000, config).discount, 100);
  assert.equal(computeTieredDiscount(5000, config).discount, 120);
});

check("malformed config fails safe", () => {
  const malformed = normalizeTieredDiscountConfig({
    active: true,
    maxDiscount: Number.NaN,
    tiers: [
      { threshold: 1000, amount: 50 },
      { threshold: 1000, amount: 900 },
      { threshold: -5, amount: 100 },
      { threshold: 2000, amount: -10 },
      { threshold: Number.NaN, amount: 100 },
      // @ts-expect-error deliberately malformed input
      { threshold: "5000", amount: "250" },
    ],
  });
  assert.equal(malformed.tiers.length, 2);
  assert.deepEqual(malformed.tiers[0], { threshold: 1000, amount: 500 });
  assert.deepEqual(malformed.tiers[1], { threshold: 5000, amount: 250 });
  assert.equal(
    computeTieredDiscount(5000, malformed).discount,
    250,
    "numeric strings are accepted but still capped",
  );
  assert.equal(
    computeTieredDiscount(1000, malformed).discount,
    500,
    "a malformed duplicate can never exceed the hard cap",
  );
  assert.equal(
    computeTieredDiscount(100000, malformed).discount,
    250,
    "the highest eligible tier's amount is the only reward",
  );
});

check("unsorted tiers are sorted by threshold", () => {
  const config = normalizeTieredDiscountConfig({
    active: true,
    maxDiscount: 500,
    tiers: [
      { threshold: 5000, amount: 250 },
      { threshold: 1000, amount: 50 },
      { threshold: 2000, amount: 100 },
    ],
  });
  assert.deepEqual(
    config.tiers.map((tier) => tier.threshold),
    [1000, 2000, 5000],
  );
  assert.equal(computeTieredDiscount(3000, config).discount, 100);
});

check("inactive promotion yields no discount", () => {
  const config = { ...DEFAULT_TIERED_DISCOUNT_CONFIG, active: false };
  const result = computeTieredDiscount(5000, config);
  assert.equal(result.enabled, false);
  assert.equal(result.discount, 0);
});

check("channel eligibility is independent", () => {
  const ordersOnly = normalizeTieredDiscountConfig({
    ...DEFAULT_TIERED_DISCOUNT_CONFIG,
    appliesToDiwali: false,
  });
  assert.equal(computeTieredDiscount(5000, ordersOnly, "orders").discount, 250);
  assert.equal(computeTieredDiscount(5000, ordersOnly, "diwali").discount, 0);

  const diwaliOnly = normalizeTieredDiscountConfig({
    ...DEFAULT_TIERED_DISCOUNT_CONFIG,
    appliesToOrders: false,
  });
  assert.equal(computeTieredDiscount(5000, diwaliOnly, "orders").discount, 0);
  assert.equal(computeTieredDiscount(5000, diwaliOnly, "diwali").discount, 250);
});

check("checkpoint states are locked/active/unlocked", () => {
  const result = computeTieredDiscount(1500, DEFAULT_TIERED_DISCOUNT_CONFIG);
  assert.deepEqual(
    result.checkpoints.map((checkpoint) => ({
      threshold: checkpoint.threshold,
      unlocked: checkpoint.unlocked,
      active: checkpoint.active,
    })),
    [
      { threshold: 1000, unlocked: true, active: false },
      { threshold: 2000, unlocked: false, active: true },
      { threshold: 5000, unlocked: false, active: false },
      { threshold: 10000, unlocked: false, active: false },
    ],
  );
});

console.log("\nManual coupon helper");

check("flat coupon supports a cap", () => {
  assert.equal(
    couponDiscount(1500, {
      discountType: "flat",
      discountValue: 100,
      maxDiscountCap: 60,
    }),
    60,
  );
});

check("percentage coupon uses paise and cap", () => {
  assert.equal(
    couponDiscount(999.99, {
      discountType: "percentage",
      discountValue: 10,
      maxDiscountCap: 500,
    }),
    100,
  );
  assert.equal(
    couponDiscount(1500, {
      discountType: "percentage",
      discountValue: 10,
      maxDiscountCap: 50,
    }),
    50,
  );
});

check("coupon discount is clamped to the subtotal", () => {
  assert.equal(
    couponDiscount(80, {
      discountType: "flat",
      discountValue: 500,
    }),
    80,
  );
});

console.log(`\n${checks} checks passed.`);
