import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryQuickNav } from "@/components/home/CategoryQuickNav";
import { CollectionBento } from "@/components/home/CollectionBento";
import { HeroProductRail } from "@/components/home/HeroProductRail";
import type { Category, FestivalCollection, Flower } from "@/lib/types";

interface StorefrontHeroProps {
  announcement?: string;
  categories: Category[];
  collections: FestivalCollection[];
  products: Flower[];
  onQuickView: (flower: Flower) => void;
}

export function StorefrontHero({
  announcement,
  categories,
  collections,
  products,
  onQuickView,
}: StorefrontHeroProps) {
  const announcementText = announcement?.trim();
  const hasCollections = collections.length > 0;

  return (
    <section className="relative bg-ivory">
      {announcementText && (
        <div className="border-b border-ink/10 bg-ink text-ivory">
          <p className="mx-auto max-w-7xl truncate px-5 py-2 text-center text-xs font-medium tracking-[0.01em] sm:text-sm">
            {announcementText}
          </p>
        </div>
      )}

      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-blush/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-sage/45 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-9 pt-6 sm:px-6 sm:pt-8 md:px-10 lg:pb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
                FreshFlower.zone
              </p>
              <h1 className="mt-1 font-display text-[1.65rem] leading-tight text-ink sm:text-3xl lg:text-4xl">
                Shop by category
              </h1>
            </div>
            <Link
              href="/categories"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-semibold text-ink transition hover:text-gold sm:text-sm"
            >
              All categories
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <CategoryQuickNav
            categories={categories}
            variant="grid"
            className="mt-5"
          />

          {hasCollections && (
            <div className="mt-8 border-t border-ink/10 pt-7 lg:mt-10 lg:pt-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl">
                  Collections
                </h2>
                <Link
                  href="/collections"
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-semibold text-ink transition hover:text-gold sm:text-sm"
                >
                  View all
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <CollectionBento collections={collections} />
            </div>
          )}

          <HeroProductRail flowers={products} onQuickView={onQuickView} />
        </div>
      </div>
    </section>
  );
}
