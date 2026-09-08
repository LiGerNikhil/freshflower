"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, PackageSearch, Search } from "lucide-react";
import { deliveryAreas, deliverySlots, orders as baseOrders } from "@/lib/data";
import {
  loadStatusOverrides,
  type StatusOverrides,
} from "@/lib/admin/overrides";
import { OrderStatusStepper } from "@/components/sections/OrderStatusStepper";
import { PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatINR } from "@/lib/admin/analytics";
import { OrderStatus } from "@/lib/types";

export function TrackOrderClient({
  initialOrder,
}: {
  initialOrder: string;
}) {
  const [query, setQuery] = useState(initialOrder);
  const [statusOverrides, setStatusOverrides] = useState<StatusOverrides>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatusOverrides(loadStatusOverrides());
  }, []);

  const orders = useMemo(
    () =>
      baseOrders.map((order) => {
        const override = statusOverrides[order.id];
        if (!override) return order;
        return {
          ...order,
          status: override.status ?? order.status,
          paymentStatus: override.paymentStatus ?? order.paymentStatus,
          updatedAt: override.updatedAt ?? order.updatedAt,
        };
      }),
    [statusOverrides],
  );

  const normalized = query.trim().toUpperCase();
  const order = useMemo(
    () =>
      orders.find(
        (candidate) =>
          candidate.orderNumber.toUpperCase() === normalized ||
          candidate.id.toUpperCase() === normalized,
      ),
    [orders, normalized],
  );

  const slot = deliverySlots.find((candidate) => candidate.id === order?.deliverySlotId);
  const area = deliveryAreas.find((candidate) => candidate.id === order?.deliveryAreaId);

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
          <PackageSearch size={14} /> Order tracking
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Track your order</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink-soft">
          Enter the order number from your confirmation — e.g. FF-1002 — to see
          the live delivery status.
        </p>
      </div>

      <form
        className="mx-auto mt-8 flex max-w-md items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) return;
          setQuery((current) => current.trim().toUpperCase());
        }}
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            data-track-query
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Order number, e.g. FF-1002"
            aria-label="Order number"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
        <button
          data-track-button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          Track
        </button>
      </form>

      {order ? (
        <div
          data-track-result
          className="mt-10 rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm md:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">
                Order
              </p>
              <p className="font-display text-2xl text-ink">
                {order.orderNumber}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PaymentStatusBadge status={order.paymentStatus} />
              <span className="text-xs text-ink-soft">
                {order.paymentMethod === "online" ? "Online" : "COD"}
              </span>
            </div>
          </div>

          {order.status === OrderStatus.Cancelled ? (
            <div className="mt-6 rounded-lg border border-ink/10 bg-ink/[0.02] px-4 py-5 text-center">
              <p className="font-display text-lg text-ink">Order cancelled</p>
              <p className="mt-1 text-sm text-ink-soft">
                {order.notes ?? "This order was cancelled and the payment refunded."}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <OrderStatusStepper status={order.status} />
            </div>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-ink/10 bg-ivory-deep/40 p-4">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                <CalendarDays size={13} /> Delivery
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {new Date(`${order.deliveryDate}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  { weekday: "long", day: "numeric", month: "long" },
                )}
              </p>
              <p className="text-sm text-ink-soft">
                {slot?.label ?? order.deliverySlotId} ·{" "}
                {slot?.isMorningExpress ? "Morning express · " : ""}
                {area?.name ?? "Delhi NCR"}
              </p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-ivory-deep/40 p-4">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                <MapPin size={13} /> Address
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                {order.deliveryAddress.line1}
                {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}
                <br />
                {order.deliveryAddress.city} {order.deliveryAddress.pincode}
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-ink/5 border-t border-ink/10">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-ink">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-medium text-ink">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 font-semibold text-ink">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>

          <p className="mt-5 text-xs text-ink-soft">
            Last updated {new Date(order.updatedAt).toLocaleString("en-IN")}. This
            page reflects live status changes made from the FreshFlower admin.
          </p>
        </div>
      ) : (
        normalized && (
          <p className="mt-10 text-center text-sm text-ink-soft">
            We couldn’t find an order matching “{normalized}”. Double-check the
            number from your confirmation email.
          </p>
        )
      )}
    </section>
  );
}