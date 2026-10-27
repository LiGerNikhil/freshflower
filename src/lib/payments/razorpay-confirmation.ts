import { after } from "next/server";
import { CustomerModel, DiwaliBookingModel, OrderModel } from "@/lib/db/models";
import { razorpayClient } from "@/lib/payments/razorpay";
import { eventId, queueOrderConfirmationEmail, recordPaymentEvent } from "@/lib/payments/events";
import { processPaymentEmailOutbox } from "@/lib/payments/email-outbox";

export type RazorpayOrderRecord = {
  _id: string;
  customerId: string;
  orderNumber: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentState?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayPaymentMethod?: string;
  paidAt?: Date;
  items: { name: string; quantity: number; price: number; color?: string }[];
  deliveryAddress?: { line1?: string; city?: string; pincode?: string };
  source?: string;
  diwaliBookingId?: string;
  bookingReference?: string;
};

type RazorpayPaymentLike = {
  id: string;
  order_id: string;
  amount: number | string;
  currency: string;
  status: string;
  method?: string;
  captured?: boolean;
  created_at?: number;
};

/**
 * Razorpay auto-capture is the primary path. If a payment arrives as
 * `authorized` (auto-capture disabled or raced), capture it here so a customer
 * who saw "success" is never left with a pending order.
 */
async function captureIfAuthorized(payment: RazorpayPaymentLike, amountPaise: number): Promise<RazorpayPaymentLike> {
  if (payment.status !== "authorized") return payment;
  try {
    const captured = await razorpayClient().payments.capture(payment.id, amountPaise, "INR");
    return captured as unknown as RazorpayPaymentLike;
  } catch (error) {
    // Another worker (webhook/callback) may have captured it first.
    console.error("Razorpay capture attempt failed, re-fetching payment:", payment.id, error);
    const refreshed = await razorpayClient().payments.fetch(payment.id);
    return refreshed as unknown as RazorpayPaymentLike;
  }
}

// A valid signature proves origin; capture, amount and order checks prove settlement.
export async function confirmRazorpayPayment(order: RazorpayOrderRecord, paymentId: string) {
  const amountPaise = Math.round(order.total * 100);
  let payment = (await razorpayClient().payments.fetch(paymentId)) as unknown as RazorpayPaymentLike;
  if (payment.order_id !== order.razorpayOrderId || Number(payment.amount) !== amountPaise || payment.currency !== "INR") {
    console.error("Razorpay payment does not match order:", { paymentId, orderId: order._id, expected: amountPaise, got: payment.amount });
    return { error: "Payment does not match the order.", status: 400 };
  }
  payment = await captureIfAuthorized(payment, amountPaise);
  if (payment.status !== "captured") {
    console.error("Razorpay payment is not captured:", { paymentId, orderId: order._id, status: payment.status });
    return { error: "Payment is not captured yet. Please check again shortly; do not pay again.", status: 409 };
  }
  if (order.paymentStatus === "refunded") return { error: "This order was refunded.", status: 409 };
  const updated = await OrderModel.updateOne(
    { _id: order._id, razorpayOrderId: payment.order_id, paymentStatus: { $in: ["pending", null] } },
    {
      $set: {
        paymentStatus: "paid",
        paymentState: "paid",
        paymentMethod: "online",
        razorpayPaymentId: payment.id,
        razorpayPaymentMethod: payment.method,
        paidAt: new Date(),
      },
    },
  );
  // Callback/webhook races must not each dispatch a confirmation email.
  if (updated.modifiedCount) {
    await recordPaymentEvent({
      id: eventId(["payment.captured", order._id, payment.id]),
      type: "payment.captured",
      orderId: order._id,
      paymentAttemptId: `razorpay:${payment.id}`,
      actor: "razorpay",
      metadata: {
        provider: "razorpay",
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        amount: amountPaise,
        method: payment.method ?? "",
      },
    });
  }

  // Diwali advance bookings carry their payment on a linked order. Sync the
  // booking on every confirmation path (callback, webhook, admin sync) so the
  // customer's order and the admin booking list always agree.
  if (order.diwaliBookingId) {
    await OrderModel.updateOne(
      { _id: order._id, status: { $in: ["received", "confirmed"] } },
      { $set: { status: "confirmed" } },
    );
    await DiwaliBookingModel.updateOne(
      { _id: order.diwaliBookingId },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          paymentAmount: order.total,
          orderId: order._id,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          razorpayPaymentMethod: payment.method,
          paidAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
        },
      },
    );
  }
  if (updated.modifiedCount || order.paymentStatus === "paid") {
    const customer = await CustomerModel.findById(order.customerId).select({ email: 1 }).lean<{ email?: string }>();
    if (customer?.email) {
      await queueOrderConfirmationEmail({
        orderId: order._id,
        recipient: customer.email,
        paymentAttemptId: `razorpay:${payment.id}`,
      });
      after(async () => {
        await processPaymentEmailOutbox();
      });
    }
  }
  return null;
}

/** Record a non-success gateway event so the admin timeline shows what happened. */
export async function recordRazorpayEvent(
  orderId: string,
  paymentId: string,
  type: "payment.authorized" | "payment.failed",
  metadata: Record<string, string | number | boolean> = {},
) {
  await recordPaymentEvent({
    id: eventId([type, orderId, paymentId]),
    type,
    orderId,
    paymentAttemptId: `razorpay:${paymentId}`,
    actor: "razorpay",
    metadata: { provider: "razorpay", razorpayPaymentId: paymentId, ...metadata },
  });
}

/**
 * Marks a failed gateway attempt on a Diwali booking while leaving the booking
 * payable, so the customer can retry without losing their selection.
 */
export async function markRazorpayPaymentFailed(
  order: RazorpayOrderRecord,
  paymentId: string,
  metadata: Record<string, string | number | boolean> = {},
) {
  if (order.diwaliBookingId) {
    await DiwaliBookingModel.updateOne(
      { _id: order.diwaliBookingId, paymentStatus: { $ne: "paid" } },
      {
        $set: {
          paymentStatus: "failed",
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: paymentId,
        },
      },
    );
  }
  await recordRazorpayEvent(order._id, paymentId, "payment.failed", metadata);
}
