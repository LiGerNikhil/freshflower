import { NextRequest } from "next/server";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { dbConnect } from "@/lib/db/connect";
import { OrderModel } from "@/lib/db/models";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { razorpayClient, razorpayConfig } from "@/lib/payments/razorpay";
import { confirmRazorpayPayment, type RazorpayOrderRecord } from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Please sign in to pay.", 401);
    const body = await req.json().catch(() => null);
    if (typeof body?.orderId !== "string") return jsonError("Order ID is required.", 400);
    await dbConnect();
    const order = await OrderModel.findOne({ _id: body.orderId, customerId: session.customerId }).lean<RazorpayOrderRecord>();
    if (!order) return jsonError("Order not found.", 404);
    if (order.paymentMethod !== "online") return jsonError("This order does not use Razorpay.", 400);
    if (order.paymentStatus === "paid") return jsonOk({ alreadyPaid: true });
    if (order.paymentStatus === "refunded") return jsonError("This order was refunded.", 409);
    const amount = Math.round(order.total * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) return jsonError("Minimum payment is 100 paise.", 400);
    const { keyId } = razorpayConfig();
    if (order.razorpayOrderId) {
      const payments = await razorpayClient().orders.fetchPayments(order.razorpayOrderId);
      const settled = payments.items.find(payment => payment.status === "captured" || payment.status === "authorized");
      if (settled) {
        const failure = await confirmRazorpayPayment(order, settled.id);
        if (failure) return jsonError(failure.error, failure.status);
        return jsonOk({ alreadyPaid: true });
      }
      return jsonOk({ order_id: order.razorpayOrderId, amount, currency: "INR", key_id: keyId });
    }
    const lock = await OrderModel.updateOne({ _id: order._id, razorpayOrderId: { $exists: false }, $or: [{ razorpayCreatingAt: { $exists: false } }, { razorpayCreatingAt: { $lt: new Date(Date.now() - 120000) } }] }, { $set: { razorpayCreatingAt: new Date() } });
    if (!lock.modifiedCount) return jsonError("Payment is being prepared. Please retry shortly.", 409);
    try {
      const result = await razorpayClient().orders.create({ amount, currency: "INR", receipt: String(order._id).slice(0, 40) });
      await OrderModel.updateOne({ _id: order._id }, { $set: { razorpayOrderId: result.id }, $unset: { razorpayCreatingAt: "" } });
      return jsonOk({ order_id: result.id, amount, currency: result.currency, key_id: keyId });
    } catch {
      await OrderModel.updateOne({ _id: order._id }, { $unset: { razorpayCreatingAt: "" } });
      return jsonError("Could not create Razorpay order. Please try again.", 500);
    }
  });
}
