"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  BadgeCheck,
  Package,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useCatalog, LOW_STOCK_THRESHOLD } from "@/components/providers/CatalogContext";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { formatINR } from "@/lib/admin/analytics";
import type { FlowerStockStatus } from "@/lib/types";

const STATUS_FILTERS: { value: FlowerStockStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "in-stock", label: "In Stock" },
  { value: "limited", label: "Limited Stock" },
  { value: "sold-out", label: "Sold Out" },
  { value: "pre-order", label: "Pre-order" },
];

function FlagChip({
  active,
  label,
  children,
}: {
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!active) return null;
  return (
    <span
      title={label}
      aria-label={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold"
    >
      {children}
    </span>
  );
}

export function ProductsManager() {
  const {
    products,
    categories,
    deleteProduct,
    setProductActive,
  } = useCatalog();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FlowerStockStatus | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const categoryName = useMemo(
    () =>
      new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((flower) => {
      if (categoryFilter !== "all" && flower.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && flower.stockStatus !== statusFilter) return false;
      if (q && !`${flower.name} ${flower.slug}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, categoryFilter, statusFilter]);

  const lowStockCount = products.filter(
    (flower) => flower.stock !== undefined && flower.stock > 0 && flower.stock < LOW_STOCK_THRESHOLD,
  ).length;
  const inactiveCount = products.filter((flower) => flower.active === false).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Package size={13} /> Catalogue
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {products.length} flowers · {lowStockCount} low stock · {inactiveCount}{" "}
            disabled. Synced from the live database.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Plus size={15} /> New product
        </Link>
      </div>

      {/* Toolbar */}
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
            placeholder="Search name or slug…"
            aria-label="Search products"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
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
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as FlowerStockStatus | "all")
          }
          aria-label="Filter by status"
          className="rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Selling price</th>
                <th className="px-4 py-3">Qty / Unit</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((flower) => (
                <tr
                  key={flower.id}
                  data-product-row={flower.id}
                  className={`border-b border-ink/5 last:border-0 ${
                    flower.active === false ? "bg-ink/[0.02] opacity-60" : "hover:bg-ivory-deep/30"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AdminThumb token={flower.images?.[0]} name={flower.name} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{flower.name}</p>
                        <p className="truncate text-xs text-ink-soft">/{flower.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ink-soft">
                      {categoryName.get(flower.categoryId) ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold">{formatINR(flower.price)}</span>
                    {flower.compareAtPrice && flower.compareAtPrice > flower.price && (
                      <span className="ml-1.5 text-xs text-ink-soft line-through">
                        {formatINR(flower.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                    {flower.quantity}
                    {flower.unit ? ` ${flower.unit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {flower.stockStatus === "sold-out" ? (
                      <span className="font-mono text-ink-soft">—</span>
                    ) : (
                      <span
                        className={`font-mono ${
                          (flower.stock ?? 0) < LOW_STOCK_THRESHOLD
                            ? "font-bold text-gold"
                            : ""
                        }`}
                      >
                        {flower.stock ?? 0}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {flower.stockStatus && <StatusBadge status={flower.stockStatus} />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <FlagChip active={flower.featured} label="Featured">
                        <Star size={12} fill="currentColor" />
                      </FlagChip>
                      <FlagChip active={flower.bestSeller} label="Best seller">
                        <BadgeCheck size={12} />
                      </FlagChip>
                      <FlagChip active={flower.newArrival} label="New arrival">
                        <Sparkles size={12} />
                      </FlagChip>
                      {flower.active === false && (
                        <span className="rounded-sm bg-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {confirmDelete === flower.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProduct(flower.id);
                              setConfirmDelete(null);
                            }}
                            className="rounded-md bg-blush-deep px-3 py-1.5 text-xs font-bold text-ink hover:bg-blush-deep/80"
                          >
                            Confirm delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-ink/5"
                          >
                            Keep
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin/products/${flower.id}/edit`}
                            aria-label={`Edit ${flower.name}`}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                          >
                            Edit <ArrowRight size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductActive(flower.id, flower.active !== false ? false : true)}
                            aria-label={flower.active === false ? `Enable ${flower.name}` : `Disable ${flower.name}`}
                            title={flower.active === false ? "Enable product" : "Disable product"}
                            className="rounded-md p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                          >
                            <Ban size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(flower.id)}
                            aria-label={`Delete ${flower.name}`}
                            title="Delete product"
                            className="rounded-md p-2 text-ink-soft transition hover:bg-blush-deep hover:text-ink"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-display text-lg text-ink">No products match.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Try clearing the search or filters, or create a new product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
