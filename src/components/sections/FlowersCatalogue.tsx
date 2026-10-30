"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  ChevronDown,
  Flower2,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ProductCard } from "@/components/sections/ProductCard";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { useCart } from "@/components/providers/CartContext";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";
import { categories as fallbackCategories } from "@/lib/data/categories";
import { occasions as fallbackOccasions } from "@/lib/data/occasions";
import { buildFlowerDocs, searchDocs } from "@/lib/search/engine";
import {
  MAX_PRICE,
  type Availability,
  type CatalogState,
  type SortValue,
} from "@/lib/catalog";
import type { Category, Flower, Occasion } from "@/lib/types";

const PAGE_SIZE = 8;

interface FlowersCatalogueProps {
  flowers: Flower[];
  initialState: CatalogState;
  categories?: Category[];
  occasions?: Occasion[];
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function statusFor(flower: Flower): Availability {
  if (flower.stockStatus === "sold-out" || !flower.inStock) return "soldout";
  if (flower.stockStatus === "limited") return "limited";
  if (flower.stockStatus === "pre-order") return "preorder";
  return flower.availableToday ? "today" : "preorder";
}

function quantityForFilter(flower: Flower): number | undefined {
  return flower.stemCount ?? flower.quantity;
}

function isPlant(flower: Flower): boolean {
  return (
    flower.unit?.toLowerCase().includes("plant") ||
    flower.categoryId === "cat-orchid"
  );
}

function newestTime(flower: Flower): number {
  const stamped = flower.createdAt ?? flower.updatedAt;
  return stamped ? new Date(stamped).getTime() || 0 : 0;
}

function popularOrder(a: Flower, b: Flower) {
  return (
    Number(b.newArrival) - Number(a.newArrival) ||
    Number(b.bestSeller) - Number(a.bestSeller) ||
    newestTime(b) - newestTime(a) ||
    b.rating - a.rating
  );
}

export default function FlowersCatalogue({
  flowers,
  initialState,
  categories = fallbackCategories,
  occasions = fallbackOccasions,
}: FlowersCatalogueProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCart();
  const { requireAuth } = useCustomerAuth();
  const [state, setState] = useState(initialState);
  const [quickView, setQuickView] = useState<Flower | null>(null);

  const update = (next: Partial<CatalogState>) => {
    const nextState = { ...state, ...next };
    setState(nextState);
    const params = new URLSearchParams();
    if (nextState.query) params.set("q", nextState.query);
    if (nextState.categoryIds.length)
      params.set("category", nextState.categoryIds.join(","));
    if (nextState.sort !== (nextState.query.trim() ? "relevance" : "popular"))
      params.set("sort", nextState.sort);
    if (nextState.availability.length)
      params.set("availability", nextState.availability.join(","));
    if (nextState.occasionIds.length)
      params.set("occasion", nextState.occasionIds.join(","));
    if (nextState.minPrice > 0) params.set("min", String(nextState.minPrice));
    if (nextState.maxPrice < MAX_PRICE)
      params.set("max", String(nextState.maxPrice));
    if (nextState.units.length) params.set("unit", nextState.units.join(","));
    if (nextState.page > 1) params.set("page", String(nextState.page));
    router.replace(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const clearSearch = () => update({ query: "", page: 1, sort: "popular" });

  const searchDocsForFlowers = useMemo(
    () => buildFlowerDocs(flowers, categories, occasions),
    [flowers, categories, occasions],
  );

  const searchRank = useMemo(() => {
    if (!state.query.trim()) return null;
    const hits = searchDocs(searchDocsForFlowers, state.query);
    return new Map(
      hits.map((hit, index) => [hit.id, { score: hit.score, index }]),
    );
  }, [searchDocsForFlowers, state.query]);

  const matchingFlowers = useMemo(() => {
    return flowers
      .filter((flower) => {
        if (searchRank && !searchRank.has(flower.id)) return false;
        const categoryMatch =
          !state.categoryIds.length ||
          state.categoryIds.includes(flower.categoryId);
        const occasionMatch =
          !state.occasionIds.length ||
          flower.occasionIds.some((id) => state.occasionIds.includes(id));
        const unitMatch =
          !state.units.length ||
          state.units.some((unit) =>
            unit === "plant"
              ? isPlant(flower)
              : unit === "stems-6"
                ? quantityForFilter(flower) === 6
                : unit === "stems-10"
                  ? quantityForFilter(flower) === 10
                  : quantityForFilter(flower) === 12,
          );
        const availabilityMatch =
          !state.availability.length ||
          state.availability.includes(statusFor(flower));
        return (
          categoryMatch &&
          occasionMatch &&
          unitMatch &&
          availabilityMatch &&
          flower.price >= state.minPrice &&
          flower.price <= state.maxPrice
        );
      })
      .sort((a, b) => {
        if (state.sort === "relevance" && searchRank) {
          return (
            (searchRank.get(a.id)?.index ?? Number.MAX_SAFE_INTEGER) -
            (searchRank.get(b.id)?.index ?? Number.MAX_SAFE_INTEGER)
          );
        }
        if (state.sort === "price-asc") return a.price - b.price;
        if (state.sort === "price-desc") return b.price - a.price;
        if (state.sort === "new") {
          return newestTime(b) - newestTime(a) || b.id.localeCompare(a.id);
        }
        return popularOrder(a, b);
      });
  }, [flowers, searchRank, state]);

  const pageCount = Math.max(1, Math.ceil(matchingFlowers.length / PAGE_SIZE));
  const safePage = Math.min(state.page, pageCount);
  const visibleFlowers = matchingFlowers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const buyNow = (flower: Flower) => {
    if (!flower.inStock) return;
    if (!requireAuth()) return;
    addItem({
      productId: flower.id,
      productType: "flower",
      name: flower.name,
      price: flower.price,
      quantity: 1,
      image: flower.images[0],
    });
    router.push("/checkout");
  };

  const hasQuery = Boolean(state.query.trim());

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <section className="relative overflow-hidden bg-ivory-deep px-5 py-16 md:px-10 md:py-24">
        <HeroVideo />
        <div className="relative mx-auto max-w-7xl">
          <motion.div variants={reveal} initial="hidden" animate="visible">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
              The full flower edit
            </p>
            <h1 className="text-5xl leading-none md:text-7xl">
              Find your flowers.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-ink-soft">
              Fresh stems, thoughtful bunches, and small luxuries for every kind
              of day in Delhi NCR.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-[84px] z-20 border-b border-ink/10 bg-ivory/90 px-5 py-4 backdrop-blur-xl sm:top-[92px] md:top-[104px] md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
              {hasQuery ? (
                <>
                  <Search size={15} className="shrink-0 text-gold" />
                  <span className="truncate">
                    Results for “{state.query.trim()}”
                  </span>
                </>
              ) : (
                "Browse all flowers"
              )}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {matchingFlowers.length}{" "}
              {matchingFlowers.length === 1 ? "flower" : "flowers"}
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            {hasQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="whitespace-nowrap rounded-md border border-ink/10 bg-white/70 px-3 py-3 text-xs font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
              >
                Clear search
              </button>
            )}
            <label className="relative flex w-full items-center sm:w-auto">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 text-ink-soft"
              />
              <select
                aria-label="Sort flowers"
                value={state.sort}
                onChange={(event) =>
                  update({ sort: event.target.value as SortValue, page: 1 })
                }
                className="w-full appearance-none rounded-md border border-ink/10 bg-white/70 py-3 pl-9 pr-9 text-sm outline-none focus:border-gold sm:w-auto"
              >
                {hasQuery && <option value="relevance">Best match</option>}
                <option value="popular">Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="new">New Arrivals</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 text-ink-soft"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        {visibleFlowers.length ? (
          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4"
          >
            {visibleFlowers.map((flower) => (
              <ProductCard
                key={flower.id}
                flower={flower}
                onQuickView={setQuickView}
                onAdd={() => {}}
                onBuyNow={() => buyNow(flower)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white/60 px-6 text-center">
            <Flower2 size={45} strokeWidth={0.7} className="mb-5 text-gold" />
            <h2 className="font-display text-3xl">
              {hasQuery
                ? `No flowers matched “${state.query.trim()}”.`
                : "No flowers here yet."}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
              {hasQuery
                ? "Try a broader term like roses, mogra or lily, or browse the full catalogue."
                : "Try the full catalogue to see everything that is fresh right now."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/30"
                >
                  Clear search
                </button>
              )}
              <Link
                href="/flowers"
                className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
              >
                Browse all flowers
              </Link>
            </div>
          </div>
        )}

        {visibleFlowers.length > 0 && pageCount > 1 && (
          <div className="mt-14 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => update({ page: safePage - 1 })}
              className="rounded-full border border-ink/10 p-3 disabled:opacity-30"
            >
              <Minus size={15} />
            </button>
            <span className="text-sm text-ink-soft">
              Page {safePage} of {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage === pageCount}
              onClick={() => update({ page: safePage + 1 })}
              className="rounded-full border border-ink/10 p-3 disabled:opacity-30"
            >
              <Plus size={15} />
            </button>
          </div>
        )}
      </section>

      <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
