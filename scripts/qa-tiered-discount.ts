import assert from "node:assert/strict";
import dotenv from "dotenv";
import {
  BouquetModel,
  CouponModel,
  CustomerModel,
  DeliveryAreaModel,
  DiwaliBookingModel,
  FestivalCollectionModel,
  FlowerModel,
  OrderModel,
} from "../src/lib/db/models";
import { dbConnect } from "../src/lib/db/connect";

dotenv.config({ path: ".env.local" });

/**
 * Live QA for the tiered cart reward.
 *
 * Runs against a running dev/prod server with the real database:
 *  - registers a throwaway customer and verifies it directly in Mongo
 *  - posts tampered checkout payloads at every tier boundary
 *  - checks the persisted Order matches the server-computed totals
 *  - repeats a checkoutRequestId to prove duplicate submits are idempotent
 *  - injects a malformed admin config to prove the ₹500 ceiling holds
 *  - creates a Diwali booking and its linked order, proving no double discount
 *  - removes everything it created (and restores flower stock)
 */

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const stamp = Date.now();
const qaEmail = `qa.tiered.${stamp}@example.com`;
const qaPassword = "Qa-tiered-2026!";
const qaPhone = `9${String(stamp).slice(-9)}`;
const DELIVERY_FEE = 299;
const CAP = 500;

let checks = 0;
function pass(name: string) {
  checks += 1;
  console.log(`  ok  ${name}`);
}

async function request(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(30_000),
  });
}

function cookieHeader(response: Response): string {
  const raw = response.headers.get("set-cookie");
  assert(raw, "Expected an auth cookie.");
  return raw
    .split(/,(?=\s*[^;]+=)/)
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

function expectedDiscount(subtotal: number): number {
  // Literal business rules, deliberately not imported from the engine.
  if (subtotal >= 10_000) return 500;
  if (subtotal >= 5_000) return 250;
  if (subtotal >= 2_000) return 100;
  if (subtotal >= 1_000) return 50;
  return 0;
}

interface Product {
  id: string;
  name: string;
  price: number;
  productType: "flower" | "bouquet";
}

interface CartLine extends Product {
  quantity: number;
}

function cartFor(target: number, catalog: Product[]): CartLine {
  let best: CartLine | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const product of catalog) {
    if (!Number.isFinite(product.price) || product.price <= 0) continue;
    for (let quantity = 1; quantity <= 99; quantity += 1) {
      const diff = Math.abs(product.price * quantity - target);
      if (diff < bestDiff) {
        best = { ...product, quantity };
        bestDiff = diff;
      }
    }
  }
  assert(best, `No catalog product can reach ₹${target}.`);
  return best;
}

const createdOrderNumbers: string[] = [];
const createdOrderIds: string[] = [];
const createdBookingIds: string[] = [];
const stockSnapshot = new Map<string, number | undefined>();

