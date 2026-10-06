"use client";

import { ProductCard } from "@/components/sections/ProductCard";
import {
  ProductGrid,
  Reveal,
  Section,
  SectionIntro,
} from "@/components/home/primitives";
import type { Flower } from "@/lib/types";

interface ProductRailProps {
  eyebrow: string;
  title: string;
  copy?: string;
  href?: string;
  linkLabel?: string;
  flowers: Flower[];
  onQuickView: (flower: Flower) => void;
  className?: string;
}

/** Heading + grid of product cards. Renders nothing when there is no stock to show. */
export function ProductRail({
  eyebrow,
  title,
  copy,
  href,
  linkLabel,
  flowers,
  onQuickView,
  className = "",
}: ProductRailProps) {
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
      <ProductGrid>
        {flowers.map((flower) => (
          <ProductCard
            key={flower.id}
            flower={flower}
            onQuickView={onQuickView}
          />
        ))}
      </ProductGrid>
    </Section>
  );
}
