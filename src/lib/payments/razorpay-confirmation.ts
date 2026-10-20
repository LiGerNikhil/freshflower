import { after } from "next/server";
import { CustomerModel, OrderModel } from "@/lib/db/models";
import { sendOrderConfirmationEmail } from "@/lib/auth/customer-email";
import { razorpayClient } from "@/lib/payments/razorpay";

export type RazorpayOrderRecord = {
  _id: string;
  customerId: string;
  orderNumber: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  items: { name: string; quantity: number; price: number; color?: string }[];
  deliveryAddress?: { line1?: string; city?: string; pincode?: string };
};

// A valid signature proves origin; capture, amount and order checks prove settlement.
export async function confirmRazorpayPayment(order: RazorpayOrderRecord, paymentId: string) {
  const payment = await razorpayClient().payments.fetch(paymentId);
  if (payment.order_id !== order.razorpayOrderId || Number(payment.amount) !== Math.round(order.total * 100) || payment.currency !== "INR") {
    return { error: "Payment does not match the order.", status: 400 };
  }
  if (payment.status !== "captured") {
    return { error: "Payment is not captured yet. Please check again shortly; do not pay again.", status: 409 };
  }
  if (order.paymentStatus === "refunded") return { error: "This order was refunded.", status: 409 };
  const updated = await OrderModel.updateOne(
    { _id: order._id, paymentStatus: "pending", razorpayOrderId: payment.order_id },
    { $set: { paymentStatus: "paid", paymentState: "paid", razorpayPaymentId: payment.id } },
  );
  // Callback/webhook races must not each dispatch a confirmation email.
  if (updated.modifiedCount) after(async () => {
    try {
      const customer = await CustomerModel.findById(order.customerId).lean<{ email?: string; name?: string }>();
      if (!customer?.email) return;
      await sendOrderConfirmationEmail({ email: customer.email, name: customer.name ?? "Customer", orderNumber: order.orderNumber, total: order.total, items: order.items, deliveryAddress: order.deliveryAddress ?? {} });
      await OrderModel.updateOne({ _id: order._id }, { $set: { orderConfirmationEmailSentAt: new Date() } });
    } catch { console.error("Razorpay order confirmation email failed."); }
  });
  return null;
}
