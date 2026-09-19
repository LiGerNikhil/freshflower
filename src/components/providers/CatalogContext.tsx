"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Category, Flower, FlowerStockStatus } from "@/lib/types";
import {
  categories as seedCategories,
  flowers as seedFlowers,
} from "@/lib/data";
import { api } from "@/lib/api/client";
import { slugify } from "@/lib/utils";

/**
 * Admin catalogue store (Phase 13; Phase 17 backs every mutation with MongoDB).
 *
 * The provider keeps an optimistic in-memory copy so the admin UI stays snappy,
 * but each mutation now also hits the real API routes (`/api/admin/flowers`,
 * `/api/admin/categories`) so edits persist across refreshes. On mount it
 * hydrates from the database so the admin reflects the live data.
 */

export const LOW_STOCK_THRESHOLD = 15;

export const FLOWER_STATUS_LABELS: Record<FlowerStockStatus, string> = {
  "in-stock": "In Stock",
  limited: "Limited Stock",
  "sold-out": "Sold Out",
  "pre-order": "Pre-order",
};

export const FLOWER_UNITS = [
  "Stems",
  "Bunch",
  "Box",
  "Bouquet",
  "Plant",
  "String",
  "Dozen",
  "Meter",
] as const;

export interface ProductDraft {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number;
  quantity: number;
  unit: string;
  stock: number;
  sku: string;
  stockStatus: FlowerStockStatus;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  colors: string[];
  images: string[];
  videos: string[];
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function unitForCategory(categoryId: string): string {
  if (categoryId === "cat-mogra") return "String";
  if (categoryId === "cat-orchid") return "Plant";
  return "Stems";
}

/** Deterministic pseudo-stock so the seed shows a realistic low/high mix. */
function seedFlower(base: Flower): Flower {
  const stock = base.inStock ? 6 + (hash(base.slug) % 45) : 0;
  let stockStatus: FlowerStockStatus;
  if (!base.inStock) stockStatus = "sold-out";
  else if (!base.availableToday) stockStatus = "pre-order";
  else if (stock < LOW_STOCK_THRESHOLD) stockStatus = "limited";
  else stockStatus = "in-stock";
  return {
    ...base,
    sku: `SKU-${base.slug.slice(0, 10).toUpperCase().replace(/-/g, "")}`,
    quantity: base.stemCount ?? 1,
    unit: unitForCategory(base.categoryId),
    stock,
    stockStatus,
    active: true,
    bestSeller: base.featured,
    newArrival: false,
    seoTitle: base.name,
    metaDescription: base.shortDescription,
    keywords: [base.categoryId.replace("cat-", "")],
  };
}

/** Keep the public availability flags in step with the admin stock status. */
function availabilityFromStatus(
  stockStatus: FlowerStockStatus,
): Pick<Flower, "inStock" | "availableToday"> {
  return {
    inStock: stockStatus !== "sold-out",
    availableToday:
      stockStatus === "in-stock" || stockStatus === "limited",
  };
}

interface CatalogValue {
  products: Flower[];
  categories: Category[];
  addProduct: (draft: ProductDraft) => void;
  updateProduct: (id: string, draft: ProductDraft) => void;
  deleteProduct: (id: string) => void;
  setProductActive: (id: string, active: boolean) => void;
  setStockStatus: (id: string, status: FlowerStockStatus) => void;
  /** Direct stock-number edit; re-derives the status automatically. */
  adjustStock: (id: string, value: number) => void;
  /** Bulk status toggle applied to every selected product. */
  bulkSetStatus: (ids: string[], status: FlowerStockStatus) => void;
  addCategory: (input: {
    name: string;
    description: string;
  }) => Category | { error: string };
  updateCategory: (
    id: string,
    patch: { name: string; description: string },
  ) => void;
  /** Returns an error string when the category still has products, else null. */
  deleteCategory: (id: string) => string | null;
  moveCategory: (id: string, direction: "up" | "down") => void;
  productCountForCategory: (categoryId: string) => number;
}

const CatalogContext = createContext<CatalogValue | null>(null);

function idForSlug(slug: string): string {
  return slug.startsWith("fl-") ? slug : `fl-${slug}`;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Flower[]>(() =>
    seedFlowers.map(seedFlower),
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    seedCategories.map((category) => ({ ...category })),
  );

  // Phase 17: hydrate from MongoDB so admin edits survive a refresh. Falls
  // back to the static seeds when the API isn't reachable (offline preview).
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [remoteProducts, remoteCategories] = await Promise.all([
          api("/api/admin/flowers"),
          api("/api/admin/categories"),
        ]);
        if (!mounted) return;
        if (Array.isArray(remoteProducts) && remoteProducts.length) {
          setProducts(remoteProducts.map((flower: Flower) => ({ ...flower })));
        }
        if (Array.isArray(remoteCategories) && remoteCategories.length) {
          setCategories(remoteCategories.map((category: Category) => ({ ...category })));
        }
      } catch {
        // Keep the seeded preview as the fallback.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const applyStatus = useCallback((flower: Flower, status: FlowerStockStatus): Flower => {
    const stock =
      status === "sold-out"
        ? 0
        : status === "limited"
          ? Math.min(flower.stock || 15, LOW_STOCK_THRESHOLD - 1) || 8
          : status === "pre-order"
            ? Math.max(flower.stock || 8, 8)
            : Math.max(flower.stock || 0, 1) || 25;
    return { ...flower, stock, stockStatus: status, ...availabilityFromStatus(status) };
  }, []);

  const draftToFlower = useCallback(
    (draft: ProductDraft, id = idForSlug(draft.slug)): Flower => ({
      id,
      name: draft.name,
      slug: draft.slug,
      categoryId: draft.categoryId,
      occasionIds: [],
      description: draft.description,
      shortDescription: draft.shortDescription,
      price: draft.price,
      compareAtPrice: draft.salePrice > 0 ? draft.salePrice : undefined,
      colors: draft.colors.length ? draft.colors : ["mixed"],
      images: draft.images.length ? draft.images : ["gradient-ivory"],
      videos: draft.videos,
      featured: draft.featured,
      rating: 0,
      reviewCount: 0,
      careInstructions: "",
      sku: draft.sku,
      quantity: draft.quantity,
      stemCount: draft.unit.toLowerCase().includes("stem") ? draft.quantity : undefined,
      unit: draft.unit,
      stock: draft.stock,
      ...availabilityFromStatus(draft.stockStatus),
      stockStatus: draft.stockStatus,
      active: true,
      bestSeller: draft.bestSeller,
      newArrival: draft.newArrival,
      seoTitle: draft.seoTitle,
      metaDescription: draft.metaDescription,
      keywords: draft.keywords,
    }),
    [],
  );

  const addProduct = useCallback(
    (draft: ProductDraft) => {
      api("/api/admin/flowers", { method: "POST", body: JSON.stringify(draft) }).catch(
        () => undefined,
      );
      setProducts((prev) => [draftToFlower(draft), ...prev]);
    },
    [draftToFlower],
  );

  const updateProduct = useCallback(
    (id: string, draft: ProductDraft) => {
      api(`/api/admin/flowers/${encodeURIComponent(id)}`, {
        method: "PATCH",
          body: JSON.stringify(draft),
      }).catch(() => undefined);
      setProducts((prev) =>
        prev.map((flower) =>
          flower.id === id ? draftToFlower(draft, draft.slug === flower.slug ? id : idForSlug(draft.slug)) : flower,
        ),
      );
    },
    [draftToFlower],
  );

  const deleteProduct = useCallback((id: string) => {
    api(`/api/admin/flowers/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
      () => undefined,
    );
    setProducts((prev) => prev.filter((flower) => flower.id !== id));
  }, []);

  const setProductActive = useCallback((id: string, active: boolean) => {
    api(`/api/admin/flowers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }).catch(() => undefined);
    setProducts((prev) =>
      prev.map((flower) => (flower.id === id ? { ...flower, active } : flower)),
    );
  }, []);

  const setStockStatus = useCallback(
    (id: string, status: FlowerStockStatus) => {
      api(`/api/admin/flowers/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          stockStatus: status,
          stock:
            status === "sold-out"
              ? 0
              : status === "limited"
                ? LOW_STOCK_THRESHOLD - 1
                : 25,
          inStock: status !== "sold-out",
          availableToday: status === "in-stock" || status === "limited",
        }),
      }).catch(() => undefined);
      setProducts((prev) =>
        prev.map((flower) => (flower.id === id ? applyStatus(flower, status) : flower)),
      );
    },
    [applyStatus],
  );

  const adjustStock = useCallback(
    (id: string, value: number) => {
      setProducts((prev) => {
        const flower = prev.find((candidate) => candidate.id === id);
        if (!flower) return prev;
        const quantity = Math.max(0, Math.round(value));
        const status: FlowerStockStatus =
          quantity === 0
            ? "sold-out"
            : flower.stockStatus === "pre-order"
              ? "pre-order"
              : quantity < LOW_STOCK_THRESHOLD
                ? "limited"
                : "in-stock";
        api(`/api/admin/flowers/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            stock: quantity,
            stockStatus: status,
            inStock: quantity > 0,
            availableToday: quantity > 0 && status !== "pre-order",
          }),
        }).catch(() => undefined);
        return prev.map(
          (candidate) =>
            candidate.id === id ? applyStatus(candidate, status) : candidate,
        );
      });
    },
    [applyStatus],
  );

  const bulkSetStatus = useCallback(
    (ids: string[], status: FlowerStockStatus) => {
      for (const id of ids) {
        api(`/api/admin/flowers/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            stockStatus: status,
            stock:
              status === "sold-out"
                ? 0
                : status === "limited"
                  ? LOW_STOCK_THRESHOLD - 1
                  : 25,
            inStock: status !== "sold-out",
            availableToday: status === "in-stock" || status === "limited",
          }),
        }).catch(() => undefined);
      }
      setProducts((prev) =>
        prev.map((flower) => (ids.includes(flower.id) ? applyStatus(flower, status) : flower)),
      );
    },
    [applyStatus],
  );

  const addCategory = useCallback(
    (input: { name: string; description: string }): Category | { error: string } => {
      const name = input.name.trim();
      const slug = slugify(name);
      if (!name) return { error: "Category name is required." };
      if (categories.some((category) => category.slug === slug)) {
        return { error: `A category called "${name}" already exists.` };
      }
      api("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(input),
      }).catch(() => undefined);
      const category: Category = {
        id: `cat-${slug}`,
        name,
        slug,
        description: input.description.trim(),
        heroImage: "gradient-ivory",
      };
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [categories],
  );

  const updateCategory = useCallback(
    (id: string, patch: { name: string; description: string }) => {
      api(`/api/admin/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }).catch(() => undefined);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id
            ? { ...category, name: patch.name.trim(), description: patch.description.trim() }
            : category,
        ),
      );
    },
    [],
  );

  const deleteCategory = useCallback(
    (id: string): string | null => {
      if (products.some((flower) => flower.categoryId === id)) {
        return "Category still has products — move or delete them first.";
      }
      api(`/api/admin/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => undefined);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      return null;
    },
    [products],
  );

  const moveCategory = useCallback((id: string, direction: "up" | "down") => {
    setCategories((prev) => {
      const index = prev.findIndex((category) => category.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      // Persist the new sort order so a refresh keeps the same ordering.
      const patches = [
        { id: next[index].id, sortOrder: index },
        { id: next[swapWith].id, sortOrder: swapWith },
      ];
      for (const { id: targetId, sortOrder } of patches) {
        api(`/api/admin/categories/${encodeURIComponent(targetId)}`, {
          method: "PATCH",
          body: JSON.stringify({ sortOrder }),
        }).catch(() => undefined);
      }
      return next;
    });
  }, []);

  const productCountForCategory = useCallback(
    (categoryId: string) =>
      products.filter((flower) => flower.categoryId === categoryId).length,
    [products],
  );

  const value = useMemo<CatalogValue>(
    () => ({
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      setProductActive,
      setStockStatus,
      adjustStock,
      bulkSetStatus,
      addCategory,
      updateCategory,
      deleteCategory,
      moveCategory,
      productCountForCategory,
    }),
    [
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      setProductActive,
      setStockStatus,
      adjustStock,
      bulkSetStatus,
      addCategory,
      updateCategory,
      deleteCategory,
      moveCategory,
      productCountForCategory,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider.");
  }
  return context;
}
