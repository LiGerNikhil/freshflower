import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FestivalCollectionClient } from "@/components/sections/FestivalCollectionClient";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  getCategories,
  getLiveFestivalCollectionBySlug,
  getPublishedFlowers,
} from "@/lib/db/repositories";
import { resolveCollectionFlowers } from "@/lib/festivals";
import { buildBreadcrumb, canonical, openGraphImage } from "@/lib/seo";
import { GRADIENT_TOKENS } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

function collectionDescription(
  collection: NonNullable<
    Awaited<ReturnType<typeof getLiveFestivalCollectionBySlug>>
  >,
): string {
  return (
    collection.metaDescription?.trim() ||
    collection.subtitle?.trim() ||
    `Shop fresh flowers from the ${collection.title} collection, delivered across Delhi NCR.`
  );
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getLiveFestivalCollectionBySlug(slug);

  if (!collection) {
    return {
      title: { absolute: "Collection not found | FreshFlower.zone" },
      description: "Explore FreshFlower.zone flower collections.",
      robots: { index: false, follow: false },
    };
  }

  const title = collection.seoTitle?.trim() || collection.title;
  const absoluteTitle = /freshflower\.zone/i.test(title)
    ? title
    : `${title} | FreshFlower.zone`;
  const description = collectionDescription(collection);
  const url = canonical(`/collections/${collection.slug}`);

  return {
    title: { absolute: absoluteTitle },
    description,
    keywords: collection.keywords?.length
      ? collection.keywords.join(", ")
      : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: absoluteTitle,
      description,
      url,
      type: "website",
      images: collection.bannerImage
        ? [{ url: collection.bannerImage, alt: collection.title }]
        : openGraphImage(),
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getLiveFestivalCollectionBySlug(slug);
  if (!collection) notFound();
  // Advance-booking campaigns have a dedicated request flow, not a cart checkout.
  if (collection.advanceBooking) redirect("/diwali");

  const [flowers, categories] = await Promise.all([
    getPublishedFlowers(),
    getCategories(),
  ]);
  const collectionFlowers = resolveCollectionFlowers(flowers, collection);
  const categoryIds = new Set(
    collectionFlowers.map((flower) => flower.categoryId),
  );
  const categoryOptions = categories
    .filter((category) => categoryIds.has(category.id))
    .map((category) => ({ id: category.id, name: category.name }));

  const breadcrumb = buildBreadcrumb([
    { name: "Home", href: "/" },
    { name: "Collections", href: "/collections" },
    { name: collection.title, href: `/collections/${collection.slug}` },
  ]);
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collectionDescription(collection),
    url: canonical(`/collections/${collection.slug}`),
    primaryImageOfPage: collection.bannerImage
      ? { "@type": "ImageObject", url: collection.bannerImage }
      : undefined,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collectionFlowers.length,
      itemListElement: collectionFlowers.map((flower, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: flower.name,
        url: canonical(`/flowers/${flower.slug}`),
      })),
    },
  };

  return (
    <main className="bg-ivory text-ink">
      <JsonLd data={[breadcrumb, collectionLd]} />
      <section
        className="relative isolate flex min-h-[470px] items-end overflow-hidden bg-gold px-5 py-14 sm:min-h-[520px] sm:px-6 md:px-10 md:py-20"
        style={
          collection.bannerImage
            ? undefined
            : { background: GRADIENT_TOKENS["gradient-gold"] }
        }
      >
        {collection.bannerImage && (
          <Image
            src={collection.bannerImage}
            alt={collection.title}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/50 to-ink/15" />
        <div className="relative mx-auto w-full max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap items-center gap-2 text-xs font-semibold text-ivory/75"
          >
            <Link href="/" className="transition hover:text-ivory">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/collections" className="transition hover:text-ivory">
              Collections
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ivory">{collection.title}</span>
          </nav>

          {collection.badgeText && (
            <p className="mb-4 inline-flex rounded-full bg-ivory/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory backdrop-blur-sm">
              {collection.badgeText}
            </p>
          )}
          <h1 className="max-w-3xl font-display text-5xl leading-[0.98] text-ivory sm:text-6xl md:text-7xl">
            {collection.title}
          </h1>
          {collection.subtitle && (
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ivory/90 sm:text-base">
              {collection.subtitle}
            </p>
          )}
          {collection.lastOrderByText && (
            <p className="mt-5 inline-flex rounded-md bg-ivory/15 px-3 py-2 text-sm font-semibold text-ivory backdrop-blur-sm">
              Order before {collection.lastOrderByText}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-ivory/80">
            <span>
              {collectionFlowers.length}{" "}
              {collectionFlowers.length === 1 ? "flower" : "flowers"}
            </span>
            <Link
              href="/collections"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-ivory underline decoration-ivory/40 underline-offset-4 transition hover:decoration-ivory"
            >
              <ArrowLeft size={15} />
              All collections
            </Link>
          </div>
        </div>
      </section>

      <FestivalCollectionClient
        collection={collection}
        flowers={collectionFlowers}
        categories={categoryOptions}
      />
    </main>
  );
}
