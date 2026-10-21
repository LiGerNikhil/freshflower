import { NextRequest } from "next/server";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { dbConnect } from "@/lib/db/connect";
import { OrderModel } from "@/lib/db/models";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { razorpayConfig, validPaymentSignature } from "@/lib/payments/razorpay";
import { confirmRazorpayPayment, type RazorpayOrderRecord } from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);
    const body = await req.json().catch(() => null);
    if (![body?.razorpay_order_id, body?.razorpay_payment_id, body?.razorpay_signature].every(v => typeof v === "string" && v.length > 0 && v.length <= 200)) return jsonError("Payment ID, order ID and signature are required.", 400);
    await dbConnect();
    const order = await OrderModel.findOne({ razorpayOrderId: body.razorpay_order_id, customerId: session.customerId, paymentMethod: "online" }).lean<RazorpayOrderRecord>();
    if (!order) return jsonError("Order not found.", 404);
    if (!order.razorpayOrderId || !validPaymentSignature(order.razorpayOrderId, body.razorpay_payment_id, body.razorpay_signature, razorpayConfig().keySecret)) {
      console.error("Razorpay signature verification failed:", { orderId: order._id, paymentId: body.razorpay_payment_id });
      return jsonError("Invalid payment signature.", 400);
    }
    const failure = await confirmRazorpayPayment(order, body.razorpay_payment_id);
    if (failure) {
      console.error("Razorpay payment confirmation failed:", { orderId: order._id, paymentId: body.razorpay_payment_id, reason: failure.error });
      return jsonError(failure.error, failure.status);
    }
    return jsonOk({ ok: true, orderId: order._id });
  });
}
