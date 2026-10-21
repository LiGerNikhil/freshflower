import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { razorpayClient } from "@/lib/payments/razorpay";
import { confirmRazorpayPayment, type RazorpayOrderRecord } from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    const { id } = await params;
    await dbConnect();
    const order = await OrderModel.findById(id).lean<RazorpayOrderRecord>();
    if (!order) return jsonError("Order not found.", 404);
    if (order.paymentMethod !== "online") return jsonError("This order does not use Razorpay.", 400);
    if (!order.razorpayOrderId) return jsonError("This order has no Razorpay order yet.", 400);

    const payments = await razorpayClient().orders.fetchPayments(order.razorpayOrderId);
    const settled = payments.items.find((payment) => payment.status === "captured" || payment.status === "authorized");
    if (!settled) {
      return jsonOk({
        synced: false,
        message: "No captured or authorized Razorpay payment found for this order.",
        paymentStatus: order.paymentStatus ?? "pending",
      });
    }

    // Legacy paid orders may be missing the gateway id/timestamp. Backfill
    // those without re-running confirmation (which would resend the email).
    if (order.paymentStatus === "paid") {
      const set: Record<string, unknown> = {
        paymentState: "paid",
        razorpayPaymentId: settled.id,
        razorpayPaymentMethod: settled.method,
      };
      if (!order.paidAt) set.paidAt = new Date(settled.created_at * 1000);
      await OrderModel.updateOne({ _id: order._id, paymentStatus: "paid" }, { $set: set });
      return jsonOk({
        synced: true,
        backfilled: true,
        paymentStatus: "paid",
        razorpayPaymentId: settled.id,
        paymentMethod: settled.method ?? null,
      });
    }

    const failure = await confirmRazorpayPayment(order, settled.id);
    if (failure) return jsonError(failure.error, failure.status);

    return jsonOk({
      synced: true,
      paymentStatus: "paid",
      razorpayPaymentId: settled.id,
      paymentMethod: settled.method ?? null,
    });
  });
}
