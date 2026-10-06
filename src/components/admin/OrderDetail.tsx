"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  MapPin,
  RefreshCw,
  ShoppingCart,
  StickyNote,
  Truck,
  User,
} from "lucide-react";
import { useOperations } from "@/components/providers/OperationsContext";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import {
  OrderStatusBadge,
  PaymentStateBadge,
  PaymentStatusBadge,
} from "@/components/admin/OrderStatusBadge";
import { STATUS_LABELS, formatINR } from "@/lib/admin/analytics";
import {
  OrderStatus,
  type Order,
  type PaymentStatus,
} from "@/lib/types";
import { formatAppDate, formatAppDateTime } from "@/lib/utils";

type AdminPaymentData = {
  order: { id: string; orderNumber: string; total: number; paymentState?: string; latestPaymentAttemptId?: string };
  attempts: Array<{
    id: string;
    attemptNumber: number;
    state: string;
    amount: number;
    paymentAccountSnapshot?: { label: string; receiverName: string; upiId: string };
    upiTransactionRef?: string;
    screenshotPreviewUrl?: string;
    screenshotFullUrl?: string;
    submittedAt?: string;
    reviewedAt?: string;
    reviewingAdminEmail?: string;
    correctionReason?: string;
  }>;
  events: Array<{ id: string; type: string; createdAt: string; actor?: string }>;
  outboxJobs: Array<{ id: string; kind: string; status: string; notificationId?: string; failureReason?: string }>;
};

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
        <span className="inline-flex items-center gap-1.5">
          <Truck size={13} aria-hidden="true" /> Porter delivery charge
        </span>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-ivory-deep/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="mt-1 break-words font-semibold text-ink">{value}</p>
    </div>
  );
}

