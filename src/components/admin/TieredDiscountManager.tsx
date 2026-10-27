"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import {
  DEFAULT_TIERS,
  TIERED_DISCOUNT_ABSOLUTE_CAP,
  TIERED_DISCOUNT_CODE,
  TIERED_DISCOUNT_ID,
  computeTieredDiscount,
  formatDiscountINR,
  normalizeTieredDiscountConfig,
} from "@/lib/discounts";
import type { Coupon } from "@/lib/types";

interface TierRow {
  threshold: string;
  amount: string;
}

const DEFAULT_ROWS: TierRow[] = DEFAULT_TIERS.map((tier) => ({
  threshold: String(tier.threshold),
  amount: String(tier.amount),
}));

export function TieredDiscountManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [active, setActive] = useState(true);
  const [appliesToOrders, setAppliesToOrders] = useState(true);
  const [appliesToDiwali, setAppliesToDiwali] = useState(true);
  const [maxDiscount, setMaxDiscount] = useState(
    String(TIERED_DISCOUNT_ABSOLUTE_CAP),
  );
  const [rows, setRows] = useState<TierRow[]>(DEFAULT_ROWS);

  useEffect(() => {
    let alive = true;
    api("/api/admin/coupons")
      .then((list: Coupon[]) => {
        if (!alive) return;
        const existing = Array.isArray(list)
          ? list.find(
              (coupon) =>
                coupon.autoApply || coupon.id === TIERED_DISCOUNT_ID,
            )
          : undefined;
        if (!existing) return;
        setActive(existing.active !== false);
        setAppliesToOrders(existing.appliesToOrders !== false);
        setAppliesToDiwali(existing.appliesToDiwali !== false);
        setMaxDiscount(
          String(existing.maxDiscountCap ?? TIERED_DISCOUNT_ABSOLUTE_CAP),
        );
        if (Array.isArray(existing.tiers) && existing.tiers.length) {
          setRows(
            existing.tiers.map((tier) => ({
              threshold: String(tier.threshold),
              amount: String(tier.amount),
            })),
          );
        }
      })
      .catch((cause) => {
        if (alive) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load the automatic reward settings.",
          );
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const cleanTiers = useMemo(
    () =>
      rows
        .map((row) => ({
          threshold: Number(row.threshold),
          amount: Number(row.amount),
        }))
        .filter(
          (tier) =>
            Number.isFinite(tier.threshold) &&
            Number.isFinite(tier.amount) &&
            tier.threshold > 0 &&
            tier.amount > 0,
        ),
    [rows],
  );

  const preview = useMemo(
    () =>
      computeTieredDiscount(
        2_500,
        normalizeTieredDiscountConfig({
          active,
          maxDiscount: Number(maxDiscount) || 0,
          appliesToOrders,
          appliesToDiwali,
          tiers: cleanTiers,
        }),
        "orders",
      ),
    [active, maxDiscount, appliesToOrders, appliesToDiwali, cleanTiers],
  );

  const updateRow = (index: number, key: keyof TierRow, value: string) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      await api("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          id: TIERED_DISCOUNT_ID,
          code: TIERED_DISCOUNT_CODE,
          description: "Automatic tiered cart reward",
          discountType: "flat",
          discountValue: 0,
          minOrderValue: 0,
          maxDiscountCap: Math.min(
            TIERED_DISCOUNT_ABSOLUTE_CAP,
            Math.max(0, Number(maxDiscount) || 0),
          ),
          active,
          autoApply: true,
          appliesToOrders,
          appliesToDiwali,
          tiers: cleanTiers,
        }),
      });
      setStatus("Automatic reward settings saved.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save the automatic reward settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="tiered-discount-heading"
      className="mb-10 rounded-xl border border-gold/30 bg-white/80 p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Sparkles size={13} /> Automatic reward
          </p>
          <h2
            id="tiered-discount-heading"
            className="mt-2 font-display text-2xl"
          >
            Tiered cart discount
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            Applied automatically to the eligible cart subtotal. Only the
            highest unlocked tier applies, never more than{" "}
            {formatDiscountINR(TIERED_DISCOUNT_ABSOLUTE_CAP)} per order, and it
            does not stack with manual coupon codes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 font-semibold">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Active
          </label>
          <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 font-semibold">
            <input
              type="checkbox"
              checked={appliesToOrders}
              onChange={(event) => setAppliesToOrders(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Regular orders
          </label>
          <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 font-semibold">
            <input
              type="checkbox"
              checked={appliesToDiwali}
              onChange={(event) => setAppliesToDiwali(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Diwali bookings
          </label>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-ink-soft">Loading settings…</p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
            <div className="overflow-hidden rounded-lg border border-ink/10">
              <div className="grid grid-cols-[1fr_1fr_40px] gap-2 bg-ivory-deep/60 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <span>Unlock at (₹)</span>
                <span>Discount (₹)</span>
                <span className="sr-only">Remove</span>
              </div>
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_40px] items-center gap-2 border-t border-ink/5 px-3 py-2"
                >
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={row.threshold}
                    onChange={(event) =>
                      updateRow(index, "threshold", event.target.value)
                    }
                    aria-label={`Tier ${index + 1} threshold`}
                    className="min-w-0 rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm tabular-nums"
                  />
                  <input
                    type="number"
                    min={1}
                    max={TIERED_DISCOUNT_ABSOLUTE_CAP}
                    step={1}
                    value={row.amount}
                    onChange={(event) =>
                      updateRow(index, "amount", event.target.value)
                    }
                    aria-label={`Tier ${index + 1} discount`}
                    className="min-w-0 rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRows((current) =>
                        current.length > 1
                          ? current.filter((_, rowIndex) => rowIndex !== index)
                          : current,
                      )
                    }
                    disabled={rows.length <= 1}
                    aria-label={`Remove tier ${index + 1}`}
                    className="rounded-md p-2 text-ink-soft transition hover:bg-blush-deep hover:text-ink disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                Maximum discount (₹)
                <input
                  type="number"
                  min={0}
                  max={TIERED_DISCOUNT_ABSOLUTE_CAP}
                  step={1}
                  value={maxDiscount}
                  onChange={(event) => setMaxDiscount(event.target.value)}
                  className="mt-1.5 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <p className="text-[11px] leading-4 text-ink-soft">
                Hard-capped at {formatDiscountINR(TIERED_DISCOUNT_ABSOLUTE_CAP)}.
                Higher values are clamped by the backend.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  { threshold: "", amount: "" },
                ])
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-2 text-xs font-semibold"
            >
              <Plus size={14} /> Add tier
            </button>
            <p className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Gift size={14} className="text-gold" />
              At {formatDiscountINR(2500)}:{" "}
              <strong className="text-ink">
                {formatDiscountINR(preview.discount)} off
              </strong>
              {preview.nextTier
                ? ` · ${formatDiscountINR(Math.ceil(preview.amountToNext))} to ${formatDiscountINR(preview.nextTier.amount)} off`
                : " · maximum reward"}
            </p>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory disabled:opacity-50"
            >
              <Save size={15} /> {saving ? "Saving…" : "Save reward settings"}
            </button>
          </div>
        </>
      )}

      {status && (
        <p role="status" className="mt-3 text-sm font-semibold text-sage-ink">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
