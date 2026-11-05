import { ApiError } from "@/lib/api/helpers";
import { OrderStatus } from "@/lib/types";

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const ORDER_EXPORT_TIME_WINDOW = "12:00 AM to 11:59 PM IST (inclusive)";

export interface OrderExportRange {
  from: string;
  to: string;
  start: Date;
  endExclusive: Date;
}

export interface DeliveryDateExportRange {
  from: string;
  to: string;
  filter: {
    status: { $ne: string };
    deliveryDate: { $gte: Date; $lt: Date };
  };
}

function isValidDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function indiaMidnight(day: string): Date {
  return new Date(Date.parse(`${day}T00:00:00.000Z`) - INDIA_OFFSET_MS);
}

export function parseDeliveryDateExportRange(params: URLSearchParams): DeliveryDateExportRange {
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  if (!isValidDay(from) || !isValidDay(to)) {
    throw new ApiError("Choose a valid delivery start date and end date.", 400);
  }
  if (from > to) {
    throw new ApiError("Delivery start date must be on or before the end date.", 400);
  }

  const dayAfterEnd = new Date(`${to}T00:00:00.000Z`);
  dayAfterEnd.setUTCDate(dayAfterEnd.getUTCDate() + 1);
  const istStart = indiaMidnight(from);
  const istEnd = indiaMidnight(dayAfterEnd.toISOString().slice(0, 10));

  return {
    from,
    to,
    filter: {
      status: { $ne: "cancelled" },
      deliveryDate: { $gte: istStart, $lt: istEnd },
    },
  };
}

export function parseOrderExportRange(params: URLSearchParams): OrderExportRange {
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  if (!isValidDay(from) || !isValidDay(to)) {
    throw new ApiError("Choose a valid start date and end date.", 400);
  }
  if (from > to) {
    throw new ApiError("Start date must be on or before the end date.", 400);
  }
  const dayAfterEnd = new Date(`${to}T00:00:00.000Z`);
  dayAfterEnd.setUTCDate(dayAfterEnd.getUTCDate() + 1);
  return {
    from,
    to,
    start: indiaMidnight(from),
    endExclusive: new Date(dayAfterEnd.getTime() - INDIA_OFFSET_MS),
  };
}

export function eligibleOrderFilter(range: OrderExportRange) {
  return {
    status: OrderStatus.Confirmed,
    paymentStatus: { $in: ["paid", "successful"] },
    createdAt: { $gte: range.start, $lt: range.endExclusive },
  };
}

export function orderExportFilename(range: Pick<OrderExportRange, "from" | "to">): string {
  return `FreshFlower_Orders_${range.from}_to_${range.to}.pdf`;
}
