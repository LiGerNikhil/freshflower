import { after } from "next/server";
import { CustomerModel, OrderModel } from "@/lib/db/models";
import { sendOrderConfirmationEmail } from "@/lib/auth/customer-email";
import { razorpayClient } from "@/lib/payments/razorpay";
import { eventId, recordPaymentEvent } from "@/lib/payments/events";

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
};

type RazorpayPaymentLike = {
  id: string;
  order_id: string;
  amount: number | string;
  currency: string;
  status: string;
  method?: string;
  captured?: boolean;
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
    after(async () => {
      try {
        const customer = await CustomerModel.findById(order.customerId).lean<{ email?: string; name?: string }>();
        if (!customer?.email) return;
        await sendOrderConfirmationEmail({ email: customer.email, name: customer.name ?? "Customer", orderNumber: order.orderNumber, total: order.total, items: order.items, deliveryAddress: order.deliveryAddress ?? {} });
        await OrderModel.updateOne({ _id: order._id }, { $set: { orderConfirmationEmailSentAt: new Date() } });
      } catch (error) {
        console.error("Razorpay order confirmation email failed.", error);
      }
    });
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
