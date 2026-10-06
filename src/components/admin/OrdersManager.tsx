"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Search,
  ShoppingCart,
  Truck,
  UserRound,
} from "lucide-react";
import { OrderStatus, type Order } from "@/lib/types";
import { STATUS_LABELS, formatINR } from "@/lib/admin/analytics";
import { formatAppDate, formatAppDateTime, isoDay } from "@/lib/utils";
import { useOperations } from "@/components/providers/OperationsContext";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentStateBadge,
} from "@/components/admin/OrderStatusBadge";

const STATUS_OPTIONS: { value: OrderStatus | "all" | "payment_verification_pending"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "payment_verification_pending", label: "Payment verification pending" },
  ...(Object.values(OrderStatus) as OrderStatus[]).map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];

export function OrdersManager() {
  const { orders, customersById, slotById, areaById } = useOperations();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all" | "payment_verification_pending">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (statusFilter === "payment_verification_pending" && order.paymentState !== "verification_pending") {
          return false;
        }
        if (statusFilter !== "all" && statusFilter !== "payment_verification_pending" && order.status !== statusFilter) {
          return false;
        }
        const deliveryDay = order.deliveryDate.slice(0, 10);
        if (dateFrom && deliveryDay < dateFrom) return false;
        if (dateTo && deliveryDay > dateTo) return false;
        if (q) {
          const customer = customersById[order.customerId];
          const haystack = [
            order.orderNumber,
            order.id,
            customer?.name ?? "",
            customer?.email ?? "",
            customer?.phone ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, statusFilter, dateFrom, dateTo, query, customersById]);

  const summary = useMemo(() => {
    const today = isoDay();
    return {
      total: orders.length,
      today: orders.filter((order) => order.deliveryDate.slice(0, 10) === today).length,
      outForDelivery: orders.filter(
        (order) => order.status === OrderStatus.OutForDelivery,
      ).length,
      paymentVerificationPending: orders.filter((order) => order.paymentState === "verification_pending").length,
    };
  }, [orders]);

  const itemSummary = (order: Order) => {
    const names = order.items.map((item) =>
      `${item.quantity > 1 ? `${item.quantity}× ` : ""}${item.name}${item.color ? ` (${item.color})` : ""} · ${formatINR(item.price)}`,
    );
    return names.length > 2
      ? `${names.slice(0, 2).join(", ")} +${names.length - 2} more`
      : names.join(", ");
  };

  const CustomerLink = ({ order }: { order: Order }) => {
    const customer = customersById[order.customerId];
    return (
      <div>
        {customer && (
          <Link
            href={`/admin/customers/${customer.id}`}
            className="group inline-flex items-center gap-1 font-medium text-ink transition hover:text-gold"
            title={`Open ${customer.name}'s profile`}
          >
            <UserRound size={13} className="shrink-0 text-ink-soft/60" />
            <span>{customer.name}</span>
            <ChevronRight
              size={13}
              className="shrink-0 text-ink-soft/40 transition group-hover:translate-x-0.5 group-hover:text-gold"
            />
          </Link>
        )}
        {!customer && <p className="font-medium text-ink-soft">Guest</p>}
        <p className="text-[11px] text-ink-soft">
          {customer?.phone ?? "—"}
          {customer?.email ? ` · ${customer.email}` : ""}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <ShoppingCart size={13} /> Operations
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {summary.total} orders · {summary.today} today · {summary.outForDelivery}{" "}
            out for delivery · {summary.paymentVerificationPending} payment verification pending.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number, customer, phone…"
            aria-label="Search orders"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as OrderStatus | "all")
          }
          aria-label="Filter by status"
          className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink-soft">
          <CalendarDays size={14} aria-hidden="true" />
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Delivery date from"
            className="bg-transparent text-sm text-ink outline-none"
          />
          <span>→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Delivery date to"
            className="bg-transparent text-sm text-ink outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {[
            { label: "All", from: "", to: "" },
            { label: "Today", from: isoDay(), to: isoDay() },
            { label: "Tomorrow", from: isoDay(1), to: isoDay(1) },
          ].map((preset) => {
            const active =
              dateFrom === preset.from && dateTo === preset.to;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setDateFrom(preset.from);
                  setDateTo(preset.to);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-ink text-ivory"
                    : "bg-white/70 text-ink-soft hover:text-ink"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const slot = slotById[order.deliverySlotId];
                const area = areaById[order.deliveryAreaId];
                return (
                  <tr
                    key={order.id}
                    data-order-row={order.id}
                    className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block font-semibold text-ink transition hover:text-gold"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="text-[11px] text-ink-soft">
                        {formatAppDateTime(order.createdAt, {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CustomerLink order={order} />
                    </td>
                    <td className="max-w-56 px-4 py-3 text-xs leading-5 text-ink-soft">
                      {itemSummary(order)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-ink">
                        {formatAppDate(
                          order.deliveryDate,
                          { day: "numeric", month: "short" },
                          "Date pending",
                        )}{" "}
                        · {slot?.label ?? order.deliverySlotId}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-ink-soft">
                        <Truck size={11} aria-hidden="true" />
                        {area?.name ?? "Area"} · Porter {formatINR(order.deliveryFee)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-soft">
                          {order.paymentMethod === "upi" ? "UPI" : order.paymentMethod === "online" ? "Online" : "COD"}
                        </span>
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <PaymentStateBadge state={order.paymentState} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatINR(order.total)}
                      <span className="block text-[11px] font-normal text-ink-soft">
                        incl. Porter {formatINR(order.deliveryFee)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-soft"
                  >
                    No orders match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((order) => {
          const slot = slotById[order.deliverySlotId];
          const area = areaById[order.deliveryAreaId];
          return (
            <div
              key={order.id}
              className="rounded-xl border border-ink/10 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-ink transition hover:text-gold"
                    >
                      {order.orderNumber}
                    </Link>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    {formatAppDateTime(order.createdAt, {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-ink">
                  {formatINR(order.total)}
                  <span className="block text-right text-[11px] font-normal text-ink-soft">
                    incl. Porter {formatINR(order.deliveryFee)}
                  </span>
                </p>
              </div>

              <div className="mt-3 border-t border-ink/5 pt-3">
                <CustomerLink order={order} />
                <p className="mt-2 text-xs leading-5 text-ink-soft">
                  {itemSummary(order)}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-soft">
                  <span className="flex items-center gap-1">
                    <Truck size={11} aria-hidden="true" />
                    {formatAppDate(
                      order.deliveryDate,
                      { day: "numeric", month: "short" },
                      "Date pending",
                    )}{" "}
                    · {slot?.label ?? order.deliverySlotId} ·{" "}
                    {area?.name ?? "Area"} · Porter {formatINR(order.deliveryFee)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>
                      {order.paymentMethod === "upi" ? "UPI" : order.paymentMethod === "online" ? "Online" : "COD"}
                    </span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <PaymentStateBadge state={order.paymentState} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <p className="rounded-xl border border-ink/10 bg-white/80 px-4 py-12 text-center text-sm text-ink-soft">
            No orders match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
