"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatINR } from "@/lib/admin/analytics";
import { ORDER_EXPORT_TIME_WINDOW } from "@/lib/admin/order-export";

type Preset = "today" | "yesterday" | "last7" | "month" | "custom";

type ExportPreviewOrder = {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryDate?: string;
  deliveryTime: string;
  products: Array<{ name: string; color?: string; quantity: number }>;
  total: number;
  status: string;
};

type ExportPreview = {
  from: string;
  to: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalOrders: number;
  totalRevenue: number;
  orders: ExportPreviewOrder[];
};

const PRESETS: Array<{ id: Preset; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom range" },
];

const inputClass =
  "mt-1.5 w-full rounded-md border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

function indiaDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatIndiaDate(value: string, withTime = false): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  }).format(new Date(value));
}

export function OrderExportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const today = indiaDay();
  const [preset, setPreset] = useState<Preset>("today");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const previewRequestId = useRef(0);

  function choosePreset(nextPreset: Preset) {
    previewRequestId.current += 1;
    setPreset(nextPreset);
    setPreview(null);
    setLoadingPreview(false);
    setError("");
    if (nextPreset === "custom") return;
    if (nextPreset === "today") {
      setDateFrom(today);
      setDateTo(today);
    } else if (nextPreset === "yesterday") {
      const yesterday = shiftDay(today, -1);
      setDateFrom(yesterday);
      setDateTo(yesterday);
    } else if (nextPreset === "last7") {
      setDateFrom(shiftDay(today, -6));
      setDateTo(today);
    } else {
      setDateFrom(`${today.slice(0, 7)}-01`);
      setDateTo(today);
    }
  }

  async function applyRange(page = 1) {
    if (!dateFrom || !dateTo) {
      setError("Choose both a start date and an end date.");
      return;
    }
    if (dateFrom > dateTo) {
      setError("Start date must be on or before the end date.");
      return;
    }
    const requestId = ++previewRequestId.current;
    setLoadingPreview(true);
    setError("");
    try {
      const query = new URLSearchParams({ from: dateFrom, to: dateTo, page: String(page) });
      const response = await fetch(`/api/admin/orders/export?${query}`, { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not load eligible orders.");
      if (requestId !== previewRequestId.current) return;
      setPreview(body as ExportPreview);
    } catch (cause) {
      if (requestId !== previewRequestId.current) return;
      setError(cause instanceof Error ? cause.message : "Could not load eligible orders.");
      if (page === 1) setPreview(null);
    } finally {
      if (requestId === previewRequestId.current) setLoadingPreview(false);
    }
  }

  async function downloadPdf() {
    if (!preview || preview.totalOrders === 0) return;
    setDownloading(true);
    setError("");
    try {
      const query = new URLSearchParams({ from: preview.from, to: preview.to });
      const response = await fetch(`/api/admin/orders/export/pdf?${query}`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not generate the PDF.");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `FreshFlower_Orders_${preview.from}_to_${preview.to}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not download the PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-5xl">
      <div className="pr-8">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          <FileText size={14} /> Orders report
        </p>
        <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Export orders to PDF</h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          Preview orders created in your selected date range. Only paid and confirmed orders are included.
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-ink/10 bg-ivory/70 p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <CalendarDays size={14} /> Date range · India Standard Time
        </p>
        <p className="mb-3 text-xs leading-5 text-ink-soft">
          Each selected date includes orders placed from {ORDER_EXPORT_TIME_WINDOW}. Refresh the preview to include the latest orders.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={preset === item.id}
              onClick={() => choosePreset(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                preset === item.id
                  ? "bg-ink text-ivory"
                  : "border border-ink/10 bg-white text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
          <label className="text-xs font-semibold text-ink-soft">
            Start date
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                previewRequestId.current += 1;
                setPreset("custom");
                setDateFrom(event.target.value);
                setPreview(null);
                setLoadingPreview(false);
              }}
              className={inputClass}
            />
          </label>
          <span className="hidden pb-3 text-ink-soft sm:block">to</span>
          <label className="text-xs font-semibold text-ink-soft">
            End date
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                previewRequestId.current += 1;
                setPreset("custom");
                setDateTo(event.target.value);
                setPreview(null);
                setLoadingPreview(false);
              }}
              className={inputClass}
            />
          </label>
          <button
            type="button"
            disabled={loadingPreview || !dateFrom || !dateTo}
            onClick={() => void applyRange()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingPreview ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
            {loadingPreview ? "Loading…" : "Apply filters"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {loadingPreview && !preview && (
        <div className="py-12 text-center text-sm text-ink-soft">
          <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
          Loading paid and confirmed orders…
        </div>
      )}

      {preview && (
        <section className="mt-5" aria-live="polite">
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-ink/10 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Eligible orders</p>
              <p className="mt-1 text-xl font-semibold text-ink">{preview.totalOrders.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Total revenue</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatINR(preview.totalRevenue)}</p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Selected date range</p>
              <p className="mt-1 text-sm font-semibold text-ink">{preview.from} → {preview.to}</p>
              <p className="mt-1 text-[10px] text-ink-soft">Each date: {ORDER_EXPORT_TIME_WINDOW}</p>
            </div>
          </div>

          {preview.totalOrders === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/20 bg-ivory/50 px-4 py-10 text-center">
              <FileText size={22} className="mx-auto text-ink-soft/60" />
              <p className="mt-2 font-semibold text-ink">No eligible orders found</p>
              <p className="mt-1 text-sm text-ink-soft">Try another date range. Unpaid or unconfirmed orders are excluded.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-ink/10">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead className="bg-ivory-deep/60 text-[10px] uppercase tracking-wide text-ink-soft">
                    <tr>
                      <th className="px-3 py-2.5">Order number / date</th>
                      <th className="px-3 py-2.5">Customer</th>
                      <th className="px-3 py-2.5">Products and variants</th>
                      <th className="px-3 py-2.5 text-right">Payment amount</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.orders.map((order) => (
                      <tr key={order.orderNumber} className="border-t border-ink/5 align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-ink">{order.orderNumber}</p>
                          <p className="mt-1 text-ink-soft">{formatIndiaDate(order.createdAt, true)}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-ink">{order.customerName}</p>
                          <p className="mt-1 text-ink-soft">{order.customerPhone}</p>
                          <p className="mt-2 border-t border-ink/5 pt-1.5 text-[10px] text-ink-soft">
                            Delivery: {order.deliveryDate ? formatIndiaDate(order.deliveryDate) : "Not specified"}
                            <br />
                            Slot: {order.deliveryTime}
                          </p>
                        </td>
                        <td className="max-w-sm px-3 py-3 text-ink-soft">
                          {order.products.map((item, index) => (
                            <p key={`${item.name}-${item.color ?? ""}-${index}`}>
                              {item.quantity} × {item.name}{item.color ? ` · ${item.color}` : ""}
                            </p>
                          ))}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-ink">{formatINR(order.total)}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-sage/35 px-2 py-1 text-[10px] font-bold uppercase text-sage-ink">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-ink-soft">
                  Showing {((preview.page - 1) * preview.pageSize) + 1}–{Math.min(preview.page * preview.pageSize, preview.totalOrders)} of {preview.totalOrders.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loadingPreview || preview.page <= 1}
                    onClick={() => void applyRange(preview.page - 1)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    <ArrowLeft size={13} /> Previous
                  </button>
                  <span className="text-xs tabular-nums text-ink-soft">{preview.page} / {preview.totalPages}</span>
                  <button
                    type="button"
                    disabled={loadingPreview || preview.page >= preview.totalPages}
                    onClick={() => void applyRange(preview.page + 1)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    Next <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-ink/10 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
        >
          Close
        </button>
        <button
          type="button"
          disabled={!preview || preview.totalOrders === 0 || downloading || loadingPreview}
          onClick={() => void downloadPdf()}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-bold text-ink transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>
    </Modal>
  );
}
