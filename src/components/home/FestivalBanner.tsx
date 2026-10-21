import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HorizontalCarousel } from "@/components/home/HorizontalCarousel";
import { Section } from "@/components/home/primitives";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { FestivalCollection } from "@/lib/types";

export function FestivalBanner({
  collections,
  showCutoff,
}: {
  collections: FestivalCollection[];
  showCutoff: boolean;
}) {
  if (!collections.length) return null;

  return (
    <Section className="pb-8 md:pb-12">
      <HorizontalCarousel
        label="Collections"
        itemClassName="w-full"
        className="gap-4"
      >
        {collections.map((collection, index) => (
          <article
            key={collection.id}
            className="relative isolate flex min-h-[310px] w-full items-end overflow-hidden rounded-xl bg-gold px-6 py-8 sm:min-h-[360px] sm:px-10 md:min-h-[420px] md:items-center md:px-14"
            style={
              collection.bannerImage
                ? undefined
                : { background: GRADIENT_TOKENS["gradient-gold"] }
            }
          >
            {collection.bannerImage && (
              <Image
                src={collection.bannerImage}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 88vw"
                className="-z-20 object-cover"
              />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/75 via-ink/40 to-ink/10" />
            <div className="max-w-2xl text-ivory">
              {collection.badgeText && (
                <p className="mb-4 inline-flex rounded-full bg-ivory/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
                  {collection.badgeText}
                </p>
              )}
              <h2 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
                {collection.title}
              </h2>
              {collection.subtitle && (
                <p className="mt-4 max-w-xl text-sm leading-6 text-ivory/90 sm:text-base sm:leading-7">
                  {collection.subtitle}
                </p>
              )}
              {showCutoff && collection.lastOrderByText && (
                <p className="mt-4 text-sm font-semibold text-ivory">
                  Order before {collection.lastOrderByText}
                </p>
              )}
              <Link
                href={`/collections/${collection.slug}`}
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-ivory px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
              >
                Shop the collection <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </HorizontalCarousel>
    </Section>
  );
}

export function FestivalBannerSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="px-5 pb-8 pt-20 sm:px-6 md:px-10 md:pb-12"
    >
      <div className="mx-auto h-[310px] max-w-7xl animate-pulse rounded-xl bg-gold/40 sm:h-[360px] md:h-[420px]" />
    </section>
  );
}
