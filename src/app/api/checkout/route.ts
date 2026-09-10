import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  BouquetModel,
  CustomerModel,
  FlowerModel,
  OrderModel,
} from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCouponByCode, getDeliveryAreaByPincode, getDeliverySlotById } from "@/lib/db/repositories";
import { parseOrThrow, readJson, safe, jsonOk } from "@/lib/api/helpers";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { OrderStatus } from "@/lib/types";

function toDateInput(value: string): string {
  // Accept both the HTML date (YYYY-MM-DD) and full ISO forms.
  return value.length === 10 ? `${value}T10:00:00.000Z` : value;
}

function randomOrderNumber(): string {
  return `FF-${10000 + crypto.randomInt(90000)}`;
}

function couponDiscount(
  subtotal: number,
  coupon: {
    discountType: "percentage" | "flat";
    discountValue: number;
    maxDiscountCap?: number;
  },
): number {
  if (coupon.discountType === "percentage") {
    const raw = (subtotal * coupon.discountValue) / 100;
    return Math.min(raw, coupon.maxDiscountCap ?? raw);
  }
  return Math.min(coupon.discountValue, coupon.maxDiscountCap ?? coupon.discountValue);
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const input: CheckoutInput = parseOrThrow(checkoutSchema, await readJson(req));
    await dbConnect();

    // ---- delivery capability -------------------------------------------------
    const area = await getDeliveryAreaByPincode(input.customer.address.pincode);
    if (!area) {
      throw new Error("Sorry, we don't deliver to this pincode yet.");
    }
    const slot = await getDeliverySlotById(input.deliverySlotId);
    if (!slot) throw new Error("That delivery slot no longer exists.");
    if (slot.enabled === false) throw new Error("That delivery slot is currently unavailable.");

    const deliveryDate = toDateInput(input.deliveryDate);
    const capacity = slot.maxOrders ?? 3;
    const used = await OrderModel.countDocuments({
      deliveryDate: { $eq: new Date(deliveryDate) },
      deliverySlotId: input.deliverySlotId,
      status: { $ne: OrderStatus.Cancelled },
    });
    if (used >= capacity) {
      throw new Error("That delivery slot just filled up — please pick another.");
    }

    // ---- verify products + punch in DB prices --------------------------------
    const items: { productId: string; productType: "flower" | "bouquet"; name: string; price: number; quantity: number }[] = [];
    let subtotal = 0;
    for (const item of input.items) {
      const catalog =
        item.productType === "bouquet"
          ? await BouquetModel.findById(item.productId).lean()
          : await FlowerModel.findById(item.productId).lean();
      if (!catalog) throw new Error(`"${item.name}" is no longer available.`);
      if (catalog.active === false) throw new Error(`"${item.name}" is currently unavailable.`);
      const price = typeof catalog.price === "number" ? catalog.price : item.price;
      subtotal += price * item.quantity;
      items.push({
        productId: String(catalog._id),
        productType: item.productType === "bouquet" ? "bouquet" : "flower",
        name: typeof catalog.name === "string" ? catalog.name : item.name,
        price,
        quantity: item.quantity,
      });
    }

    // ---- authoritative totals ------------------------------------------------
    let discount = 0;
    const codes: string[] = [];
    for (const code of input.coupons) {
      const coupon = await getCouponByCode(code);
      if (!coupon || !coupon.active) continue;
      const now = Date.now();
      if (coupon.validFrom && new Date(coupon.validFrom).getTime() > now) continue;
      if (coupon.validUntil && new Date(coupon.validUntil).getTime() < now) continue;
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) continue;
      discount += couponDiscount(subtotal, coupon);
      codes.push(coupon.code);
    }
    discount = Math.min(discount, subtotal);
    const deliveryFee = area.deliveryFee ?? 0;
    const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100;

    // ---- customer (upsert by phone) ------------------------------------------
    const customerId = `cust-${input.customer.phone}`;
    const firstName = input.customer.name.trim().split(/\s+/)[0] ?? "";
    const lastName = input.customer.name.trim().split(/\s+/).slice(1).join(" ");
    await CustomerModel.updateOne(
      { _id: customerId },
      {
        $set: {
          name: input.customer.name.trim(),
          firstName,
          lastName,
          phone: input.customer.phone,
          email: input.customer.email,
        },
        $inc: { totalOrders: 1 },
        $setOnInsert: {
          tags: ["website"],
          addresses: [
            {
              id: `addr-${Date.now().toString(36)}`,
              label: "Checkout",
              line1: input.customer.address.line,
              line2: input.customer.address.landmark ?? undefined,
              city: input.customer.address.city,
              pincode: input.customer.address.pincode,
              isDefault: true,
            },
          ],
        },
      },
      { upsert: true },
    ).lean();

    // ---- order (unique orderNumber with retry) --------------------------------
    let orderNumber = randomOrderNumber();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const exists = await OrderModel.exists({ orderNumber });
      if (!exists) break;
      orderNumber = randomOrderNumber();
    }
    const orderId = `ord-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
    await OrderModel.create({
      _id: orderId,
      orderNumber,
      customerId,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      discount: Math.round(discount * 100) / 100,
      total,
      status: OrderStatus.Received,
      deliveryAreaId: area.id,
      deliverySlotId: input.deliverySlotId,
      deliveryDate: new Date(deliveryDate),
      deliveryAddress: {
        line1: input.customer.address.line,
        line2: input.customer.address.landmark ?? undefined,
        city: input.customer.address.city,
        pincode: input.customer.address.pincode,
      },
      couponCode: codes.join(", ") || undefined,
      notes: input.customer.notes || undefined,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ---- decrement stock for flowers ----------------------------------------
    for (const item of items) {
      if (item.productType !== "flower") continue;
      await FlowerModel.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } },
      ).lean();
    }

    return jsonOk({
      ok: true,
      orderId,
      orderNumber,
      totals: { subtotal, discount, deliveryFee, total },
    }, 201);
  });
}