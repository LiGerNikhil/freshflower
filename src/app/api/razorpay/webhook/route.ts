import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { OrderModel } from "@/lib/db/models";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { confirmRazorpayPayment, type RazorpayOrderRecord } from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return safe(async () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return jsonError("Webhook is not configured.", 503);
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    if (!/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(createHmac("sha256", secret).update(raw).digest(), Buffer.from(signature, "hex"))) return jsonError("Invalid webhook signature.", 400);
    let body;
    try { body = JSON.parse(raw); } catch { return jsonError("Invalid JSON.", 400); }
    if (!["payment.captured", "order.paid"].includes(body.event)) return jsonOk({ ignored: true });
    const payment = body.payload?.payment?.entity;
    if (typeof payment?.id !== "string" || typeof payment?.order_id !== "string") return jsonError("Missing payment details.", 400);
    await dbConnect();
    const order = await OrderModel.findOne({ razorpayOrderId: payment.order_id, paymentMethod: "online" }).lean<RazorpayOrderRecord>();
    if (!order) return jsonOk({ ignored: true });
    const failure = await confirmRazorpayPayment(order, payment.id);
    if (failure) return jsonError(failure.error, failure.status);
    return jsonOk({ ok: true });
  });
}