function PaymentVerificationPanel({ order }: { order: Order }) {
  const [data, setData] = useState<AdminPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/payment`);
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not load payment details.");
      setData(body as AdminPaymentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payment details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const latest = data?.attempts.at(-1);
  const canReview = latest?.state === "verification_pending" && data?.order.latestPaymentAttemptId === latest.id;

  async function review(decision: "approved" | "correction_requested") {
    if (!latest) return;
    if (decision === "correction_requested" && !correctionReason.trim()) {
      setError("Correction reason is required.");
      return;
    }
    setReviewing(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/payment-attempts/${encodeURIComponent(latest.id)}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, correctionReason: decision === "correction_requested" ? correctionReason.trim() : undefined }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not review payment.");
      setCorrectionReason("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not review payment.");
    } finally {
      setReviewing(false);
    }
  }

  async function retryEmail(jobId: string) {
    setError("");
    try {
      const response = await fetch(`/api/admin/payment-email-outbox/${encodeURIComponent(jobId)}/retry`, { method: "POST" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not retry email.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retry email.");
    }
  }

  if (order.paymentMethod !== "upi") return null;

  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold"><CreditCard size={13} /> Payment verification</p>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"><RefreshCw size={13} /> Refresh</button>
      </div>
      {loading && <p className="text-sm text-ink-soft">Loading payment details...</p>}
      {error && <p className="mb-4 rounded-md bg-blush px-3 py-2 text-sm font-semibold text-red-800">{error}</p>}
      {latest && (
        <div className="space-y-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Payable amount" value={formatINR(latest.amount)} />
            <Info label="Transaction reference" value={latest.upiTransactionRef ?? "Not submitted"} />
            <Info label="Payment account" value={latest.paymentAccountSnapshot?.label ?? "—"} />
            <Info label="Receiver" value={`${latest.paymentAccountSnapshot?.receiverName ?? "—"} · ${latest.paymentAccountSnapshot?.upiId ?? ""}`} />
          </div>
          {latest.screenshotPreviewUrl && (
            <div>
              <Label>Payment screenshot</Label>
              <div className="flex flex-wrap items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={latest.screenshotPreviewUrl} alt="Payment screenshot" className="h-28 w-28 rounded-lg border border-ink/10 object-cover" />
                <button type="button" onClick={() => setPreviewUrl(latest.screenshotFullUrl ?? latest.screenshotPreviewUrl ?? null)} className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink hover:border-gold">Full preview</button>
                {latest.screenshotFullUrl && <a href={latest.screenshotFullUrl} download className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink hover:border-gold"><Download size={13} /> Download</a>}
              </div>
            </div>
          )}
          {canReview && (
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
              <p className="flex items-start gap-2 text-sm font-semibold text-ink"><AlertTriangle size={16} className="mt-0.5 text-gold" /> Before confirming, match actual received funds with the payable amount, receiving account, and transaction reference.</p>
              <button type="button" disabled={reviewing} onClick={() => void review("approved")} className="mt-4 rounded-md bg-sage-ink px-4 py-2 text-sm font-semibold text-ivory disabled:opacity-60">Confirm payment received</button>
              <div className="mt-4">
                <Label>Correction reason</Label>
                <textarea value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} rows={3} className={inputClass} placeholder="Explain what the customer needs to correct." />
                <button type="button" disabled={reviewing} onClick={() => void review("correction_requested")} className="mt-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-gold disabled:opacity-60">Request correction</button>
              </div>
            </div>
          )}
          <Timeline title="Payment-attempt history" empty="No attempts yet." items={data?.attempts.map((attempt) => ({ id: attempt.id, title: `Attempt ${attempt.attemptNumber} · ${attempt.state}`, body: `${attempt.upiTransactionRef ?? "No reference"} · ${attempt.submittedAt ? formatAppDateTime(attempt.submittedAt, { dateStyle: "medium", timeStyle: "short" }) : "Not submitted"}${attempt.correctionReason ? ` · ${attempt.correctionReason}` : ""}` })) ?? []} />
          <div>
            <Label>Email notification status</Label>
            <div className="space-y-2">
              {data?.outboxJobs.map((job) => (
                <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink/10 bg-white/60 p-3 text-xs">
                  <span><span className="font-semibold text-ink">{job.kind}</span> · {job.status}{job.notificationId ? ` · ${job.notificationId}` : ""}{job.failureReason ? ` · ${job.failureReason}` : ""}</span>
                  {job.status === "failed" && <button type="button" onClick={() => void retryEmail(job.id)} className="rounded-md bg-ink px-3 py-1.5 font-semibold text-ivory">Retry email</button>}
                </div>
              ))}
              {!data?.outboxJobs.length && <p className="text-xs text-ink-soft">No email jobs yet.</p>}
            </div>
          </div>
          <Timeline title="Event timeline" empty="No payment events yet." items={data?.events.map((event) => ({ id: event.id, title: event.type, body: `${formatAppDateTime(event.createdAt, { dateStyle: "medium", timeStyle: "short" })}${event.actor ? ` · ${event.actor}` : ""}` })) ?? []} />
        </div>
      )}
      {previewUrl && (
        <button type="button" onClick={() => setPreviewUrl(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Payment screenshot full preview" className="max-h-[90vh] max-w-full rounded-xl bg-white object-contain" />
        </button>
      )}
    </div>
  );
}

function Timeline({ title, empty, items }: { title: string; empty: string; items: Array<{ id: string; title: string; body: string }> }) {
  return (
    <div>
      <Label>{title}</Label>
      <div className="space-y-2">
        {items.map((item) => <div key={item.id} className="rounded-lg border border-ink/10 bg-white/60 p-3 text-xs text-ink-soft"><p className="font-semibold text-ink">{item.title}</p><p>{item.body}</p></div>)}
        {!items.length && <p className="text-xs text-ink-soft">{empty}</p>}
      </div>
    </div>
  );
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { orders, customersById, slotById, areaById, setOrderStatus, setOrderPayment } =
    useOperations();
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) return <NotFound orderId={orderId} />;

  const customer = customersById[order.customerId];
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
            {formatAppDate(
              order.deliveryDate,
              { weekday: "long", day: "numeric", month: "long" },
              "Delivery date pending",
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
            {customer ? (
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-ivory">
                    {customer.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                      {customer.name}
                      {customer.emailVerified && (
                        <span
                          title="Email verified"
                          className="inline-flex items-center gap-1 rounded-full bg-sage-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sage-ink"
                        >
                          <BadgeCheck size={11} /> Verified
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">{customer.phone}</p>
                    {customer.email && (
                      <p className="text-sm text-ink-soft">{customer.email}</p>
                    )}
                    <p className="mt-1 text-xs text-ink-soft">
                      {customer.totalOrders > 0
                        ? `${customer.totalOrders} order${
                            customer.totalOrders > 1 ? "s" : ""
                          } on account`
                        : "First order"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="inline-flex h-fit items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-3.5 py-2 text-sm font-medium text-ink transition hover:border-gold hover:text-gold"
                >
                  <ExternalLink size={14} /> Full profile
                </Link>
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                <p className="text-ink-soft">Guest / walk-in checkout</p>
                <p className="text-ink-soft">
                  {order.paymentMethod === "upi" ? "Manual UPI" : order.paymentMethod === "online" ? "Online payment" : "Cash on delivery"}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <ShoppingCart size={13} /> Items
            </p>
            <div className="divide-y divide-ink/5">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.image && (
                      <ProductItemImage
                        image={item.image}
                        name={item.name}
                        className="h-10 w-10 shrink-0 rounded-md"
                      />
                    )}
                    <span className="min-w-0 text-ink">
                      {item.quantity}× {item.name}
                      {item.color && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink">
                          {item.color}
                        </span>
                      )}
                      <span className="mt-0.5 block text-[11px] text-ink-soft">
                        {formatINR(item.price)} each
                      </span>
                    </span>
                  </div>
                  <span className="shrink-0 font-medium text-ink">
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
          <PaymentVerificationPanel order={order} />
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
                  {order.paymentMethod === "upi" ? "UPI" : order.paymentMethod === "online" ? "Online" : "COD"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Payment state</span>
                <span><PaymentStateBadge state={order.paymentState} /></span>
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
            <p>Placed {formatAppDate(order.createdAt, { dateStyle: "medium" })}</p>
            <p>Last updated {formatAppDate(order.updatedAt, { dateStyle: "medium" })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
