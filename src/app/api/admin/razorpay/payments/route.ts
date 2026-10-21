import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { CustomerModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";

export const dynamic = "force-dynamic";

type OrderDoc = {
  _id: string;
  orderNumber: string;
  customerId: string;
  total: number;
  paymentStatus?: string;
  paymentState?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayPaymentMethod?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

type CustomerDoc = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function GET(req: NextRequest) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    await dbConnect();

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "all";
    const q = (url.searchParams.get("q") ?? "").trim();
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 200, 1), 500);

    const baseQuery: Record<string, unknown> = { paymentMethod: "online" };
    const query: Record<string, unknown> = { ...baseQuery };

    if (status === "paid" || status === "pending" || status === "refunded") {
      query.paymentStatus = status;
    }

    const createdAt: Record<string, Date> = {};
    if (from) {
      const parsed = new Date(from);
      if (!Number.isNaN(parsed.getTime())) createdAt.$gte = startOfDay(parsed);
    }
    if (to) {
      const parsed = new Date(to);
      if (!Number.isNaN(parsed.getTime())) createdAt.$lte = new Date(startOfDay(parsed).getTime() + DAY_MS - 1);
    }
    if (Object.keys(createdAt).length) query.createdAt = createdAt;

    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      const matchedCustomers = await CustomerModel.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      })
        .select({ _id: 1 })
        .limit(500)
        .lean<Array<{ _id: string }>>();
      query.$or = [
        { orderNumber: regex },
        { razorpayPaymentId: regex },
        { razorpayOrderId: regex },
        { customerId: { $in: matchedCustomers.map((customer) => String(customer._id)) } },
      ];
    }

    const [orders, allOnline] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).limit(limit).lean<OrderDoc[]>(),
      OrderModel.find(baseQuery)
        .select({ total: 1, paymentStatus: 1, paidAt: 1, createdAt: 1 })
        .lean<OrderDoc[]>(),
    ]);

    const customerIds = Array.from(new Set(orders.map((order) => order.customerId).filter(Boolean)));
    const customers = customerIds.length
      ? await CustomerModel.find({ _id: { $in: customerIds } })
          .select({ name: 1, firstName: 1, lastName: 1, email: 1, phone: 1 })
          .lean<CustomerDoc[]>()
      : [];
    const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));

    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let totalCollected = 0;
    let todayCollected = 0;
    let monthCollected = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let refundedCount = 0;
    for (const order of allOnline) {
      if (order.paymentStatus === "paid") {
        paidCount += 1;
        totalCollected += order.total;
        const paidAt = order.paidAt ? new Date(order.paidAt).getTime() : new Date(order.createdAt ?? now).getTime();
        if (paidAt >= todayStart) todayCollected += order.total;
        if (paidAt >= monthStart) monthCollected += order.total;
      } else if (order.paymentStatus === "refunded") {
        refundedCount += 1;
      } else {
        pendingCount += 1;
      }
    }

    return jsonOk({
      summary: {
        totalCollected,
        todayCollected,
        monthCollected,
        paidCount,
        pendingCount,
        refundedCount,
        totalOnline: allOnline.length,
      },
      payments: orders.map((order) => {
        const customer = customerById.get(order.customerId);
        return {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          total: order.total,
          paymentStatus: order.paymentStatus ?? "pending",
          paymentState: order.paymentState ?? null,
          razorpayOrderId: order.razorpayOrderId ?? null,
          razorpayPaymentId: order.razorpayPaymentId ?? null,
          razorpayPaymentMethod: order.razorpayPaymentMethod ?? null,
          createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
          paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
          customer: customer
            ? {
                id: String(customer._id),
                name: customer.name ?? ([customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer"),
                email: customer.email ?? null,
                phone: customer.phone ?? null,
              }
            : null,
        };
      }),
    });
  });
}
