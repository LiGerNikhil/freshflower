"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Flower2, MessageCircle, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/sections/ProductCard";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { PRODUCT_GRID } from "@/components/home/primitives";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { waMeHref } from "@/lib/utils";
import type { FestivalCollection, Flower } from "@/lib/types";

type CollectionSort = "featured" | "price-asc" | "price-desc" | "new";

interface FestivalCollectionClientProps {
  collection: FestivalCollection;
  flowers: Flower[];
  categories: { id: string; name: string }[];
}

function newestTime(flower: Flower): number {
  const stamped = flower.createdAt ?? flower.updatedAt;
  return stamped ? new Date(stamped).getTime() || 0 : 0;
}

export function FestivalCollectionClient({
  collection,
  flowers,
  categories,
}: FestivalCollectionClientProps) {
  const { settings } = useSiteContent();
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<CollectionSort>("featured");
  const [quickView, setQuickView] = useState<Flower | null>(null);

  const visibleFlowers = useMemo(() => {
    const filtered =
      categoryId === "all"
        ? flowers
        : flowers.filter((flower) => flower.categoryId === categoryId);
    const ordered = [...filtered];

    if (sort === "price-asc") ordered.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") ordered.sort((a, b) => b.price - a.price);
    else if (sort === "new")
      ordered.sort(
        (a, b) => newestTime(b) - newestTime(a) || b.id.localeCompare(a.id),
      );

    return ordered;
  }, [categoryId, flowers, sort]);

  const whatsappHref = `${waMeHref(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Hi FreshFlower.zone, I'd like help with the ${collection.title} collection. Could you assist with a bulk or pooja order?`,
  )}`;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
      <div className="mb-7 flex flex-col gap-5 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
            {collection.poojaCollection ? "Pooja edit" : "Curated collection"}
          </p>
          <p
            role="status"
            aria-live="polite"
            className="mt-1 text-sm text-ink-soft"
          >
            {visibleFlowers.length}{" "}
            {visibleFlowers.length === 1 ? "flower" : "flowers"}
          </p>
        </div>
        <label className="relative inline-flex items-center self-start sm:self-auto">
          <SlidersHorizontal
            size={15}
            className="pointer-events-none absolute left-3 text-ink-soft"
          />
          <span className="sr-only">Sort collection</span>
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as CollectionSort)
            }
            className="appearance-none rounded-md border border-ink/10 bg-white/70 py-3 pl-9 pr-9 text-sm outline-none focus:border-gold"
          >
            <option value="featured">Featured order</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="new">Newest</option>
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 text-ink-soft"
          />
        </label>
      </div>

      {categories.length > 0 && (
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            aria-pressed={categoryId === "all"}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              categoryId === "all"
                ? "bg-ink text-ivory"
                : "bg-white/70 text-ink-soft"
            }`}
          >
            All flowers
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              aria-pressed={categoryId === category.id}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                categoryId === category.id
                  ? "bg-ink text-ivory"
                  : "bg-white/70 text-ink-soft"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {visibleFlowers.length ? (
        <div className={PRODUCT_GRID}>
          {visibleFlowers.map((flower) => (
            <ProductCard
              key={flower.id}
              flower={flower}
              onQuickView={setQuickView}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl bg-white/60 px-6 text-center">
          <Flower2 size={45} strokeWidth={0.7} className="mb-5 text-gold" />
          <h2 className="font-display text-3xl">
            This edit is being restocked.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
            The collection is live, but none of its flowers are available right
            now. Talk to us for a custom arrangement or browse the full catalogue.
          </p>
        </div>
      )}

      {collection.whatsappBulkOrderEnabled && (
        <aside className="mt-14 flex flex-col gap-4 rounded-xl bg-sage/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory/80 text-sage-ink">
              <MessageCircle size={19} />
            </span>
            <div>
              <p className="font-display text-2xl text-ink">
                Planning a bigger celebration?
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                Ask us about bulk, gifting or pooja orders from this collection.
              </p>
            </div>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
          >
            <MessageCircle size={16} />
            Ask on WhatsApp
          </a>
        </aside>
      )}

      <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
}
