import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FlowerDetailClient from "@/components/sections/FlowerDetailClient";
import { JsonLd } from "@/components/ui/JsonLd";
import { getCategories, getFlowerBySlug, getFlowers, getReviews } from "@/lib/db/repositories";
import { buildBreadcrumb, canonical, openGraphImage } from "@/lib/seo";

interface FlowerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const flowers = await getFlowers();
  return flowers.map((flower) => ({ slug: flower.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: FlowerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const flower = await getFlowerBySlug(slug);
  if (!flower) return { title: "Flower not found | FreshFlower.zone" };

  const url = canonical(`/flowers/${flower.slug}`);
  const description = `${flower.shortDescription} Shop fresh ${flower.name.toLowerCase()} with morning delivery across Delhi NCR.`;

  return {
    title: `${flower.name} | FreshFlower.zone`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${flower.name} | FreshFlower.zone`,
      description,
      url,
      type: "website",
      images: openGraphImage(),
    },
  };
}

export default async function FlowerPage({ params }: FlowerPageProps) {
  const { slug } = await params;
  const flowers = await getFlowers();
  const flower = await getFlowerBySlug(slug);
  if (!flower) notFound();

  const categories = await getCategories();
  const category = categories.find((item) => item.id === flower.categoryId);
  const relatedFlowers = flowers
    .filter(
      (item) => item.categoryId === flower.categoryId && item.id !== flower.id,
    )
    .slice(0, 4);
  const similarFlowers = flowers
    .filter(
      (item) =>
        item.id !== flower.id &&
        item.categoryId !== flower.categoryId &&
        item.occasionIds.some((occasionId) =>
          flower.occasionIds.includes(occasionId),
        ),
    )
    .slice(0, 4);
  const reviews = await getReviews();
  const productReviews = reviews
    .filter((review) => review.productId === flower.id)
    .filter(
      (review) => review.status === "approved" || review.status === "featured",
    );

  const breadcrumb = buildBreadcrumb([
    { name: "Home", href: "/" },
    { name: "Flowers", href: "/flowers" },
    { name: flower.name, href: `/flowers/${flower.slug}` },
  ]);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: flower.name,
    description: flower.description,
    image: openGraphImage()[0].url,
    sku: flower.id,
    brand: { "@type": "Brand", name: "FreshFlower.zone" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: flower.price,
      availability: flower.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: canonical(`/flowers/${flower.slug}`),
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <JsonLd data={[productLd, breadcrumb]} />
      <FlowerDetailClient
        flower={flower}
        categoryName={category?.name ?? "Flowers"}
        relatedFlowers={relatedFlowers}
        similarFlowers={similarFlowers}
        reviews={productReviews}
      />
    </>
  );
}
