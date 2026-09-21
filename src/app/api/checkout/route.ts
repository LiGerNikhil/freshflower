import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  BouquetModel,
  CustomerModel,
  FlowerModel,
  OrderModel,
} from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCouponByCode, getDeliveryAreaById } from "@/lib/db/repositories";
import { jsonError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { deliveryAreas } from "@/lib/data";
import { DELIVERY_CHARGE } from "@/lib/cart";
import { getCustomerSession } from "@/lib/auth/customer-session";
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
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Please sign in before placing an order.", 401);
    await dbConnect();

    // ---- delivery capability -------------------------------------------------
    const area =
      deliveryAreas.find((candidate) => candidate.id === input.customer.address.areaId) ??
      (await getDeliveryAreaById(input.customer.address.areaId));
    if (!area || area.active === false) {
      throw new Error("Please select a valid delivery area.");
    }

    const deliveryDate = toDateInput(input.deliveryDate);

    // ---- verify products + punch in DB prices --------------------------------
    const items: { productId: string; productType: "flower" | "bouquet"; name: string; price: number; quantity: number; image?: string }[] = [];
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
        image: Array.isArray(catalog.images) ? catalog.images[0] : undefined,
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
    const deliveryFee = DELIVERY_CHARGE;
    const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100;

    // Customer identity comes only from the signed auth session.
    const customerId = session.customerId;
    const customer = await CustomerModel.findById(customerId)
      .select({ emailVerified: 1 })
      .lean<{ emailVerified?: boolean }>();
    if (!customer) return jsonError("Please sign in before placing an order.", 401);
    if (!customer.emailVerified) return jsonError("Please verify your email before placing an order.", 403);

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
        areaId: area.id,
        pincode: input.customer.address.pincode,
      },
      couponCode: codes.join(", ") || undefined,
      notes: input.customer.notes || undefined,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const nameParts = input.customer.name.trim().split(/\s+/);
    await CustomerModel.updateOne(
      { _id: customerId },
      {
        $set: {
          name: input.customer.name.trim(),
          firstName: nameParts[0] ?? "",
          lastName: nameParts.slice(1).join(" "),
          phone: input.customer.phone,
          addresses: [
            {
              id: "addr-default",
              label: "Home",
              line1: input.customer.address.line,
              city: input.customer.address.city,
              areaId: area.id,
              pincode: input.customer.address.pincode,
              isDefault: true,
            },
          ],
          updatedAt: new Date(),
        },
        $inc: { totalOrders: 1 },
      },
    ).lean();

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
