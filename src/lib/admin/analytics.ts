import { OrderStatus, type Order } from "@/lib/types";

// Pure aggregation helpers for the admin dashboard. They take data as
// arguments so the Phase 2 data swap stays confined to /lib/data — pages pass
// the dummy arrays in from "@/lib/data" and keep calling the same functions.

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function latestOrderDay(orders: Order[]): string {
  if (orders.length === 0) return dayKey(new Date().toISOString());
  return orders
    .map((order) => order.createdAt)
    .sort()
    .at(-1)!
    .slice(0, 10);
}

export interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  outForDelivery: number;
  completedOrders: number;
  cancelledOrders: number;
  todayRevenue: number;
  monthRevenue: number;
  totalCustomers: number;
  newEnquiries: number;
  todayKey: string;
  monthLabel: string;
  totalRevenue: number;
}

export function computeDashboardStats(
  orders: Order[],
  totalCustomers: number,
  newEnquiries: number,
): DashboardStats {
  const todayKey = latestOrderDay(orders);
  const monthKey = todayKey.slice(0, 7);
  const todayOrders = orders.filter((o) => dayKey(o.createdAt) === todayKey);
  const countBy = (statuses: OrderStatus[]) =>
    orders.filter((o) => statuses.includes(o.status)).length;

  const isoToday = `${todayKey}T00:00:00.000Z`;
  const monthLabel = new Date(isoToday).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return {
    todayOrders: todayOrders.length,
    pendingOrders: countBy([OrderStatus.Received]),
    confirmedOrders: countBy([
      OrderStatus.Confirmed,
      OrderStatus.Preparing,
      OrderStatus.Ready,
    ]),
    outForDelivery: countBy([OrderStatus.OutForDelivery]),
    completedOrders: countBy([OrderStatus.Delivered]),
    cancelledOrders: countBy([OrderStatus.Cancelled]),
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
    monthRevenue: orders
      .filter((o) => dayKey(o.createdAt).slice(0, 7) === monthKey)
      .reduce((sum, o) => sum + o.total, 0),
    totalCustomers,
    newEnquiries,
    todayKey,
    monthLabel,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
  };
}

export interface DayPoint {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

export function dailySeries(orders: Order[], days = 7): DayPoint[] {
  const today = latestOrderDay(orders);
  const points: DayPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(`${today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => dayKey(o.createdAt) === key);
    points.push({
      date: key,
      label: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
    });
  }
  return points;
}

export interface StatusPoint {
  status: OrderStatus;
  label: string;
  count: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Received]: "Received",
  [OrderStatus.Confirmed]: "Confirmed",
  [OrderStatus.Preparing]: "Preparing",
  [OrderStatus.Ready]: "Ready",
  [OrderStatus.OutForDelivery]: "Out for Delivery",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Cancelled]: "Cancelled",
};

export function statusBreakdown(orders: Order[]): StatusPoint[] {
  return (Object.values(OrderStatus) as OrderStatus[])
    .map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: orders.filter((o) => o.status === status).length,
    }))
    .filter((point) => point.count > 0);
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export function topSellingFlowers(orders: Order[], limit = 6): TopProduct[] {
  const tally = new Map<string, TopProduct>();
  for (const order of orders) {
    for (const item of order.items) {
      const current = tally.get(item.name) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;
      tally.set(item.name, current);
    }
  }
  return [...tally.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}