"use client";

import { useState } from "react";
import { CalendarDays, Download, FileText, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

function indiaDay(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const inputClass =
  "mt-1.5 w-full rounded-md border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function DeliveryDateExportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [dateFrom, setDateFrom] = useState(indiaDay);
  const [dateTo, setDateTo] = useState(indiaDay);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function downloadPdf() {
    if (!dateFrom || !dateTo) {
      setError("Choose both a delivery start date and end date.");
      return;
    }
    if (dateFrom > dateTo) {
      setError("Start date must be on or before the end date.");
      return;
    }

    setDownloading(true);
    setError("");
    try {
      const query = new URLSearchParams({ from: dateFrom, to: dateTo });
      const response = await fetch(`/api/admin/orders/export/delivery-date/pdf?${query}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not generate the delivery-date PDF.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `FreshFlower_Delivery_Orders_${dateFrom}_to_${dateTo}.pdf`;
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
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <div className="pr-8">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          <FileText size={14} /> Stock planning report
        </p>
        <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
          Export orders by delivery date
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          The PDF starts with total product and color quantities to help plan flower stock, followed by each order and its delivery details.
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-ink/10 bg-ivory/70 p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <CalendarDays size={14} /> Customer-selected delivery dates
        </p>
        <p className="mb-3 text-xs leading-5 text-ink-soft">
          The stock summary counts paid orders only. The checkbox order details remain unchanged and include all matching non-cancelled orders.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-ink-soft">
            Delivery date from
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            Delivery date to
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
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
          disabled={downloading || !dateFrom || !dateTo}
          onClick={() => void downloadPdf()}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-bold text-ink transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {downloading ? "Preparing PDF…" : "Download delivery-date PDF"}
        </button>
      </div>
    </Modal>
  );
}
