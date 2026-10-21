"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Category, ColorVariant, Flower, FlowerStockStatus } from "@/lib/types";
import { api } from "@/lib/api/client";

export const LOW_STOCK_THRESHOLD = 15;
export const FLOWER_STATUS_LABELS: Record<FlowerStockStatus, string> = {
  "in-stock": "In Stock", limited: "Limited Stock", "sold-out": "Sold Out", "pre-order": "Pre-order",
};
export const FLOWER_UNITS = ["Stems", "Bunch", "Box", "Bouquet", "Plant", "String", "Dozen", "Meter", "Mala", "Pcs", "sticks", "kg", "gm", "Bundle"] as const;

export interface ProductDraft {
  name: string; slug: string; categoryId: string; description: string; shortDescription: string;
  price: number; salePrice: number; quantity: number; unit: string; stock: number; sku: string;
  stockStatus: FlowerStockStatus; featured: boolean; bestSeller: boolean; newArrival: boolean;
  colors: string[]; colorVariants: ColorVariant[]; images: string[]; videos: string[];
  seoTitle: string; metaDescription: string; keywords: string[];
  active?: boolean; publicationStatus?: "draft" | "published"; unitLabel?: string;
  minQuantity?: number; quantityStep?: number; festivalTags?: string[]; badges?: Flower["badges"];
  poojaEligible?: boolean; requiresAdvancePayment?: boolean; deliveryPolicy?: Flower["deliveryPolicy"];
  occasionIds?: string[];
}

export type CategoryDraft = Pick<Category, "name" | "description"> & Partial<Omit<Category, "id">>;
interface CatalogValue {
  products: Flower[]; categories: Category[]; loading: boolean; busy: boolean; error: string;
  refresh: () => Promise<void>;
  addProduct: (draft: ProductDraft) => Promise<boolean>;
  updateProduct: (id: string, draft: ProductDraft) => Promise<boolean>;
  patchProduct: (id: string, patch: Partial<Flower>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  setProductActive: (id: string, active: boolean) => Promise<boolean>;
  setStockStatus: (id: string, status: FlowerStockStatus) => Promise<boolean>;
  adjustStock: (id: string, value: number) => Promise<boolean>;
  bulkSetStatus: (ids: string[], status: FlowerStockStatus) => Promise<void>;
  bulkSetActive: (ids: string[], active: boolean) => Promise<void>;
  addCategory: (draft: CategoryDraft) => Promise<Category | { error: string }>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  moveCategory: (id: string, direction: "up" | "down") => Promise<void>;
  productCountForCategory: (id: string) => number;
}
const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const [flowers, groups] = await Promise.all([api("/api/admin/flowers"), api("/api/admin/categories")]);
    setProducts(flowers);
    setCategories(groups);
  }, []);
  useEffect(() => {
    let alive = true;
    Promise.all([api("/api/admin/flowers"), api("/api/admin/categories")]).then(([flowers, groups]) => {
      if (alive) { setProducts(flowers); setCategories(groups); }
    }).catch((err) => { if (alive) setError(err instanceof Error ? err.message : "Could not load catalogue."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const mutate = useCallback(async (url: string, method: string, body?: unknown): Promise<boolean> => {
    setPending((count) => count + 1);
    setError("");
    try {
      await api(url, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed. Reload before retrying.");
      return false;
    } finally { setPending((count) => count - 1); }
  }, [refresh]);

  const patchProduct = useCallback((id: string, patch: Partial<Flower>) =>
    mutate(`/api/admin/flowers/${encodeURIComponent(id)}`, "PATCH", patch), [mutate]);
  const setStockStatus = useCallback((id: string, status: FlowerStockStatus) =>
    patchProduct(id, { stockStatus: status, ...(status === "sold-out" ? { stock: 0 } : {}) }), [patchProduct]);
  const updateCategory = useCallback((id: string, patch: Partial<Category>) =>
    mutate(`/api/admin/categories/${encodeURIComponent(id)}`, "PATCH", patch), [mutate]);

  const value = useMemo<CatalogValue>(() => ({
    products, categories, loading, busy: pending > 0, error, refresh,
    addProduct: (draft) => mutate("/api/admin/flowers", "POST", draft),
    updateProduct: (id, draft) => mutate(`/api/admin/flowers/${encodeURIComponent(id)}`, "PATCH", draft),
    patchProduct,
    deleteProduct: (id) => mutate(`/api/admin/flowers/${encodeURIComponent(id)}`, "DELETE"),
    setProductActive: (id, active) => patchProduct(id, { active }),
    setStockStatus,
    adjustStock: (id, stock) => patchProduct(id, { stock }),
    bulkSetStatus: async (ids, status) => {
      for (const id of ids) if (!(await setStockStatus(id, status))) break;
    },
    bulkSetActive: async (ids, active) => {
      for (const id of ids) if (!(await patchProduct(id, { active }))) break;
    },
    addCategory: async (draft) => {
      setPending((count) => count + 1);
      setError("");
      try {
        const result = await api("/api/admin/categories", { method: "POST", body: JSON.stringify(draft) });
        await refresh();
        return result.category as Category;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not save category.";
        setError(message);
        return { error: message };
      } finally { setPending((count) => count - 1); }
    },
    updateCategory,
    deleteCategory: (id) => mutate(`/api/admin/categories/${encodeURIComponent(id)}`, "DELETE"),
    moveCategory: async (id, direction) => {
      const ordered = [...categories];
      const index = ordered.findIndex((category) => category.id === id);
      const target = index + (direction === "up" ? -1 : 1);
      if (index < 0 || target < 0 || target >= ordered.length) return;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      // Normalize every order value: legacy categories can all have sortOrder=0.
      for (const [sortOrder, category] of ordered.entries()) {
        if (!(await updateCategory(category.id, { sortOrder }))) break;
      }
    },
    productCountForCategory: (id) => products.filter((flower) => flower.categoryId === id).length,
  }), [products, categories, loading, pending, error, refresh, mutate, patchProduct, setStockStatus, updateCategory]);

  return <CatalogContext.Provider value={value}>
    {error && <p role="alert" className="mb-4 rounded-md bg-blush p-3 text-sm text-red-800">{error} Bulk operations stop at the first error; earlier successful rows remain saved.</p>}
    {loading ? <p role="status" className="p-6 text-sm text-ink-soft">Loading catalogue…</p> : children}
  </CatalogContext.Provider>;
}
export function useCatalog(): CatalogValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within a CatalogProvider.");
  return value;
}
