import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { CategoryQuickNav } from "@/components/home/CategoryQuickNav";
import { CollectionBento } from "@/components/home/CollectionBento";
import { HeroProductRail } from "@/components/home/HeroProductRail";
import type {
  Category,
  FestivalCollection,
  Flower,
  HomepageHeroConfig,
} from "@/lib/types";

const TRUST_ITEMS = [
  { label: "Delhi NCR delivery", Icon: MapPin },
  { label: "Secure checkout", Icon: ShieldCheck },
  { label: "Hand-checked blooms", Icon: BadgeCheck },
];

interface StorefrontHeroProps {
  hero: HomepageHeroConfig;
  announcement?: string;
  categories: Category[];
  collections: FestivalCollection[];
  products: Flower[];
  onQuickView: (flower: Flower) => void;
}

export function StorefrontHero({
  hero,
  announcement,
  categories,
  collections,
  products,
  onQuickView,
}: StorefrontHeroProps) {
  const announcementText = announcement?.trim();
  const primaryHref =
    !hero.ctaPrimaryHref || hero.ctaPrimaryHref === "#shop"
      ? "/flowers"
      : hero.ctaPrimaryHref;
  const secondaryHref =
    !hero.ctaSecondaryHref || hero.ctaSecondaryHref === "/checkout"
      ? "/collections"
      : hero.ctaSecondaryHref;
  const secondaryLabel =
    hero.ctaSecondaryLabel === "Book a Delivery"
      ? "Collections"
      : hero.ctaSecondaryLabel;
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
          className="pointer-events-none absolute -left-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-blush/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-sage/55 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-9 pt-5 sm:px-6 sm:pt-7 md:px-10 lg:pb-12 lg:pt-9">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
            <div className="order-1 min-w-0 lg:py-2">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-gold"
                  aria-hidden="true"
                />
                {hero.eyebrow}
              </p>

              <h1 className="mt-3 max-w-xl font-display text-[1.75rem] leading-[1.02] text-ink min-[390px]:text-[1.9rem] sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
                {hero.titleLines.map((line, index) => (
                  <span key={`${line}-${index}`} className="block">
                    {index === hero.accentLineIndex ? (
                      <em className="text-gold">{line}</em>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>

              <p className="mt-3 line-clamp-2 max-w-md text-sm leading-6 text-ink-soft sm:mt-4">
                {hero.subtitle}
              </p>

              <div className="mt-5 grid max-w-md grid-cols-2 gap-2.5 sm:gap-3">
                <Link
                  href={primaryHref}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-ink px-3 py-2.5 text-xs font-semibold text-ivory transition hover:bg-ink-soft active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-12 sm:px-5 sm:text-sm"
                >
                  {hero.ctaPrimaryLabel || "Shop Flowers"}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link
                  href={secondaryHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white/75 px-3 py-2.5 text-xs font-semibold text-ink transition hover:bg-white active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-12 sm:px-5 sm:text-sm"
                >
                  {secondaryLabel || "Collections"}
                </Link>
              </div>

              <ul
                aria-label="Shopping assurances"
                className="mt-4 flex max-w-md gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {TRUST_ITEMS.map(({ label, Icon }) => (
                  <li
                    key={label}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink-soft"
                  >
                    <Icon
                      size={14}
                      className="shrink-0 text-gold"
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-2 min-w-0 lg:order-3 lg:col-span-2">
              <CategoryQuickNav categories={categories} />
            </div>

            {hasCollections && (
              <div className="order-3 min-w-0 lg:order-2">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
                      Curated edits
                    </p>
                    <h2 className="mt-1 font-display text-xl leading-tight text-ink sm:text-2xl">
                      Shop by collection
                    </h2>
                  </div>
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
          </div>

          <HeroProductRail flowers={products} onQuickView={onQuickView} />
        </div>
      </div>
    </section>
  );
}
