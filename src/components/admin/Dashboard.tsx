"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock,
  Inbox,
  IndianRupee,
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
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
} from "@/components/admin/AnalyticsCharts";
import { formatINR } from "@/lib/admin/analytics";

export function Dashboard() {
  const { data, syncing, syncedAt } = useDashboardData();
  const { stats, series } = data;

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          <LayoutDashboard size={13} /> Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          Good morning, here&apos;s today.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Live order flow, revenue, and catalogue performance from the
          connected database (latest order day: {stats.todayKey}).
        </p>
        <LiveBadge syncing={syncing} syncedAt={syncedAt} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm">
        <p className="text-ink-soft">
          Deeper pipeline, best sellers and business insights are on the full
          analytics view.
        </p>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
        >
          Open analytics <ArrowRight size={15} />
        </Link>
      </div>

      {/* Charts row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DailyOrdersChart series={series} />
        <RevenueTrendChart series={series} />
      </div>
    </div>
  );
}