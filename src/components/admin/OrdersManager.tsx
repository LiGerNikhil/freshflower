"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Search, ShoppingCart, Truck } from "lucide-react";
import { customers } from "@/lib/data";
import { OrderStatus, type Order } from "@/lib/types";
import { STATUS_LABELS, formatINR } from "@/lib/admin/analytics";
import { isoDay } from "@/lib/utils";
import { useOperations } from "@/components/providers/OperationsContext";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/OrderStatusBadge";

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...(Object.values(OrderStatus) as OrderStatus[]).map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];

export function OrdersManager() {
  const { orders, slotById, areaById } = useOperations();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (statusFilter !== "all" && order.status !== statusFilter) {
          return false;
        }
        if (dateFrom && order.deliveryDate < dateFrom) return false;
        if (dateTo && order.deliveryDate > dateTo) return false;
        if (q) {
          const customer = customerById.get(order.customerId);
          const haystack = [
            order.orderNumber,
            order.id,
            customer?.name ?? "",
            customer?.phone ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, statusFilter, dateFrom, dateTo, query, customerById]);

  const summary = useMemo(() => {
    const today = isoDay();
    return {
      total: orders.length,
      today: orders.filter((order) => order.deliveryDate === today).length,
      outForDelivery: orders.filter(
        (order) => order.status === OrderStatus.OutForDelivery,
      ).length,
    };
  }, [orders]);

  const itemSummary = (order: Order) => {
    const names = order.items.map((item) =>
      item.quantity > 1 ? `${item.quantity}× ${item.name}` : item.name,
    );
    return names.length > 2
      ? `${names.slice(0, 2).join(", ")} +${names.length - 2} more`
      : names.join(", ");
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
            out for delivery. Status changes sync to the public track-order page.
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

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
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
                const customer = customerById.get(order.customerId);
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
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {customer?.name ?? "Customer"}
                      </p>
                      <p className="text-[11px] text-ink-soft">
                        {customer?.phone ?? "—"}
                      </p>
                    </td>
                    <td className="max-w-56 px-4 py-3 text-xs leading-5 text-ink-soft">
                      {itemSummary(order)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-ink">
                        {new Date(`${order.deliveryDate}T00:00:00`).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        )}{" "}
                        · {slot?.label ?? order.deliverySlotId}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-ink-soft">
                        <Truck size={11} aria-hidden="true" />
                        {area?.name ?? "Area"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-soft">
                          {order.paymentMethod === "online" ? "Online" : "COD"}
                        </span>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatINR(order.total)}
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
    </div>
  );
}