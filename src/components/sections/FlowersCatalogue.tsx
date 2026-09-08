"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Check,
  ChevronDown,
  Filter,
  Flower2,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ProductCard } from "@/components/sections/ProductCard";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categories, occasions } from "@/lib/data";
import {
  MAX_PRICE,
  type Availability,
  type CatalogState,
  type UnitValue,
} from "@/lib/catalog";
import type { Flower } from "@/lib/types";

const PAGE_SIZE = 8;
type SortValue = import("@/lib/catalog").SortValue;

interface FlowersCatalogueProps {
  flowers: Flower[];
  initialState: CatalogState;
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const availabilityOptions: {
  value: Availability;
  label: string;
  tone: "sage" | "gold" | "lavender" | "blush";
}[] = [
  { value: "today", label: "Available Today", tone: "sage" },
  { value: "limited", label: "Limited Stock", tone: "gold" },
  { value: "preorder", label: "Pre-order", tone: "lavender" },
  { value: "soldout", label: "Sold Out", tone: "blush" },
];
const unitOptions: { value: UnitValue; label: string }[] = [
  { value: "stems-6", label: "6 stems" },
  { value: "stems-10", label: "10 stems" },
  { value: "stems-12", label: "12 stems" },
  { value: "plant", label: "Plants" },
];

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function statusFor(flower: Flower): Availability {
  if (!flower.inStock) return "soldout";
  if (flower.featured) return "limited";
  if (flower.availableToday) return "today";
  return "preorder";
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-ink/10 py-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckOption({
  checked,
  label,
  onChange,
  badge,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-sm text-ink"
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-sm border ${checked ? "border-ink bg-ink text-ivory" : "border-ink/25"}`}
        >
          {checked && <Check size={11} />}
        </span>
        {label}
      </span>
      {badge}
    </button>
  );
}

function FilterControls({
  state,
  update,
  clear,
}: {
  state: CatalogState;
  update: (next: Partial<CatalogState>) => void;
  clear: () => void;
}) {
  return (
    <div>
      <FilterSection title="Flower type">
        <div className="space-y-1">
          {categories.map((category) => (
            <CheckOption
              key={category.id}
              label={category.name}
              checked={state.categoryIds.includes(category.id)}
              onChange={() =>
                update({
                  categoryIds: toggleValue(state.categoryIds, category.id),
                  page: 1,
                })
              }
            />
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Price range">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>₹{state.minPrice.toLocaleString("en-IN")}</span>
            <span>₹{state.maxPrice.toLocaleString("en-IN")}</span>
          </div>
          <input
            aria-label="Minimum price"
            type="range"
            min={0}
            max={MAX_PRICE}
            step={50}
            value={state.minPrice}
            onChange={(event) =>
              update({
                minPrice: Math.min(
                  Number(event.target.value),
                  state.maxPrice - 50,
                ),
                page: 1,
              })
            }
            className="w-full accent-ink"
          />
          <input
            aria-label="Maximum price"
            type="range"
            min={0}
            max={MAX_PRICE}
            step={50}
            value={state.maxPrice}
            onChange={(event) =>
              update({
                maxPrice: Math.max(
                  Number(event.target.value),
                  state.minPrice + 50,
                ),
                page: 1,
              })
            }
            className="w-full accent-gold"
          />
        </div>
      </FilterSection>
      <FilterSection title="Availability">
        <div className="space-y-1">
          {availabilityOptions.map((option) => (
            <CheckOption
              key={option.value}
              label={option.label}
              checked={state.availability.includes(option.value)}
              onChange={() =>
                update({
                  availability: toggleValue(state.availability, option.value),
                  page: 1,
                })
              }
              badge={
                <Badge tone={option.tone}>
                  {option.value === "today"
                    ? "Fresh"
                    : option.value === "soldout"
                      ? ""
                      : ""}
                </Badge>
              }
            />
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Occasion">
        <div className="space-y-1">
          {occasions.map((occasion) => (
            <CheckOption
              key={occasion.id}
              label={occasion.name}
              checked={state.occasionIds.includes(occasion.id)}
              onChange={() =>
                update({
                  occasionIds: toggleValue(state.occasionIds, occasion.id),
                  page: 1,
                })
              }
            />
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Quantity / unit">
        <div className="space-y-1">
          {unitOptions.map((option) => (
            <CheckOption
              key={option.value}
              label={option.label}
              checked={state.units.includes(option.value)}
              onChange={() =>
                update({
                  units: toggleValue(state.units, option.value),
                  page: 1,
                })
              }
            />
          ))}
        </div>
      </FilterSection>
      <button
        type="button"
        onClick={clear}
        className="mt-5 text-sm font-semibold text-ink underline underline-offset-4"
      >
        Clear all filters
      </button>
    </div>
  );
}

export default function FlowersCatalogue({
  flowers,
  initialState,
}: FlowersCatalogueProps) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Flower | null>(null);

  const update = (next: Partial<CatalogState>) => {
    const nextState = { ...state, ...next };
    setState(nextState);
    const params = new URLSearchParams();
    if (nextState.query) params.set("q", nextState.query);
    if (nextState.categoryIds.length)
      params.set("category", nextState.categoryIds.join(","));
    if (nextState.sort !== "popular") params.set("sort", nextState.sort);
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
      `/flowers${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const clear = () =>
    update({
      query: "",
      categoryIds: [],
      sort: "popular",
      availability: [],
      occasionIds: [],
      minPrice: 0,
      maxPrice: MAX_PRICE,
      units: [],
      page: 1,
    });
  const matchingFlowers = flowers
    .filter((flower) => {
      const queryMatch =
        !state.query ||
        flower.name.toLowerCase().includes(state.query.toLowerCase());
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
            ? !flower.stemCount
            : unit === "stems-6"
              ? flower.stemCount === 6
              : unit === "stems-10"
                ? flower.stemCount === 10
                : flower.stemCount === 12,
        );
      const availabilityMatch =
        !state.availability.length ||
        state.availability.includes(statusFor(flower));
      return (
        queryMatch &&
        categoryMatch &&
        occasionMatch &&
        unitMatch &&
        availabilityMatch &&
        flower.price >= state.minPrice &&
        flower.price <= state.maxPrice
      );
    })
    .sort((a, b) =>
      state.sort === "price-asc"
        ? a.price - b.price
        : state.sort === "price-desc"
          ? b.price - a.price
          : state.sort === "new"
            ? b.id.localeCompare(a.id)
            : b.rating - a.rating,
    );

  const pageCount = Math.max(1, Math.ceil(matchingFlowers.length / PAGE_SIZE));
  const safePage = Math.min(state.page, pageCount);
  const visibleFlowers = matchingFlowers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const buyNow = (flower: Flower) => {
    if (flower.inStock) {
      router.push("/checkout");
    }
  };

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
      <section className="sticky top-[68px] z-20 border-b border-ink/10 bg-ivory/90 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={state.query}
              onChange={(event) =>
                update({ query: event.target.value, page: 1 })
              }
              placeholder="Search roses, lilies, mogra..."
              className="w-full rounded-md border border-ink/10 bg-white/70 py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-gold"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-4 py-3 text-sm font-semibold md:hidden"
            >
              <Filter size={16} /> Filters
            </button>
            <label className="relative flex items-center">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 text-ink-soft"
              />
              <select
                value={state.sort}
                onChange={(event) =>
                  update({ sort: event.target.value as SortValue, page: 1 })
                }
                className="appearance-none rounded-md border border-ink/10 bg-white/70 py-3 pl-9 pr-9 text-sm outline-none focus:border-gold"
              >
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
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => update({ categoryIds: [], page: 1 })}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${!state.categoryIds.length ? "bg-ink text-ivory" : "bg-white/70 text-ink-soft"}`}
          >
            All flowers
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() =>
                update({
                  categoryIds: toggleValue(state.categoryIds, category.id),
                  page: 1,
                })
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${state.categoryIds.includes(category.id) ? "bg-ink text-ivory" : "bg-white/70 text-ink-soft"}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-2xl">Refine</h2>
                <Filter size={17} className="text-gold" />
              </div>
              <FilterControls state={state} update={update} clear={clear} />
            </div>
          </aside>
          <div>
            <div className="mb-7 flex items-center justify-between text-sm text-ink-soft">
              <span>{matchingFlowers.length} flowers</span>
              {state.categoryIds.length +
                state.availability.length +
                state.occasionIds.length +
                state.units.length >
                0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>
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
                <Flower2
                  size={45}
                  strokeWidth={0.7}
                  className="mb-5 text-gold"
                />
                <h2 className="font-display text-3xl">
                  Nothing matches those filters.
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
                  Try opening up your price range or exploring another flower
                  type.
                </p>
                <Button variant="secondary" className="mt-6" onClick={clear}>
                  Clear filters
                </Button>
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
          </div>
        </div>
      </section>
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-ivory p-6"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-2xl">Refine flowers</h2>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full p-2 hover:bg-ink/5"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterControls state={state} update={update} clear={clear} />
              <Button
                className="mt-7 w-full"
                onClick={() => setFiltersOpen(false)}
              >
                Show {matchingFlowers.length} flowers
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
