import { NextRequest } from "next/server";
import { DiwaliBookingModel, OrderModel } from "@/lib/db/models";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { razorpayClient } from "@/lib/payments/razorpay";
import { confirmRazorpayPayment, type RazorpayOrderRecord } from "@/lib/payments/razorpay-confirmation";

export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

/** Pulls the latest Razorpay state for a booking's linked order into the booking. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    await requireAdminRole(request, CONTENT_WRITE_ROLES);
    const { id } = await params;
    await dbConnect();

    const booking = await DiwaliBookingModel.findById(id).lean<{
      _id: string;
      orderId?: string;
      razorpayOrderId?: string;
      paymentStatus?: string;
    }>();
    if (!booking) return jsonError("Diwali booking not found.", 404);

    const order = await OrderModel.findOne(
      booking.orderId
        ? { _id: booking.orderId }
        : { diwaliBookingId: booking._id },
    ).lean<RazorpayOrderRecord>();
    if (!order) return jsonError("No linked order/payment for this booking yet.", 400);
    if (order.paymentMethod !== "online") return jsonError("This booking does not use Razorpay.", 400);
    if (!order.razorpayOrderId) return jsonError("This booking has no Razorpay order yet.", 400);

    const payments = await razorpayClient().orders.fetchPayments(order.razorpayOrderId);
    const settled = payments.items.find((payment) => payment.status === "captured" || payment.status === "authorized");
    if (!settled) {
      return jsonOk({
        synced: false,
        message: "No captured or authorized Razorpay payment found for this booking.",
        paymentStatus: booking.paymentStatus ?? "pending",
      });
    }

    if (order.paymentStatus === "paid") {
      await DiwaliBookingModel.updateOne(
        { _id: booking._id },
        {
          $set: {
            paymentStatus: "paid",
            status: "confirmed",
            paymentAmount: order.total,
            orderId: order._id,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: settled.id,
            razorpayPaymentMethod: settled.method,
            paidAt: order.paidAt ?? new Date(settled.created_at * 1000),
          },
        },
      );
      return jsonOk({ synced: true, backfilled: true, paymentStatus: "paid", razorpayPaymentId: settled.id });
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
