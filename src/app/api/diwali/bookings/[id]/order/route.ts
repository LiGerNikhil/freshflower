import { NextRequest } from "next/server";
import { DeliveryAreaModel, DiwaliBookingModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { DIWALI_PORTER_DELIVERY_FEE } from "@/lib/festivals";
import { OrderStatus } from "@/lib/types";
import type { DiwaliBooking } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export const maxDuration = 60;

/**
 * Creates (or reuses) the standard Order that carries the Razorpay payment for
 * a Diwali advance booking. No stock is reserved: the booking is a request and
 * the linked order exists so the existing payment, webhook, email and account
 * order flows work unchanged.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    const session = await getCustomerSession(request);
    if (!session) return jsonError("Please sign in to pay.", 401);
    const { id } = await params;
    await dbConnect();

    const booking = await DiwaliBookingModel.findOne({
      _id: id,
      customerId: session.customerId,
    }).lean<DiwaliBooking & { _id: string }>();
    if (!booking) return jsonError("Booking not found.", 404);
    if (booking.status === "cancelled" || booking.status === "rejected") {
      return jsonError("This booking was cancelled. Please start a new booking.", 409);
    }
    if (booking.paymentStatus === "paid" && booking.orderId) {
      return jsonOk({ ok: true, orderId: booking.orderId, amount: booking.paymentAmount ?? booking.estimatedAmount ?? 0, alreadyPaid: true });
    }
    if (booking.paymentStatus === "refunded") {
      return jsonError("This booking payment was refunded.", 409);
    }

    const itemsSubtotal = Math.round(
      booking.items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0),
    );
    const amount = Math.round(
      Number(booking.paymentAmount ?? booking.estimatedAmount ?? itemsSubtotal + DIWALI_PORTER_DELIVERY_FEE),
    );
    if (!Number.isFinite(amount) || amount < 1) {
      return jsonError("We could not compute an advance amount. Please contact us on WhatsApp.", 409);
    }
    const deliveryFee = Math.max(0, amount - itemsSubtotal);

    const existing = await OrderModel.findOne({ diwaliBookingId: booking._id }).lean<{ _id: string; total: number; paymentStatus?: string }>();
    if (existing) {
      if (!booking.orderId) {
        await DiwaliBookingModel.updateOne({ _id: booking._id }, { $set: { orderId: existing._id } });
      }
      return jsonOk({
        ok: true,
        orderId: existing._id,
        amount: existing.total,
        alreadyPaid: existing.paymentStatus === "paid",
      });
    }

    const area = await DeliveryAreaModel.findById(booking.deliveryAreaId).select({ name: 1 }).lean<{ name?: string }>();
    const orderId = `ord-diwali-${booking.reference}`;
    const notes = [
      `Diwali advance booking ${booking.reference}.`,
      `Preferred delivery time: ${booking.deliveryTimePreference}.`,
      booking.specialInstructions ? `Instructions: ${booking.specialInstructions}` : "",
      booking.customRequirements ? `Custom / bulk: ${booking.customRequirements}` : "",
      booking.needsQuote ? "Final amount subject to team confirmation." : "",
    ].filter(Boolean).join("\n");

    await OrderModel.findOneAndUpdate(
      { _id: orderId },
      {
        $setOnInsert: {
          _id: orderId,
          orderNumber: booking.reference,
          customerId: session.customerId,
          items: booking.items.map((item) => ({
            productId: item.productId,
            productType: "flower" as const,
            name: item.name,
            price: Number(item.price ?? 0),
            quantity: item.quantity,
            image: item.image,
            color: item.variant,
            unitLabel: item.unitLabel,
          })),
          subtotal: itemsSubtotal,
          deliveryFee,
          discount: 0,
          total: amount,
          status: OrderStatus.Received,
          deliveryAreaId: booking.deliveryAreaId,
          deliverySlotId: "diwali-advance",
          deliveryDate: new Date(`${booking.deliveryDate}T00:00:00+05:30`),
          deliveryAddress: {
            id: `diwali-${booking.reference}`,
            label: "Diwali delivery",
            line1: booking.address,
            city: booking.locality || area?.name || "New Delhi",
            areaId: booking.deliveryAreaId,
            pincode: booking.pincode,
            isDefault: false,
          },
          notes,
          paymentMethod: "online",
          paymentStatus: "pending",
          paymentState: "awaiting_payment",
          paymentCurrency: "INR",
          source: "diwali",
          diwaliBookingId: booking._id,
          bookingReference: booking.reference,
          deliveryTimePreference: booking.deliveryTimePreference,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    await DiwaliBookingModel.updateOne(
      { _id: booking._id, customerId: session.customerId },
      { $set: { orderId, status: "awaiting_payment", paymentStatus: booking.paymentStatus ?? "pending" } },
    );

    return jsonOk({ ok: true, orderId, amount });
  });
}
