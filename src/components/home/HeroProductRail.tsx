"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HorizontalCarousel } from "@/components/home/HorizontalCarousel";
import { ProductCard } from "@/components/sections/ProductCard";
import type { Flower } from "@/lib/types";

interface HeroProductRailProps {
  flowers: Flower[];
  onQuickView: (flower: Flower) => void;
}

export function HeroProductRail({
  flowers,
  onQuickView,
}: HeroProductRailProps) {
  if (!flowers.length) return null;

  return (
    <section
      aria-labelledby="hero-best-sellers"
      className="mt-9 border-t border-ink/10 pt-7 lg:mt-12 lg:pt-8"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
            Most loved
          </p>
          <h2
            id="hero-best-sellers"
            className="mt-1 font-display text-2xl leading-tight text-ink sm:text-3xl"
          >
            Best sellers
          </h2>
        </div>
        <Link
          href="/flowers"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-semibold text-ink transition hover:text-gold sm:text-sm"
        >
          View all
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <HorizontalCarousel
        label="Best sellers"
        controlsClassName="-top-12"
        itemClassName="w-[min(64vw,16rem)] sm:w-[min(38vw,17rem)] lg:w-[calc((100%_-_3rem)_/_4)]"
      >
        {flowers.slice(0, 8).map((flower) => (
          <ProductCard
            key={flower.id}
            flower={flower}
            onQuickView={onQuickView}
            imageSizes="(max-width: 400px) 64vw, (max-width: 639px) 16rem, (max-width: 767px) 38vw, (max-width: 1023px) 17rem, 25vw"
          />
        ))}
      </HorizontalCarousel>
    </section>
  );
}
