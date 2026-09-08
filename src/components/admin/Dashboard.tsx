"use client";

import type { LucideIcon } from "lucide-react";
import {
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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  computeDashboardStats,
  dailySeries,
  formatINR,
  statusBreakdown,
  topSellingFlowers,
} from "@/lib/admin/analytics";
import {
  contactEnquiries,
  customers,
  orders,
  weddingEnquiries,
  wholesaleEnquiries,
} from "@/lib/data";

const CHART_COLORS = ["#C9A24B", "#7C8A6B", "#9285A8", "#EECFC4", "#2B2620"];

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {label}
        </p>
        <span className={`rounded-lg p-2 ${accent}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
      <h3 className="font-display text-lg">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function Dashboard() {
  const newEnquiries =
    wholesaleEnquiries.filter((e) => e.status === "new").length +
    weddingEnquiries.filter((e) => e.status === "new").length +
    contactEnquiries.filter((e) => e.status === "new").length;

  const stats = computeDashboardStats(orders, customers.length, newEnquiries);
  const series = dailySeries(orders, 7);
  const breakdown = statusBreakdown(orders);
  const topProducts = topSellingFlowers(orders, 6);

  const revenuePeak = Math.max(...series.map((point) => point.revenue), 1);

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
          Live preview of order flow, revenue, and catalogue performance from
          the dummy dataset (latest order day: {stats.todayKey}).
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Today's Orders"
          value={String(stats.todayOrders)}
          hint={`day of ${stats.todayKey}`}
          icon={ShoppingBag}
          accent="bg-sage text-sage-ink"
        />
        <StatCard
          label="Pending Orders"
          value={String(stats.pendingOrders)}
          hint="received"
          icon={Clock}
          accent="bg-blush text-ink-soft"
        />
        <StatCard
          label="Confirmed Orders"
          value={String(stats.confirmedOrders)}
          hint="confirmed → ready"
          icon={CheckCircle2}
          accent="bg-lavender text-lavender-ink"
        />
        <StatCard
          label="Out for Delivery"
          value={String(stats.outForDelivery)}
          hint="on the road"
          icon={Truck}
          accent="bg-gold-soft/60 text-sage-ink"
        />
        <StatCard
          label="Completed"
          value={String(stats.completedOrders)}
          hint="delivered"
          icon={PackageCheck}
          accent="bg-sage text-sage-ink"
        />
        <StatCard
          label="Cancelled"
          value={String(stats.cancelledOrders)}
          hint="cancelled"
          icon={XCircle}
          accent="bg-blush-deep/50 text-ink-soft"
        />
        <StatCard
          label="Today's Revenue"
          value={formatINR(stats.todayRevenue)}
          hint={formatINR(stats.totalRevenue)}
          icon={IndianRupee}
          accent="bg-gold/15 text-gold"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatINR(stats.monthRevenue)}
          hint={stats.monthLabel}
          icon={CalendarRange}
          accent="bg-gold/15 text-gold"
        />
        <StatCard
          label="Total Customers"
          value={String(stats.totalCustomers)}
          hint="all-time"
          icon={Users}
          accent="bg-lavender text-lavender-ink"
        />
        <StatCard
          label="New Enquiries"
          value={String(stats.newEnquiries)}
          hint="wholesale · wedding · contact"
          icon={Inbox}
          accent="bg-gold-soft/60 text-gold"
        />
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily orders"
          subtitle={`Orders created per day, last 7 days (peaks at ${Math.max(
            ...series.map((point) => point.orders),
            0,
          )})`}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B262010" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#5A5248" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#5A5248" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  cursor={{ fill: "#F4EDE1" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #2B262022",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="orders" name="Orders" fill="#7C8A6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Revenue trend"
          subtitle={`Total order value per day, last 7 days (peak ${formatINR(
            revenuePeak,
          )})`}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A24B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C9A24B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B262010" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#5A5248" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#5A5248" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(value: number) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #2B262022",
                    fontSize: 12,
                  }}
                  formatter={(value) => [formatINR(Number(value)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#C9A24B"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Order status breakdown"
          subtitle="Current pipeline across the dummy dataset"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {breakdown.map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #2B262022",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {breakdown.map((entry, index) => (
              <span
                key={entry.status}
                className="flex items-center gap-1.5 text-xs text-ink-soft"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                {entry.label} · {entry.count}
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Top-selling flowers"
          subtitle="Units sold across all orders"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2B262010" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#5A5248" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 11, fill: "#5A5248" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#F4EDE1" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #2B262022",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [String(value), name === "quantity" ? "Units" : "Revenue"]}
                />
                <Bar
                  dataKey="quantity"
                  name="quantity"
                  fill="#9285A8"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}