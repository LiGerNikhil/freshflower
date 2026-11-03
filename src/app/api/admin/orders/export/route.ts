import { NextRequest } from "next/server";
import { CustomerModel, DeliverySlotModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { requireAdminRole } from "@/lib/admin/authorization";
import { eligibleOrderFilter, parseOrderExportRange } from "@/lib/admin/order-export";
import { jsonOk, safe, ApiError } from "@/lib/api/helpers";
import { AdminRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type ExportOrder = {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{
    name: string;
    color?: string;
    quantity: number;
    unitLabel?: string;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: Date;
  deliveryDate?: Date;
  deliverySlotId?: string;
  deliveryTimePreference?: string;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    pincode?: string;
    landmark?: string;
  };
};

type ExportCustomer = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type ExportDeliverySlot = {
  _id: string;
  label?: string;
  startTime?: string;
  endTime?: string;
};

export async function GET(request: NextRequest) {
  return safe(async () => {
    await requireAdminRole(request, [AdminRole.OrderManager]);
    const range = parseOrderExportRange(request.nextUrl.searchParams);
    const requestedPage = Number(request.nextUrl.searchParams.get("page") ?? "1");
    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) {
      throw new ApiError("Page must be a positive whole number.", 400);
    }
    if (!Number.isSafeInteger((requestedPage - 1) * PAGE_SIZE)) {
      throw new ApiError("Page number is too large.", 400);
    }

    await dbConnect();
    const filter = eligibleOrderFilter(range);
    const [orders, [summary]] = await Promise.all([
      OrderModel.find(filter)
        .select({
          orderNumber: 1,
          customerId: 1,
          items: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          deliveryDate: 1,
          deliverySlotId: 1,
          deliveryTimePreference: 1,
          deliveryAddress: 1,
        })
        .sort({ createdAt: 1, _id: 1 })
        .skip((requestedPage - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean<ExportOrder[]>(),
      OrderModel.aggregate([
        { $match: filter },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),
    ]);

    const customerIds = [...new Set(orders.map((order) => order.customerId))];
    const customers = customerIds.length
      ? await CustomerModel.find({ _id: { $in: customerIds } })
          .select({ name: 1, firstName: 1, lastName: 1, phone: 1 })
          .lean<ExportCustomer[]>()
      : [];
    const deliverySlotIds = [...new Set(orders.map((order) => order.deliverySlotId).filter((id): id is string => Boolean(id)))];
    const deliverySlots = deliverySlotIds.length
      ? await DeliverySlotModel.find({ _id: { $in: deliverySlotIds } })
          .select({ label: 1, startTime: 1, endTime: 1 })
          .lean<ExportDeliverySlot[]>()
      : [];
    const customersById = new Map(customers.map((customer) => [String(customer._id), customer]));
    const deliverySlotsById = new Map(deliverySlots.map((slot) => [String(slot._id), slot]));
    const totalOrders = summary?.count ?? 0;

    const response = jsonOk({
      from: range.from,
      to: range.to,
      page: requestedPage,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(totalOrders / PAGE_SIZE),
      totalOrders,
      totalRevenue: summary?.revenue ?? 0,
      orders: orders.map((order) => {
        const customer = customersById.get(String(order.customerId));
        return {
          orderNumber: order.orderNumber,
          createdAt: new Date(order.createdAt).toISOString(),
          customerName:
            customer?.name ||
            [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
            "Customer unavailable",
          customerPhone: customer?.phone ?? "—",
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString() : undefined,
          deliveryTime:
            order.deliveryTimePreference ||
            deliverySlotsById.get(String(order.deliverySlotId))?.label ||
            [deliverySlotsById.get(String(order.deliverySlotId))?.startTime, deliverySlotsById.get(String(order.deliverySlotId))?.endTime]
              .filter(Boolean)
              .join(" – ") ||
            order.deliverySlotId ||
            "Not specified",
          products: order.items.map((item) => ({
            name: item.name,
            color: item.color,
            quantity: item.quantity,
          })),
          total: order.total,
          status: order.status,
        };
      }),
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  });
}
