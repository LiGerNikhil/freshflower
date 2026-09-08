"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CreditCard,
  MapPin,
  ShoppingCart,
  StickyNote,
  User,
} from "lucide-react";
import { useOperations } from "@/components/providers/OperationsContext";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/OrderStatusBadge";
import { STATUS_LABELS, formatINR } from "@/lib/admin/analytics";
import { customers } from "@/lib/data";
import {
  OrderStatus,
  type Order,
  type PaymentStatus,
} from "@/lib/types";

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
];

const inputClass =
  "w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
      {children}
    </p>
  );
}

function NotFound({ orderId }: { orderId: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-10 text-center shadow-sm">
      <p className="font-display text-xl text-ink">Order not found</p>
      <p className="mt-2 text-sm text-ink-soft">
        No order with id “{orderId}” exists in the current data.
      </p>
      <Link
        href="/admin/orders"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
      >
        <ArrowLeft size={15} /> Back to orders
      </Link>
    </div>
  );
}

function Totals({ order }: { order: Order }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-ink-soft">
        <span>Subtotal</span>
        <span>{formatINR(order.subtotal)}</span>
      </div>
      <div className="flex justify-between text-ink-soft">
        <span>Delivery fee</span>
        <span>{formatINR(order.deliveryFee)}</span>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between text-gold">
          <span>
            Discount{order.couponCode ? ` (${order.couponCode})` : ""}
          </span>
          <span>− {formatINR(order.discount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink">
        <span>Total</span>
        <span>{formatINR(order.total)}</span>
      </div>
    </div>
  );
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { orders, slotById, areaById, setOrderStatus, setOrderPayment } =
    useOperations();
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) return <NotFound orderId={orderId} />;

  const customer = customers.find((c) => c.id === order.customerId);
  const slot = slotById[order.deliverySlotId];
  const area = areaById[order.deliveryAreaId];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            <ArrowLeft size={15} /> Orders
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <CalendarDays size={14} /> Delivers{" "}
            {new Date(`${order.deliveryDate}T00:00:00`).toLocaleDateString(
              "en-IN",
              { weekday: "long", day: "numeric", month: "long" },
            )}{" "}
            · {slot?.label ?? order.deliverySlotId} · {area?.name ?? "Area"}
          </p>
        </div>
        <Link
          href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
          className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink transition hover:border-gold hover:text-gold"
        >
          <Check size={15} /> View on track-order
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <User size={13} /> Customer
            </p>
            <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <p className="font-semibold text-ink">
                {customer?.name ?? "Customer"}
              </p>
              <p className="text-ink-soft">{customer?.phone ?? "—"}</p>
              {customer?.email && (
                <p className="text-ink-soft">{customer.email}</p>
              )}
              <p className="text-ink-soft">
                {order.paymentMethod === "online" ? "Online payment" : "Cash on delivery"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <ShoppingCart size={13} /> Items
            </p>
            <div className="divide-y divide-ink/5">
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
            </div>
            <div className="mt-4 border-t border-ink/10 pt-4">
              <Totals order={order} />
            </div>
            {order.couponCode && (
              <p className="mt-3 text-xs text-ink-soft">
                Coupon applied: <span className="font-semibold">{order.couponCode}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <MapPin size={13} /> Delivery address
            </p>
            <p className="text-sm leading-6 text-ink">
              {order.deliveryAddress.line1}
              {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}
              <br />
              {order.deliveryAddress.city} {order.deliveryAddress.pincode}
            </p>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-6 shadow-sm">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                <StickyNote size={13} /> Notes
              </p>
              <p className="text-sm leading-6 text-ink">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Update status
            </p>
            <Label>Order status</Label>
            <select
              data-status-select
              value={order.status}
              onChange={(event) =>
                setOrderStatus(order.id, event.target.value as OrderStatus)
              }
              className={inputClass}
            >
              {(Object.values(OrderStatus) as OrderStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <Label>Payment</Label>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <select
                data-payment-select
                value={order.paymentStatus ?? "pending"}
                onChange={(event) =>
                  setOrderPayment(
                    order.id,
                    event.target.value as PaymentStatus,
                  )
                }
                className={inputClass}
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-4 text-xs leading-5 text-ink-soft">
              Changes apply immediately and sync to the public track-order page
              for this order number.
            </p>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 text-sm shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <CreditCard size={13} /> Payment summary
            </p>
            <div className="space-y-1.5 text-ink-soft">
              <p className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-ink">
                  {order.paymentMethod === "online" ? "Online" : "COD"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Status</span>
                <span className="font-medium text-ink capitalize">
                  {order.paymentStatus ?? "—"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Total</span>
                <span className="font-semibold text-ink">
                  {formatINR(order.total)}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 text-xs leading-5 text-ink-soft shadow-sm">
            <p>Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p>
            <p>Last updated {new Date(order.updatedAt).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}