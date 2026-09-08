import type { Coupon } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
export const coupons: Coupon[] = [
  {
    id: "cpn-1",
    code: "WELCOME10",
    description: "10% off your first order",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 500,
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: "2026-12-31T23:59:59.000Z",
    active: true,
  },
  {
    id: "cpn-2",
    code: "MORNING50",
    description: "Flat ₹50 off on 5–7 AM express slots",
    discountType: "flat",
    discountValue: 50,
    minOrderValue: 699,
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: "2026-12-31T23:59:59.000Z",
    active: true,
  },
  {
    id: "cpn-3",
    code: "FEST100",
    description: "₹100 off during festival season",
    discountType: "flat",
    discountValue: 100,
    minOrderValue: 1000,
    validFrom: "2026-09-01T00:00:00.000Z",
    validUntil: "2026-11-15T23:59:59.000Z",
    active: true,
  },
];
