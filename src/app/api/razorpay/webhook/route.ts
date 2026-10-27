import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { OrderModel } from "@/lib/db/models";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import {
  confirmRazorpayPayment,
  markRazorpayPaymentFailed,
  recordRazorpayEvent,
  type RazorpayOrderRecord,
} from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return safe(async () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Razorpay webhook rejected: RAZORPAY_WEBHOOK_SECRET is not configured.");
      return jsonError("Webhook is not configured.", 503);
    }
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    if (!/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(createHmac("sha256", secret).update(raw).digest(), Buffer.from(signature, "hex"))) {
      console.error("Razorpay webhook rejected: invalid signature.");
      return jsonError("Invalid webhook signature.", 400);
    }
    let body;
    try { body = JSON.parse(raw); } catch { return jsonError("Invalid JSON.", 400); }

    const event: string = body.event;
    const handled = ["payment.captured", "payment.authorized", "order.paid", "payment.failed"];
    if (!handled.includes(event)) return jsonOk({ ignored: true });

    const payment = body.payload?.payment?.entity;
    if (typeof payment?.id !== "string" || typeof payment?.order_id !== "string") {
      return jsonError("Missing payment details.", 400);
    }

    await dbConnect();
    const order = await OrderModel.findOne({ razorpayOrderId: payment.order_id, paymentMethod: "online" }).lean<RazorpayOrderRecord>();
    if (!order) return jsonOk({ ignored: true });

    if (event === "payment.failed") {
      await markRazorpayPaymentFailed(order, payment.id, {
        reason: typeof payment.error_description === "string" ? payment.error_description : "",
        amount: Number(payment.amount) || 0,
      });
      return jsonOk({ recorded: true });
    }

    const failure = await confirmRazorpayPayment(order, payment.id);
    if (failure) {
      if (event === "payment.authorized") {
        // Capture did not complete yet; record it and let reconciliation retry.
        await recordRazorpayEvent(order._id, payment.id, "payment.authorized", {
          amount: Number(payment.amount) || 0,
          reason: failure.error,
        });
        console.error("Razorpay authorized payment not captured:", { orderId: order._id, paymentId: payment.id, reason: failure.error });
        return jsonOk({ deferred: true });
      }
      console.error("Razorpay webhook confirmation failed:", { event, orderId: order._id, paymentId: payment.id, reason: failure.error });
      return jsonError(failure.error, failure.status);
    }
    return jsonOk({ ok: true });
  });
}
