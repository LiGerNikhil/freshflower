"use client";

import { ProductCard } from "@/components/sections/ProductCard";
import { HorizontalCarousel } from "@/components/home/HorizontalCarousel";
import { Reveal, Section, SectionIntro } from "@/components/home/primitives";
import type { Flower } from "@/lib/types";

interface ProductCarouselProps {
  eyebrow: string;
  title: string;
  copy?: string;
  href?: string;
  linkLabel?: string;
  flowers: Flower[];
  onQuickView: (flower: Flower) => void;
  className?: string;
}

export function ProductCarousel({
  eyebrow,
  title,
  copy,
  href,
  linkLabel,
  flowers,
  onQuickView,
  className = "",
}: ProductCarouselProps) {
  if (!flowers.length) return null;

  return (
    <Section className={className}>
      <Reveal>
        <SectionIntro
          eyebrow={eyebrow}
          title={title}
          copy={copy}
          href={href}
          linkLabel={linkLabel}
        />
      </Reveal>
      <HorizontalCarousel
        label={title}
        itemClassName="w-[min(72vw,18rem)] sm:w-[min(42vw,18rem)] lg:w-[calc((100%_-_3rem)_/_4)]"
      >
        {flowers.map((flower) => (
          <ProductCard
            key={flower.id}
            flower={flower}
            onQuickView={onQuickView}
            imageSizes="(max-width: 400px) 72vw, (max-width: 639px) 18rem, (max-width: 685px) 42vw, (max-width: 1023px) 18rem, 25vw"
          />
        ))}
      </HorizontalCarousel>
    </Section>
  );
}

export function ProductCarouselSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="px-5 py-20 sm:px-6 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 h-10 w-72 animate-pulse rounded bg-ink/10" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="aspect-[4/5] w-[min(72vw,18rem)] shrink-0 animate-pulse rounded-lg bg-ink/10 sm:w-64"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
