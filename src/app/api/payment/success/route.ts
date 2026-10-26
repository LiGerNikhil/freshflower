import { NextRequest } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { CustomerModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { queueOrderConfirmationEmail } from "@/lib/payments/events";
import { processPaymentEmailOutbox } from "@/lib/payments/email-outbox";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";

const paymentSuccessSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().trim().max(160).optional(),
});

type PopulatedOrder = {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: { name: string; quantity: number; price: number; color?: string }[];
  total: number;
  deliveryAddress?: { line1?: string; city?: string; pincode?: string };
  paymentMethod?: "online" | "cod";
  paymentStatus?: "paid" | "pending" | "refunded";
  orderConfirmationEmailSentAt?: Date;
};

export async function POST(req: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);

    const parsed = paymentSuccessSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);

    await dbConnect();
    const order = await OrderModel.findById(parsed.data.orderId).lean<PopulatedOrder>();
    if (!order || order.customerId !== session.customerId) return jsonError("Order not found.", 404);
    if (order.paymentMethod === "online" && order.paymentStatus !== "paid") {
      return jsonError("Payment must be verified through Razorpay first.", 400);
    }

    if (!order.orderConfirmationEmailSentAt) {
      const customer = await CustomerModel.findById(order.customerId)
        .select({ name: 1, email: 1 })
        .lean<{ name?: string; email?: string }>();
      if (!customer?.email) return jsonError("Customer email not found.", 400);

      await queueOrderConfirmationEmail({
        orderId: order._id,
        recipient: customer.email,
        paymentAttemptId: `order:${order._id}`,
      });
      after(async () => {
        await processPaymentEmailOutbox();
      });
    }

    return jsonOk({ ok: true, orderId: order._id, orderNumber: order.orderNumber });
  });
}
