"use client";

import { useCallback, useEffect, useState } from "react";
import {
  computeDashboardStats,
  dailySeries,
  statusBreakdown,
  topSellingFlowers,
  type DashboardStats,
  type DayPoint,
  type StatusPoint,
  type TopProduct,
} from "@/lib/admin/analytics";
import { api } from "@/lib/api/client";
import type { Customer, Order } from "@/lib/types";
import {
  contactEnquiries,
  customers,
  orders,
  weddingEnquiries,
  wholesaleEnquiries,
} from "@/lib/data";

export interface DashboardData {
  orders: Order[];
  stats: DashboardStats;
  series: DayPoint[];
  breakdown: StatusPoint[];
  topProducts: TopProduct[];
}

const REFRESH_INTERVAL_MS = 20_000;

/** Live snapshot of the business: stats, trends and best sellers hydrated from
 * the admin APIs, with the seeded dataset as the offline fallback. */
export function useDashboardData() {
  const seedNewEnquiries =
    wholesaleEnquiries.filter((e) => e.status === "new").length +
    weddingEnquiries.filter((e) => e.status === "new").length +
    contactEnquiries.filter((e) => e.status === "new").length;

  const [data, setData] = useState<DashboardData>(() => ({
    orders,
    stats: computeDashboardStats(orders, customers.length, seedNewEnquiries),
    series: dailySeries(orders, 7),
    breakdown: statusBreakdown(orders),
    topProducts: topSellingFlowers(orders, 6),
  }));
  const [syncing, setSyncing] = useState(true);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [liveOrders, liveCustomers, enquiries] = await Promise.all([
      api("/api/admin/orders"),
      api("/api/admin/customers"),
      api("/api/admin/enquiries"),
    ]);
    const groups = enquiries as {
      wholesale: Array<{ status?: string }>;
      wedding: Array<{ status?: string }>;
      contact: Array<{ status?: string }>;
    };
    const liveNewEnquiries = (
      ["wholesale", "wedding", "contact"] as const
    ).reduce(
      (total, key) =>
        total + groups[key].filter((item) => item.status === "new").length,
      0,
    );
    const allOrders = liveOrders as Order[];
    setData({
      orders: allOrders,
      stats: computeDashboardStats(
        allOrders,
        (liveCustomers as Customer[]).length,
        liveNewEnquiries,
      ),
      series: dailySeries(allOrders, 7),
      breakdown: statusBreakdown(allOrders),
      topProducts: topSellingFlowers(allOrders, 6),
    });
    setSyncedAt(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    const safeLoad = () => {
      load()
        .catch(() => undefined)
        .finally(() => {
          if (mounted) setSyncing(false);
        });
    };
    safeLoad();
    const interval = window.setInterval(safeLoad, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") safeLoad();
    };
    window.addEventListener("focus", safeLoad);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", safeLoad);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return { data, syncing, syncedAt };
}
