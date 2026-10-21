"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Flower2,
  Leaf,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import type {
  Category,
  FestivalCollection,
  HomepageHeroConfig,
} from "@/lib/types";

const CHIPS = [
  { label: "Cut fresh this morning", Icon: Leaf },
  { label: "Delhi NCR wide", Icon: MapPin },
  { label: "Porter same-day", Icon: Truck },
];

interface HeroProps {
  hero: HomepageHeroConfig;
  categories: Category[];
  collections: FestivalCollection[];
}

interface HeroTile {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
  badge?: string;
  meta: string;
}

function TileArt({ tile, priority }: { tile: HeroTile; priority?: boolean }) {
  if (isRemoteImage(tile.image)) {
    return (
      <Image
        src={tile.image as string}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 46vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background:
          GRADIENT_TOKENS[tile.image ?? ""] ?? GRADIENT_TOKENS["gradient-ivory"],
      }}
    />
  );
}

export function Hero({ hero, categories, collections }: HeroProps) {
  const collectionTiles: HeroTile[] = collections.slice(0, 3).map((collection) => ({
    key: collection.id,
    title: collection.title,
    subtitle: collection.subtitle,
    href: `/collections/${collection.slug}`,
    image: collection.bannerImage,
    badge: collection.badgeText,
    meta: `${collection.productIds.length} fresh picks`,
  }));
  const categoryTiles: HeroTile[] = categories.slice(0, 3).map((category) => ({
    key: category.id,
    title: category.name,
    subtitle: category.description,
    href: `/categories/${category.slug}`,
    image: category.imageUrl ?? category.heroImage,
    meta: "Shop the category",
  }));
  const tiles = collectionTiles.length ? collectionTiles : categoryTiles;
  const [lead, ...rest] = tiles;
  const collectionsHref = collectionTiles.length ? "/collections" : "/categories";

  return (
    <section className="relative overflow-hidden bg-ivory px-5 pb-16 pt-10 sm:px-6 md:px-10 md:pb-20 md:pt-14">
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-44 h-[34rem] w-[34rem] rounded-full bg-blush/75 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-48 top-10 h-[38rem] w-[38rem] rounded-full bg-sage/65 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gold/10 to-transparent"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sage-ink backdrop-blur-sm sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="max-w-4xl text-[2.65rem] leading-[0.94] text-ink min-[480px]:text-6xl sm:text-7xl lg:text-[4.75rem] xl:text-[5.25rem]">
            {hero.titleLines.map((line, lineIndex) => (
              <span key={`${line}-${lineIndex}`}>
                {lineIndex === hero.accentLineIndex ? (
                  <em className="text-gold">{line}</em>
                ) : (
                  line
                )}
                {lineIndex < hero.titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-ink-soft sm:text-base">
            {hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={hero.ctaPrimaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-ink-soft active:scale-[0.99]"
            >
              {hero.ctaPrimaryLabel} <ArrowRight size={16} />
            </Link>
            <Link
              href={hero.ctaSecondaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white/65 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur-sm transition hover:bg-white active:scale-[0.99]"
            >
              {hero.ctaSecondaryLabel}
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/65 px-3 py-1.5 text-[0.7rem] font-semibold text-ink-soft backdrop-blur-sm sm:text-xs"
              >
                <Icon size={13} className="shrink-0 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {lead ? (
          <div className="relative">
            <div className="rounded-[2rem] border border-white/75 bg-white/50 p-3 shadow-[0_24px_80px_-42px_rgba(44,38,28,0.55)] backdrop-blur-md sm:p-4">
              <div className="flex items-end justify-between gap-4 px-1 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                    Shop by collection
                  </p>
                  <p className="mt-1 font-display text-xl text-ink sm:text-2xl">
                    Find your flowers faster
                  </p>
                </div>
                <Link
                  href={collectionsHref}
                  className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-ink-soft transition hover:text-ink sm:inline-flex"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <Link
                href={lead.href}
                className="group relative isolate flex min-h-[210px] flex-col justify-end overflow-hidden rounded-[1.4rem] p-5 sm:min-h-[255px] sm:p-6"
              >
                <TileArt tile={lead} priority />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/5" />
                <div className="relative max-w-sm text-ivory">
                  {lead.badge && (
                    <span className="mb-3 inline-flex rounded-full bg-ivory/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
                      {lead.badge}
                    </span>
                  )}
                  <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                    {lead.title}
                  </h2>
                  {lead.subtitle && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-ivory/80 sm:text-sm">
                      {lead.subtitle}
                    </p>
                  )}
                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold">
                    {lead.meta}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </p>
                </div>
              </Link>

              {rest.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {rest.map((tile) => (
                    <Link
                      key={tile.key}
                      href={tile.href}
                      className="group relative isolate flex min-h-[150px] flex-col justify-end overflow-hidden rounded-[1.15rem] p-4 sm:min-h-[175px]"
                    >
                      <TileArt tile={tile} />
                      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                      <div className="relative text-ivory">
                        <h3 className="font-display text-lg leading-tight sm:text-xl">
                          {tile.title}
                        </h3>
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-ivory/75 sm:text-xs">
                          {tile.meta}
                          <ArrowRight
                            size={12}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 px-1 pt-3 text-[10px] font-semibold text-ink-soft sm:hidden">
                <ShieldCheck size={13} className="text-gold" />
                Hand-checked before every dispatch
              </div>
            </div>
            <span className="absolute -right-5 -top-5 hidden h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-ivory/85 text-gold shadow-sm backdrop-blur sm:flex">
              <Flower2 size={34} strokeWidth={0.8} aria-hidden="true" />
            </span>
          </div>
        ) : (
          <div className="relative hidden min-h-[420px] items-center justify-center overflow-hidden rounded-[2rem] bg-blush/60 lg:flex">
            <Flower2 size={220} strokeWidth={0.4} className="text-ink/20" />
          </div>
        )}
      </div>
    </section>
  );
}
