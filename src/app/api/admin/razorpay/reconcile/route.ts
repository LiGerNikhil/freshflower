import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { razorpayClient } from "@/lib/payments/razorpay";
import { confirmRazorpayPayment, type RazorpayOrderRecord } from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

const BATCH_SIZE = 20;

// One-shot repair path for online orders that were paid at the gateway but
// never flipped to paid (missed callback/webhook).
export async function POST(req: NextRequest) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    await dbConnect();
    const pending = await OrderModel.find({
      paymentMethod: "online",
      paymentStatus: { $ne: "paid" },
      razorpayOrderId: { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(BATCH_SIZE)
      .lean<RazorpayOrderRecord[]>();

    let reconciled = 0;
    const failed: string[] = [];
    for (const order of pending) {
      if (!order.razorpayOrderId) continue;
      try {
        const payments = await razorpayClient().orders.fetchPayments(order.razorpayOrderId);
        const settled = payments.items.find((payment) => payment.status === "captured" || payment.status === "authorized");
        if (!settled) continue;
        const failure = await confirmRazorpayPayment(order, settled.id);
        if (failure) failed.push(`${order.orderNumber}: ${failure.error}`);
        else reconciled += 1;
      } catch (error) {
        failed.push(`${order.orderNumber}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }

    return jsonOk({ checked: pending.length, reconciled, failed });
  });
}
