"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { formatINR } from "@/lib/admin/analytics";
import { PaymentStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatAppDateTime } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

type CustomerSnapshot = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type PaymentRow = {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  paymentState: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpayPaymentMethod: string | null;
  createdAt: string | null;
  paidAt: string | null;
  customer: CustomerSnapshot | null;
};

type Summary = {
  totalCollected: number;
  todayCollected: number;
  monthCollected: number;
  paidCount: number;
  pendingCount: number;
  refundedCount: number;
  totalOnline: number;
};

type Filters = { status: string; q: string; from: string; to: string };

const EMPTY_SUMMARY: Summary = {
  totalCollected: 0,
  todayCollected: 0,
  monthCollected: 0,
  paidCount: 0,
  pendingCount: 0,
  refundedCount: 0,
  totalOnline: 0,
};

const REFRESH_INTERVAL_MS = 20_000;

function statusLabel(row: PaymentRow): PaymentStatus {
  return (row.paymentStatus as PaymentStatus) ?? "pending";
}

export function RazorpayPaymentsManager() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [filters, setFilters] = useState<Filters>({ status: "all", q: "", from: "", to: "" });
  const [applied, setApplied] = useState<Filters>({ status: "all", q: "", from: "", to: "" });

  const load = useCallback(async () => {
    setError("");
    const params = new URLSearchParams();
    if (applied.status && applied.status !== "all") params.set("status", applied.status);
    if (applied.q.trim()) params.set("q", applied.q.trim());
    if (applied.from) params.set("from", applied.from);
    if (applied.to) params.set("to", applied.to);
    const body = await api(`/api/admin/razorpay/payments?${params.toString()}`);
    setRows(Array.isArray(body.payments) ? body.payments as PaymentRow[] : []);
    setSummary(body.summary ? body.summary as Summary : EMPTY_SUMMARY);
  }, [applied]);

  useEffect(() => {
    let mounted = true;
    const run = () => {
      load()
        .catch((err) => {
          if (mounted) setError(err instanceof Error ? err.message : "Could not load Razorpay payments.");
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    };
    run();
    const interval = window.setInterval(run, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  async function sync(orderId: string) {
    setSyncingId(orderId);
    setError("");
    setMessage("");
    try {
      const result = await api(`/api/admin/orders/${encodeURIComponent(orderId)}/razorpay-sync`, { method: "POST" });
      setMessage(result.synced ? "Payment synced from Razorpay." : result.message ?? "Nothing to sync.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sync payment.");
    } finally {
      setSyncingId(null);
    }
  }

  async function reconcile() {
    setReconciling(true);
    setError("");
    setMessage("");
    try {
      const result = await api("/api/admin/razorpay/reconcile", { method: "POST" });
      setMessage(`Checked ${result.checked} pending order(s), reconciled ${result.reconciled}.${result.failed?.length ? ` ${result.failed.length} could not be reconciled.` : ""}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reconcile payments.");
    } finally {
      setReconciling(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <CreditCard size={13} /> Payments
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Razorpay payments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Every online order with its live payment status. Payments are confirmed by Razorpay; use Sync to re-check a pending order against the gateway.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setLoading(true); void load().catch(() => undefined).finally(() => setLoading(false)); }}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink transition hover:border-gold"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => void reconcile()}
            disabled={reconciling}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-ink-soft disabled:opacity-60"
          >
            {reconciling ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Reconcile pending
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total collected" value={formatINR(summary.totalCollected)} icon={IndianRupee} />
        <Stat label="Collected today" value={formatINR(summary.todayCollected)} icon={IndianRupee} />
        <Stat label="Collected this month" value={formatINR(summary.monthCollected)} icon={Wallet} />
        <Stat label="Pending payments" value={String(summary.pendingCount)} icon={CreditCard} hint={`${summary.paidCount} paid · ${summary.refundedCount} refunded`} />
      </div>

      <form
        className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white/70 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          setApplied({ ...filters });
          window.setTimeout(() => setLoading(false), 400);
        }}
      >
        <label className="text-xs font-semibold text-ink-soft">
          Search
          <span className="mt-1 flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2">
            <Search size={14} className="text-ink-soft" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Order, payment id, name, email"
              className="w-56 bg-transparent text-sm text-ink outline-none"
            />
          </span>
        </label>
        <label className="text-xs font-semibold text-ink-soft">
          Status
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="mt-1 block rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-soft">
          From
          <input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className="mt-1 block rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink" />
        </label>
        <label className="text-xs font-semibold text-ink-soft">
          To
          <input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className="mt-1 block rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink" />
        </label>
        <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory">Apply</button>
        <button
          type="button"
          onClick={() => { const cleared = { status: "all", q: "", from: "", to: "" }; setFilters(cleared); setApplied(cleared); }}
          className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink"
        >
          Clear
        </button>
      </form>

      {error && <p role="alert" className="mb-4 rounded-md bg-blush px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-sage px-4 py-3 text-sm font-semibold text-sage-ink">{message}</p>}

      {loading ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white/80 px-5 py-4 text-sm text-ink-soft shadow-sm">
          <Loader2 size={15} className="animate-spin" /> Loading payments…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-white/80 p-8 text-sm text-ink-soft shadow-sm">
          No Razorpay payments match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white/80 shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-ivory-deep/40 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Paid at</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((row) => (
                <tr key={row.orderId} className="align-top">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${row.orderId}`} className="font-semibold text-ink hover:text-gold">{row.orderNumber}</Link>
                    <p className="mt-0.5 text-[11px] text-ink-soft">{row.createdAt ? formatAppDateTime(row.createdAt, { dateStyle: "medium", timeStyle: "short" }) : "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {row.customer ? (
                      <>
                        <p className="font-medium text-ink">{row.customer.name}</p>
                        <p className="text-[11px] text-ink-soft">{row.customer.email ?? "—"}</p>
                        <p className="text-[11px] text-ink-soft">{row.customer.phone ?? "—"}</p>
                      </>
                    ) : (
                      <span className="text-ink-soft">Guest</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatINR(row.total)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={statusLabel(row)} />
                    {row.paymentState && <p className="mt-1 text-[11px] text-ink-soft">{row.paymentState.replace(/_/g, " ")}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{row.razorpayPaymentMethod ? row.razorpayPaymentMethod.toUpperCase() : "Razorpay"}</p>
                    <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-ink-soft" title={row.razorpayPaymentId ?? row.razorpayOrderId ?? undefined}>
                      {row.razorpayPaymentId ?? row.razorpayOrderId ?? "No gateway id"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {row.paidAt ? formatAppDateTime(row.paidAt, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/orders/${row.orderId}`} className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-gold">
                        <ExternalLink size={12} /> View
                      </Link>
                      {row.razorpayOrderId && (
                        <button
                          type="button"
                          disabled={syncingId === row.orderId}
                          onClick={() => void sync(row.orderId)}
                          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-ivory disabled:opacity-60"
                        >
                          {syncingId === row.orderId ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Sync
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft"><Icon size={12} /> {label}</p>
      <p className="mt-1 truncate font-display text-2xl text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}
