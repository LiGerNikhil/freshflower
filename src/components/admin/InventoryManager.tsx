"use client";

import { useMemo, useState } from "react";
import { Minus, PackageSearch, Plus } from "lucide-react";
import {
  useCatalog,
  LOW_STOCK_THRESHOLD,
  FLOWER_STATUS_LABELS,
} from "@/components/providers/CatalogContext";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminThumb } from "@/components/admin/AdminThumb";
import type { FlowerStockStatus } from "@/lib/types";

const STATUS_OPTIONS = (Object.keys(FLOWER_STATUS_LABELS) as FlowerStockStatus[]).map(
  (status) => ({ value: status, label: FLOWER_STATUS_LABELS[status] }),
);

const QUICK_DELTAS = [-10, -5, -1, 1, 5, 10];

export function InventoryManager() {
  const {
    products,
    categories,
    adjustStock,
    setStockStatus,
    bulkSetStatus,
  } = useCatalog();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const categoryName = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((flower) => {
      if (categoryFilter !== "all" && flower.categoryId !== categoryFilter) return false;
      if (lowOnly && !((flower.stock ?? 0) > 0 && (flower.stock ?? 0) < LOW_STOCK_THRESHOLD)) {
        return false;
      }
      if (
        q &&
        !`${flower.name} ${flower.slug} ${flower.sku ?? ""}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [products, query, categoryFilter, lowOnly]);

  const visibleIds = useMemo(() => filtered.map((flower) => flower.id), [filtered]);
  const allVisibleSelected = visibleIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) =>
      allVisibleSelected
        ? new Set([...prev].filter((id) => !visibleIds.includes(id)))
        : new Set([...prev, ...visibleIds]),
    );
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulk = (status: FlowerStockStatus) => {
    bulkSetStatus([...selected], status);
    setSelected(new Set());
  };

  const lowStock = products.filter(
    (flower) => (flower.stock ?? 0) > 0 && (flower.stock ?? 0) < LOW_STOCK_THRESHOLD,
  ).length;
  const soldOut = products.filter((flower) => flower.stockStatus === "sold-out").length;

  const inputClass =
    "w-20 rounded-md border border-ink/10 bg-white/70 px-2 py-1 text-center text-sm font-mono text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none";

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          <PackageSearch size={13} /> Catalogue
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Inventory</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          {products.length} items · {lowStock} low stock (under {LOW_STOCK_THRESHOLD}) ·{" "}
          {soldOut} sold out. Stock edits are saved immediately to the session
          store; highlight {">"} auto marks sold-out when it hits zero.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, slug, SKU…"
          aria-label="Search inventory"
          className="min-w-52 flex-1 rounded-md border border-ink/10 bg-white/70 px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
          className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(event) => setLowOnly(event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Low stock only
        </label>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-gold/30 bg-gold-soft/20 px-4 py-3">
          <span className="text-sm font-semibold">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={() => runBulk("in-stock")}
            className="rounded-md bg-sage px-3 py-1.5 text-xs font-bold text-sage-ink hover:bg-sage-ink hover:text-ivory"
          >
            Mark Available Today
          </button>
          <button
            type="button"
            onClick={() => runBulk("limited")}
            className="rounded-md bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-ivory"
          >
            Mark Limited Stock
          </button>
          <button
            type="button"
            onClick={() => runBulk("sold-out")}
            className="rounded-md bg-ink/10 px-3 py-1.5 text-xs font-bold text-ink-soft hover:bg-ink hover:text-ivory"
          >
            Mark Sold Out
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto rounded-md px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-ink/5"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible products"
                    className="h-4 w-4 accent-gold"
                  />
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Available today</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((flower) => {
                const stock = flower.stock ?? 0;
                const isLow = stock > 0 && stock < LOW_STOCK_THRESHOLD;
                const isSoldOut = flower.stockStatus === "sold-out";
                const isSelected = selected.has(flower.id);
                return (
                  <tr
                    key={flower.id}
                    data-inv-row={flower.id}
                    className={`border-b border-ink/5 last:border-0 ${
                      isSelected
                        ? "bg-gold-soft/20"
                        : isLow
                          ? "bg-blush/40 hover:bg-blush/60"
                          : isSoldOut
                            ? "opacity-55 hover:bg-ivory-deep/30"
                            : "hover:bg-ivory-deep/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(flower.id)}
                        aria-label={`Select ${flower.name}`}
                        className="h-4 w-4 accent-gold"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AdminThumb token={flower.images?.[0]} name={flower.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{flower.name}</p>
                          <p className="truncate text-xs text-ink-soft">{flower.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {categoryName.get(flower.categoryId) ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={flower.availableToday}
                        aria-label={`${flower.availableToday ? "Remove" : "Set"} available today for ${flower.name}`}
                        onClick={() =>
                          setStockStatus(
                            flower.id,
                            flower.availableToday ? "pre-order" : "in-stock",
                          )
                        }
                        className={`relative h-5 w-9 rounded-full transition ${
                          flower.availableToday ? "bg-sage-ink" : "bg-ink/15"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                            flower.availableToday ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={stock}
                          onChange={(event) =>
                            adjustStock(flower.id, Number(event.target.value))
                          }
                          aria-label={`Stock for ${flower.name}`}
                          className={inputClass}
                        />
                        <div className="flex items-center gap-0.5">
                          {QUICK_DELTAS.map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => adjustStock(flower.id, stock + delta)}
                              aria-label={
                                delta > 0
                                  ? `Add ${delta} to ${flower.name} stock`
                                  : `Reduce ${flower.name} stock by ${Math.abs(delta)}`
                              }
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink/10 text-xs font-bold text-ink-soft hover:bg-ink/5 hover:text-ink"
                            >
                              {delta > 0 ? <Plus size={12} /> : <Minus size={12} />}
                              {Math.abs(delta)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={flower.stockStatus ?? "in-stock"}
                        onChange={(event) =>
                          setStockStatus(flower.id, event.target.value as FlowerStockStatus)
                        }
                        aria-label={`Status for ${flower.name}`}
                        className="rounded-md border border-ink/10 bg-white/70 px-2 py-1 text-xs text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1">
                        <StatusBadge status={flower.stockStatus ?? "in-stock"} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-display text-lg text-ink">No inventory rows match.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Try clearing the search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}