async function main() {
  await dbConnect();

  // ---- customer ------------------------------------------------------------
  const register = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "QA Tiered Discount",
      phone: qaPhone,
      email: qaEmail,
      password: qaPassword,
    }),
  });
  let cookie = register.ok ? cookieHeader(register) : "";
  if (!cookie) {
    const login = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: qaEmail, password: qaPassword }),
    });
    assert(login.ok, `QA customer login failed (${login.status}).`);
    cookie = cookieHeader(login);
  }
  await CustomerModel.updateOne(
    { email: qaEmail },
    { $set: { emailVerified: true } },
  ).lean();
  const customer = await CustomerModel.findOne({ email: qaEmail })
    .select({ _id: 1 })
    .lean<{ _id: string }>();
  assert(customer, "QA customer was not created.");
  pass("authenticated throwaway customer");

  const flowers = await FlowerModel.find({
    active: { $ne: false },
    inStock: { $ne: false },
  })
    .select({ name: 1, price: 1, colorVariants: 1 })
    .lean<
      Array<{
        _id: string;
        name: string;
        price?: number;
        colorVariants?: Array<{ color?: string; price?: number }>;
      }>
    >();
  const bouquets = await BouquetModel.find({ active: { $ne: false } })
    .select({ name: 1, price: 1, colors: 1 })
    .lean<Array<{ _id: string; name: string; price?: number; colors?: string[] }>>();

  // Products without variants keep DB price == charged price, which keeps the
  // assertions independent of variant pricing.
  const catalog: Product[] = [
    ...flowers
      .filter((flower) => !(flower.colorVariants?.length ?? 0))
      .map((flower) => ({
        id: String(flower._id),
        name: flower.name,
        price: Number(flower.price ?? 0),
        productType: "flower" as const,
      })),
    ...bouquets
      .filter((bouquet) => !(bouquet.colors?.length ?? 0))
      .map((bouquet) => ({
        id: String(bouquet._id),
        name: bouquet.name,
        price: Number(bouquet.price ?? 0),
        productType: "bouquet" as const,
      })),
  ];
  assert(catalog.length > 0, "No simple products available for QA.");

  const buildPayload = (cart: CartLine, requestId: string) => ({
    customer: {
      name: "QA Tiered Discount",
      phone: qaPhone,
      email: qaEmail,
      address: {
        line: `QA address ${stamp}`,
        city: "New Delhi",
        areaId: "area-new-delhi",
        pincode: "",
      },
      notes: "QA tiered discount run",
      preferCall: false,
    },
    items: [
      {
        productId: cart.id,
        productType: cart.productType,
        name: cart.name,
        quantity: cart.quantity,
        price: cart.price,
      },
    ],
    deliverySlotId: "slot-10-11",
    deliveryDate: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    coupons: [] as string[],
    // Deliberately wrong client-side money, ignored by the server.
    subtotal: 1,
    discount: 9_999,
    deliveryFee: 0,
    total: 1,
    paymentMethod: "cod" as const,
    checkoutRequestId: requestId,
    agreedToTos: true,
  });

  for (const flower of flowers) {
    const doc = await FlowerModel.findById(flower._id).select({ stock: 1 }).lean<{
      stock?: number;
    }>();
    stockSnapshot.set(String(flower._id), doc?.stock);
  }

  // ---- tier boundaries -----------------------------------------------------
  console.log("\nRegular checkout (tampered client totals)");
  const targets: Array<[label: string, target: number]> = [
    ["below ₹1,000", 700],
    ["₹1,000 tier", 1_400],
    ["₹2,000 tier", 3_200],
    ["₹5,000 tier", 6_500],
    ["₹10,000+ cap", 14_000],
  ];

  let duplicatePayload: ReturnType<typeof buildPayload> | null = null;
  let duplicateResponse: any = null;

  for (const [label, target] of targets) {
    const cart = cartFor(target, catalog);
    const subtotal = cart.price * cart.quantity;
    const discount = expectedDiscount(subtotal);
    const payload = buildPayload(cart, `qa-tiered-${stamp}-${target}`);
    const response = await request("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(payload),
    });
    const body: any = await response.json().catch(() => null);
    assert(response.ok, `${label}: checkout failed — ${body?.error ?? response.status}`);

    assert.equal(body.totals.subtotal, subtotal, `${label}: server subtotal`);
    assert.equal(body.totals.discount, discount, `${label}: server discount`);
    assert.equal(body.totals.total, subtotal - discount + DELIVERY_FEE, `${label}: server total`);
    assert.notEqual(body.totals.discount, 9_999, `${label}: tampered discount ignored`);
    assert.notEqual(body.totals.total, 1, `${label}: tampered total ignored`);

    const stored = await OrderModel.findOne({ orderNumber: body.orderNumber }).lean<any>();
    assert(stored, `${label}: order not persisted`);
    assert.equal(stored.subtotal, subtotal, `${label}: stored subtotal`);
    assert.equal(stored.discount, discount, `${label}: stored discount`);
    assert.equal(stored.deliveryFee, DELIVERY_FEE, `${label}: stored delivery fee`);
    assert.equal(stored.total, subtotal - discount + DELIVERY_FEE, `${label}: stored total`);
    assert.equal(
      stored.couponCode,
      discount > 0 ? "AUTO-TIER" : undefined,
      `${label}: stored coupon marker`,
    );
    createdOrderNumbers.push(body.orderNumber);
    createdOrderIds.push(body.orderId);
    pass(`${label} → ₹${subtotal} cart, ₹${discount} reward, total ₹${stored.total}`);

    if (target === 3_200) {
      duplicatePayload = payload;
      duplicateResponse = body;
    }
  }

  // ---- duplicate submit ----------------------------------------------------
  assert(duplicatePayload && duplicateResponse, "Duplicate fixture missing.");
  const duplicate = await request("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(duplicatePayload),
  });
  const duplicateBody: any = await duplicate.json().catch(() => null);
  assert(duplicate.ok, "Duplicate checkout failed.");
  assert.equal(duplicateBody.orderId, duplicateResponse.orderId, "Duplicate returned a different order.");
  const duplicateCount = await OrderModel.countDocuments({
    checkoutRequestId: duplicatePayload.checkoutRequestId,
  });
  assert.equal(duplicateCount, 1, "Duplicate submit created a second order.");
  pass("duplicate checkoutRequestId is idempotent");

  // ---- no stacking with a real manual coupon ------------------------------
  console.log("\nNo stacking");
  const manualCoupon = await CouponModel.findOne({
    active: true,
    autoApply: { $ne: true },
    code: { $ne: "AUTO-TIER" },
  }).lean<{ code: string } | null>();
  const stackCart = cartFor(6_500, catalog);
  const stackSubtotal = stackCart.price * stackCart.quantity;
  const stackPayload = buildPayload(stackCart, `qa-tiered-${stamp}-stack`);
  stackPayload.coupons = [manualCoupon?.code ?? "STACKTEST", manualCoupon?.code ?? "STACKTEST"];
  const stackResponse = await request("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(stackPayload),
  });
  const stackBody: any = await stackResponse.json().catch(() => null);
  assert(stackResponse.ok, `Stack checkout failed — ${stackBody?.error ?? stackResponse.status}`);
  assert.equal(
    stackBody.totals.discount,
    expectedDiscount(stackSubtotal),
    "A coupon stacked on top of the tier reward.",
  );
  const stackStored = await OrderModel.findOne({ orderNumber: stackBody.orderNumber }).lean<any>();
  assert.equal(stackStored.couponCode, "AUTO-TIER", "Manual coupon was recorded alongside the tier.");
  createdOrderNumbers.push(stackBody.orderNumber);
  createdOrderIds.push(stackBody.orderId);
  pass(
    manualCoupon
      ? `manual code ${manualCoupon.code} ignored while the ₹${expectedDiscount(stackSubtotal)} reward applies`
      : "duplicate/unknown manual codes do not stack (no active manual coupon in DB)",
  );

  // ---- malformed admin config cannot over-discount ------------------------
  console.log("\nMalformed admin config");
  const originalConfig = await CouponModel.findById("cpn-auto-tier").lean<any>();
  await CouponModel.updateOne(
    { _id: "cpn-auto-tier" },
    {
      $set: {
        code: "AUTO-TIER",
        description: "QA malformed config",
        discountType: "flat",
        discountValue: 9_999,
        maxDiscountCap: 99_999,
        active: true,
        autoApply: true,
        tiers: [
          { threshold: 100, amount: 9_999 },
          { threshold: 200, amount: -50 },
          { threshold: -1, amount: 9_999 },
        ],
      },
    },
    { upsert: true },
  );
  const cappedCart = cartFor(14_000, catalog);
  const cappedSubtotal = cappedCart.price * cappedCart.quantity;
  const cappedResponse = await request("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(buildPayload(cappedCart, `qa-tiered-${stamp}-capped`)),
  });
  const cappedBody: any = await cappedResponse.json().catch(() => null);
  assert(cappedResponse.ok, `Capped checkout failed — ${cappedBody?.error ?? cappedResponse.status}`);
  assert.equal(
    cappedBody.totals.discount,
    CAP,
    "Malformed admin config produced a discount above the ₹500 ceiling.",
  );
  createdOrderNumbers.push(cappedBody.orderNumber);
  createdOrderIds.push(cappedBody.orderId);
  pass(`malformed admin config (₹9,999 tier / cap) clamped to ₹${CAP}`);

  // restore / remove the injected config
  await CouponModel.deleteOne({ _id: "cpn-auto-tier" });
  if (originalConfig) {
    const { _id, __v, ...rest } = originalConfig;
    await CouponModel.create({ _id: "cpn-auto-tier", ...rest });
  }
  const restored = await request("/api/discounts");
  const restoredBody: any = await restored.json().catch(() => null);
  pass(
    `tier config restored (max ${restoredBody?.config?.maxDiscount}, ${restoredBody?.config?.tiers?.length} tiers)`,
  );

  // ---- Diwali advance booking ---------------------------------------------
  console.log("\nDiwali advance booking");
  const campaign = await FestivalCollectionModel.findById("festival-diwali").lean<any>();
  if (!campaign?.advanceBooking) {
    console.log("  skip  Diwali campaign is not configured");
  } else {
    const settings = campaign.advanceBooking;
    const eligibleIds: string[] = campaign.productIds ?? [];
    const diwaliProducts = await FlowerModel.find({
      _id: { $in: eligibleIds },
      active: { $ne: false },
      inStock: { $ne: false },
      stockStatus: { $ne: "sold-out" },
    })
      .select({ name: 1, price: 1, colorVariants: 1 })
      .lean<Array<{ _id: string; name: string; price?: number; colorVariants?: any[] }>>();
    const simpleDiwali = diwaliProducts.filter(
      (product) => !(product.colorVariants?.length ?? 0),
    );
    const deliveryDate: string = settings.deliveryDates?.[0] ?? "";
    const timePreference: string = settings.deliveryTimePreferences?.[0] ?? "";
    const areaId: string = settings.deliveryAreaIds?.[0] ?? "area-new-delhi";
    const deliveryArea = await DeliveryAreaModel.findById(areaId)
      .select({ pincode: 1 })
      .lean<any>();
    const pincode: string =
      (Array.isArray(deliveryArea?.pincode) ? deliveryArea.pincode[0] : undefined) ?? "110001";

    if (!simpleDiwali.length || !deliveryDate || !timePreference) {
      console.log("  skip  no simple Diwali products / dates available");
    } else {
      const bookingTargets = [1_400, 6_500];
      for (const target of bookingTargets) {
        const product = cartFor(
          target,
          simpleDiwali.map((item) => ({
            id: String(item._id),
            name: item.name,
            price: Number(item.price ?? 0),
            productType: "flower" as const,
          })),
        );
        const bookingResponse = await request("/api/diwali/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({
            customer: {
              name: "QA Tiered Discount",
              phone: qaPhone,
              email: qaEmail,
            },
            items: [{ productId: product.id, quantity: product.quantity }],
            deliveryDate,
            deliveryTimePreference: timePreference,
            deliveryAreaId: areaId,
            address: `QA Diwali address ${stamp}`,
            locality: "New Delhi",
            pincode,
          }),
        });
        const bookingBody: any = await bookingResponse.json().catch(() => null);
        if (
          bookingResponse.status === 409 &&
          /closed|limit/i.test(String(bookingBody?.error ?? ""))
        ) {
          console.log(`  skip  ${bookingBody.error}`);
          break;
        }
        assert(
          bookingResponse.ok,
          `Diwali booking failed — ${bookingBody?.error ?? bookingResponse.status}`,
        );
        const subtotal = Number(bookingBody.itemsSubtotal);
        const discount = expectedDiscount(subtotal);
        assert.equal(bookingBody.discount, discount, "Diwali booking reward mismatch");
        assert.equal(
          bookingBody.estimatedAmount,
          subtotal - discount + DELIVERY_FEE,
          "Diwali payable must be subtotal − reward + ₹299",
        );

        const storedBooking = await DiwaliBookingModel.findById(bookingBody.booking.id).lean<any>();
        assert(storedBooking, "Diwali booking was not persisted.");
        assert.equal(storedBooking.discount, discount, "Stored booking discount mismatch");
        assert.equal(storedBooking.deliveryFee, DELIVERY_FEE, "Stored Porter fee mismatch");
        assert.equal(
          storedBooking.paymentAmount,
          subtotal - discount + DELIVERY_FEE,
          "Stored payable mismatch",
        );
        createdBookingIds.push(String(storedBooking._id));

        const orderResponse = await request(
          `/api/diwali/bookings/${bookingBody.booking.id}/order`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookie },
            body: JSON.stringify({}),
          },
        );
        const orderBody: any = await orderResponse.json().catch(() => null);
        assert(orderResponse.ok, `Diwali order failed — ${orderBody?.error ?? orderResponse.status}`);
        assert.equal(orderBody.amount, subtotal - discount + DELIVERY_FEE, "Advance amount mismatch");

        const linkedOrder = await OrderModel.findOne({ diwaliBookingId: storedBooking._id }).lean<any>();
        assert(linkedOrder, "Linked Diwali order missing.");
        assert.equal(linkedOrder.discount, discount, "Linked order double-applied or lost the reward");
        assert.equal(linkedOrder.subtotal, subtotal, "Linked order subtotal mismatch");
        assert.equal(linkedOrder.deliveryFee, DELIVERY_FEE, "Linked order Porter fee mismatch");
        assert.equal(linkedOrder.total, subtotal - discount + DELIVERY_FEE, "Linked order total mismatch");
        assert.equal(linkedOrder.couponCode, "AUTO-TIER", "Linked order reward marker missing");
        createdOrderIds.push(String(linkedOrder._id));
        createdOrderNumbers.push(String(linkedOrder.orderNumber));
        pass(
          `Diwali ₹${subtotal} booking → ₹${discount} reward, ₹${linkedOrder.total} payable (single application)`,
        );
      }
    }
  }
}

async function cleanup() {
  // Restore flower stock consumed by QA checkouts.
  for (const [id, stock] of stockSnapshot) {
    if (stock === undefined) continue;
    await FlowerModel.updateOne({ _id: id }, { $set: { stock } }).lean();
  }
  if (createdBookingIds.length) {
    await DiwaliBookingModel.deleteMany({ _id: { $in: createdBookingIds } }).lean();
  }
  if (createdOrderIds.length) {
    await OrderModel.deleteMany({ _id: { $in: createdOrderIds } }).lean();
  }
  if (createdOrderNumbers.length) {
    await OrderModel.deleteMany({ orderNumber: { $in: createdOrderNumbers } }).lean();
  }
  await CustomerModel.deleteMany({ email: qaEmail }).lean();
}

main()
  .then(async () => {
    await cleanup();
    console.log(`\n${checks} live checks passed. QA data removed.`);
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(`\nFAILED: ${error instanceof Error ? error.message : error}`);
    await cleanup().catch(() => undefined);
    process.exit(1);
  });
