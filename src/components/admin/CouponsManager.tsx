"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Calendar,
  Percent,
  Plus,
  Search,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import { usePhase15 } from "@/components/providers/Phase15Provider";
import { formatINR } from "@/lib/admin/analytics";
import type { Coupon } from "@/lib/types";

export function CouponsManager() {
  const { coupons, addCoupon, deleteCoupon, toggleCouponActive } =
    usePhase15();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [coupons, query]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Wallet size={13} /> Coupons
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Coupons
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {coupons.length} coupons · synced from the live database.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Plus size={15} /> New coupon
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search code or description…"
            aria-label="Search coupons"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Cap / limit</th>
                <th className="px-4 py-3">Valid</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-gold" />
                      <span className="font-semibold">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">
                      {coupon.discountType === "percentage" ? (
                        <Percent size={14} className="inline mr-1" />
                      ) : (
                        <Wallet size={14} className="inline mr-1" />
                      )}
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : formatINR(coupon.discountValue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {coupon.minOrderValue
                      ? formatINR(coupon.minOrderValue)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <span className="whitespace-nowrap">
                      {coupon.maxDiscountCap
                        ? `${formatINR(coupon.maxDiscountCap)} cap`
                        : "—"}{" "}
                      · {coupon.usageLimit ?? "∞"} uses ·{" "}
                      {coupon.perUserLimit ?? 1}/user
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft text-xs">
                    {new Date(coupon.validFrom).toLocaleDateString(
                      "en-IN",
                    )}{" "}
                    →{" "}
                    {new Date(coupon.validUntil).toLocaleDateString(
                      "en-IN",
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleCouponActive(coupon.id)}
                      aria-label={
                        coupon.active ? `Deactivate ${coupon.code}` : `Activate ${coupon.code}`
                      }
                      className={`rounded-sm px-2.5 py-0.5 text-xs font-semibold ${
                        coupon.active
                          ? "bg-sage text-sage-ink"
                          : "bg-ink/10 text-ink-soft"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        aria-label={`Edit ${coupon.code}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                      >
                        Edit <ArrowRight size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(coupon.id)}
                        aria-label={`Delete ${coupon.code}`}
                        className="rounded-md p-2 text-ink-soft transition hover:bg-blush-deep hover:text-ink"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-display text-lg text-ink-soft">
              No coupons match.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CouponForm() {
  const { coupons, addCoupon, updateCoupon } = usePhase15();
  const params = useParams();
  const id = params.id as string | undefined;
  const existing = id
    ? coupons.find((coupon) => coupon.id === id)
    : null;

  const [code, setCode] = useState(existing?.code ?? "");
  const [description, setDescription] = useState(
    existing?.description ?? "",
  );
  const [discountType, setDiscountType] = useState<
    "percentage" | "flat"
  >(existing?.discountType ?? "percentage");
  const [discountValue, setDiscountValue] = useState(
    existing?.discountValue ?? 0,
  );
  const [minOrderValue, setMinOrderValue] = useState(
    existing?.minOrderValue ?? 0,
  );
  const [maxDiscountCap, setMaxDiscountCap] = useState(
    existing?.maxDiscountCap ?? 0,
  );
  const [usageLimit, setUsageLimit] = useState(
    existing?.usageLimit ?? "",
  );
  const [perUserLimit, setPerUserLimit] = useState(
    existing?.perUserLimit ?? 1,
  );
  const [validFrom, setValidFrom] = useState(
    existing?.validFrom ? existing.validFrom.slice(0, 10) : "",
  );
  const [validUntil, setValidUntil] = useState(
    existing?.validUntil ? existing.validUntil.slice(0, 10) : "",
  );

  const isEdit = Boolean(existing);

  const handleSave = () => {
    const base = {
      code: code.trim(),
      description: description.trim(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || undefined,
      maxDiscountCap: maxDiscountCap || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      perUserLimit,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
    };
    if (isEdit && id) {
      updateCoupon(id, base);
    } else {
      addCoupon({
        id: `cpn-${Date.now()}`,
        ...base,
        active: true,
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
        >
          <ArrowRight size={16} /> Back to coupons
        </Link>
        <h1 className="mt-4 font-display text-3xl">
          {isEdit ? "Edit coupon" : "New coupon"}
        </h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="rounded-xl border border-ink/10 bg-white/80 p-6">
          <h2 className="mb-4 font-display text-lg">Details</h2>
          <div className="grid gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Code</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Description</span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Discount type</span>
                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(
                      e.target.value as "percentage" | "flat",
                    )
                  }
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Fixed amount</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Discount value (₹ or %)</span>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(Number(e.target.value))
                  }
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">
                  Max discount cap (₹)
                </span>
                <input
                  type="number"
                  value={maxDiscountCap}
                  onChange={(e) =>
                    setMaxDiscountCap(Number(e.target.value))
                  }
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Usage limit</span>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="∞"
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Min order (₹)</span>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) =>
                    setMinOrderValue(Number(e.target.value))
                  }
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Per user limit</span>
                <input
                  type="number"
                  value={perUserLimit}
                  onChange={(e) =>
                    setPerUserLimit(Number(e.target.value))
                  }
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Valid from</span>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Valid until</span>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/60"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/coupons"
            className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-ink/5"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-ink px-6 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
          >
            {isEdit ? "Save changes" : "Create coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}