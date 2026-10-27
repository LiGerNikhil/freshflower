import { NextRequest } from "next/server";
import { DurablePaymentEventModel, DiwaliBookingModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { serialize, serializeList } from "@/lib/db/repositories";
import type { DiwaliBooking, Order, PaymentEvent } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

/** Customer-safe receipt: booking, linked order summary and payment timeline. */
export async function GET(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    const session = await getCustomerSession(request);
    if (!session) return jsonError("Please sign in to view this booking.", 401);
    const { id } = await params;
    await dbConnect();
    const booking = await DiwaliBookingModel.findOne({
      _id: id,
      customerId: session.customerId,
    }).lean();
    if (!booking) return jsonError("Booking not found.", 404);

    const order = booking.orderId
      ? await OrderModel.findOne({ _id: booking.orderId, customerId: session.customerId }).lean()
      : null;
    const events = order
      ? await DurablePaymentEventModel.find({ orderId: order._id }).sort({ createdAt: 1 }).lean()
      : [];

    return jsonOk({
      booking: serialize<DiwaliBooking>(booking),
      order: serialize<Order>(order),
      events: serializeList<PaymentEvent>(events),
    });
  });
}
