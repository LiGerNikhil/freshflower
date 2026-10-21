import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  getLiveFestivalCollections,
  getPublishedFlowers,
} from "@/lib/db/repositories";
import { resolveCollectionFlowers } from "@/lib/festivals";
import { buildBreadcrumb, canonical, openGraphImage } from "@/lib/seo";
import { GRADIENT_TOKENS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Flower collections | FreshFlower.zone" },
  description:
    "Shop fresh garlands and malas, loose flowers by weight and exotic cut flowers with same-day delivery across Delhi NCR.",
  alternates: { canonical: canonical("/collections") },
  openGraph: {
    title: "Flower collections | FreshFlower.zone",
    description:
      "Fresh garlands and malas, loose flowers by weight and exotic cut flowers delivered across Delhi NCR.",
    url: canonical("/collections"),
    type: "website",
    images: openGraphImage(),
  },
};

export default async function CollectionsPage() {
  const [collections, flowers] = await Promise.all([
    getLiveFestivalCollections(),
    getPublishedFlowers(),
  ]);

  const breadcrumb = buildBreadcrumb([
    { name: "Home", href: "/" },
    { name: "Collections", href: "/collections" },
  ]);
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Flower collections",
    description:
      "Fresh garlands and malas, loose flowers by weight and exotic cut flowers delivered across Delhi NCR.",
    url: canonical("/collections"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collections.length,
      itemListElement: collections.map((collection, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: collection.title,
        url: canonical(`/collections/${collection.slug}`),
      })),
    },
  };

  return (
    <main className="bg-ivory text-ink">
      <JsonLd data={[breadcrumb, collectionLd]} />
      <section className="bg-ivory-deep px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            Curated collections
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.02] md:text-7xl">
            The way you shop flowers.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft">
            Garlands and malas, loose flowers by weight and premium exotic
            stems — grouped so you can find the right flowers faster. Every
            collection is managed by our team and delivered fresh across Delhi
            NCR.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        {collections.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {collections.map((collection, index) => {
              const count = resolveCollectionFlowers(
                flowers,
                collection,
              ).length;

              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative isolate flex min-h-[360px] items-end overflow-hidden rounded-xl bg-gold px-6 py-7 sm:min-h-[420px] sm:px-8 sm:py-9"
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
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/5" />
                  <div className="max-w-xl text-ivory">
                    {collection.badgeText && (
                      <p className="mb-3 inline-flex rounded-full bg-ivory/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
                        {collection.badgeText}
                      </p>
                    )}
                    <h2 className="font-display text-4xl leading-tight sm:text-5xl">
                      {collection.title}
                    </h2>
                    {collection.subtitle && (
                      <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-ivory/85">
                        {collection.subtitle}
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                      <span>
                        {count} {count === 1 ? "flower" : "flowers"}
                      </span>
                      {collection.lastOrderByText && (
                        <span className="text-ivory/75">
                          Order before {collection.lastOrderByText}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        Shop the collection
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white/60 px-6 text-center">
            <Flower2 size={46} strokeWidth={0.7} className="mb-5 text-gold" />
            <h2 className="font-display text-3xl">
              Collections are being curated.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
              New collections appear here as soon as they are published. In the
              meantime, browse the full flower catalogue.
            </p>
            <Link
              href="/flowers"
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
            >
              Browse all flowers <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
