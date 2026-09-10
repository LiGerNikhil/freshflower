"use client";

import {
  BadgeCheck,
  CalendarRange,
  CheckCircle2,
  Clock,
  Crown,
  Inbox,
  IndianRupee,
  Package,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { useDashboardData } from "@/components/admin/useDashboardData";
import {
  DailyOrdersChart,
  LiveBadge,
  RevenueTrendChart,
  StatCard,
  StatusBreakdownChart,
  TopSellingChart,
} from "@/components/admin/AnalyticsCharts";
import { dailySeries, formatINR } from "@/lib/admin/analytics";

export function Analytics() {
  const { data, syncing, syncedAt } = useDashboardData();
  const { orders, stats, breakdown, topProducts } = data;
  const series = dailySeries(orders, 14);

  const orderCount = Math.max(orders.length, 1);
  const avgOrderValue = stats.totalRevenue / orderCount;
  const avgItemsPerOrder =
    orders.reduce((total, order) => total + order.items.length, 0) / orderCount;
  const largestOrder = Math.max(...orders.map((order) => order.total), 0);
  const bestProduct = topProducts[0];
  const completionRate = (stats.completedOrders / orderCount) * 100;

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          <TrendingUp size={13} /> Analytics
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          Your business, at a glance.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Full picture computed live from the connected database — order flow,
          revenue, top sellers and business health.
        </p>
        <LiveBadge syncing={syncing} syncedAt={syncedAt} />
      </div>

      {/* Business insights */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Average order value"
          value={formatINR(avgOrderValue)}
          hint={`across ${orders.length} order${orders.length === 1 ? "" : "s"}`}
          icon={TrendingUp}
          accent="bg-gold/15 text-gold"
          href="/admin/orders"
        />
        <StatCard
          label="Avg items / order"
          value={avgItemsPerOrder.toFixed(1)}
          hint="units per order"
          icon={Package}
          accent="bg-sage text-sage-ink"
          href="/admin/orders"
        />
        <StatCard
          label="Best seller"
          value={bestProduct?.name ?? "—"}
          hint={
            bestProduct ? `${bestProduct.quantity} units sold` : "no sales yet"
          }
          icon={Crown}
          accent="bg-gold-soft/60 text-gold"
          href="/admin/products"
        />
        <StatCard
          label="Largest order"
          value={formatINR(largestOrder)}
          hint="single order value"
          icon={BadgeCheck}
          accent="bg-lavender text-lavender-ink"
          href="/admin/orders"
        />
        <StatCard
          label="Completion rate"
          value={`${completionRate.toFixed(0)}%`}
          hint="orders delivered"
          icon={PackageCheck}
          accent="bg-sage text-sage-ink"
          href="/admin/orders"
        />
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Today's Orders"
          value={String(stats.todayOrders)}
          hint={`day of ${stats.todayKey}`}
          icon={ShoppingBag}
          accent="bg-sage text-sage-ink"
          href="/admin/orders"
        />
        <StatCard
          label="Pending Orders"
          value={String(stats.pendingOrders)}
          hint="received"
          icon={Clock}
          accent="bg-blush text-ink-soft"
          href="/admin/orders"
        />
        <StatCard
          label="Confirmed Orders"
          value={String(stats.confirmedOrders)}
          hint="confirmed → ready"
          icon={CheckCircle2}
          accent="bg-lavender text-lavender-ink"
          href="/admin/orders"
        />
        <StatCard
          label="Out for Delivery"
          value={String(stats.outForDelivery)}
          hint="on the road"
          icon={Truck}
          accent="bg-gold-soft/60 text-sage-ink"
          href="/admin/orders"
        />
        <StatCard
          label="Completed"
          value={String(stats.completedOrders)}
          hint="delivered"
          icon={PackageCheck}
          accent="bg-sage text-sage-ink"
          href="/admin/orders"
        />
        <StatCard
          label="Cancelled"
          value={String(stats.cancelledOrders)}
          hint="cancelled"
          icon={XCircle}
          accent="bg-blush-deep/50 text-ink-soft"
          href="/admin/orders"
        />
        <StatCard
          label="Today's Revenue"
          value={formatINR(stats.todayRevenue)}
          hint={formatINR(stats.totalRevenue)}
          icon={IndianRupee}
          accent="bg-gold/15 text-gold"
          href="/admin/orders"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatINR(stats.monthRevenue)}
          hint={stats.monthLabel}
          icon={CalendarRange}
          accent="bg-gold/15 text-gold"
          href="/admin/orders"
        />
        <StatCard
          label="Total Customers"
          value={String(stats.totalCustomers)}
          hint="all-time"
          icon={Users}
          accent="bg-lavender text-lavender-ink"
          href="/admin/customers"
        />
        <StatCard
          label="New Enquiries"
          value={String(stats.newEnquiries)}
          hint="wholesale · wedding · contact"
          icon={Inbox}
          accent="bg-gold-soft/60 text-gold"
          href="/admin/enquiries"
        />
      </div>

      {/* Trend charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DailyOrdersChart series={series} />
        <RevenueTrendChart series={series} />
      </div>

      {/* Pipeline + best sellers */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <StatusBreakdownChart breakdown={breakdown} />
        <TopSellingChart topProducts={topProducts} />
      </div>
    </div>
  );
}