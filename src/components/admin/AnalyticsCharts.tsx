"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
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
import { formatINR } from "@/lib/admin/analytics";
import type { DayPoint, StatusPoint, TopProduct } from "@/lib/admin/analytics";

export const CHART_COLORS = ["#C9A24B", "#7C8A6B", "#9285A8", "#EECFC4", "#2B2620"];

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: "1px solid #2B262022",
  fontSize: 12,
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {label}
        </p>
        <span className={`rounded-lg p-2 ${accent}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-ink">
        {value}
        {href && (
          <ArrowUpRight
            size={17}
            className="ml-1.5 inline-block align-middle text-gold opacity-0 transition group-hover:opacity-100"
          />
        )}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="group block rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
      {inner}
    </div>
  );
}

export function ChartCard({
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

export function LiveBadge({
  syncing,
  syncedAt,
}: {
  syncing: boolean;
  syncedAt: string | null;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-2.5 py-1 text-[11px] font-bold text-sage-ink">
        <span className="relative flex h-2 w-2">
          {syncing && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-ink" />
        </span>
        Live database
      </span>
      {syncedAt && (
        <span className="text-[11px] text-ink-soft">Synced {syncedAt}</span>
      )}
    </div>
  );
}

export function DailyOrdersChart({ series }: { series: DayPoint[] }) {
  return (
    <ChartCard
      title="Daily orders"
      subtitle={`Orders created per day (peaks at ${Math.max(
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
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar
              dataKey="orders"
              name="Orders"
              fill="#7C8A6B"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function RevenueTrendChart({ series }: { series: DayPoint[] }) {
  const revenuePeak = Math.max(...series.map((point) => point.revenue), 1);
  return (
    <ChartCard
      title="Revenue trend"
      subtitle={`Total order value per day (peak ${formatINR(revenuePeak)})`}
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
              contentStyle={TOOLTIP_STYLE}
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
  );
}

export function StatusBreakdownChart({
  breakdown,
}: {
  breakdown: StatusPoint[];
}) {
  return (
    <ChartCard
      title="Order status pipeline"
      subtitle="Current pipeline from the live database"
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
            <Tooltip contentStyle={TOOLTIP_STYLE} />
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
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            {entry.label} · {entry.count}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

export function TopSellingChart({ topProducts }: { topProducts: TopProduct[] }) {
  return (
    <ChartCard title="Top-selling flowers" subtitle="Units sold across all orders">
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
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => [
                String(value),
                name === "quantity" ? "Units" : "Revenue",
              ]}
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
  );
}