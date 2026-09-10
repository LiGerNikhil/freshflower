import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BouquetDetailClient from "@/components/sections/BouquetDetailClient";
import { JsonLd } from "@/components/ui/JsonLd";
import { getBouquets, getBouquetBySlug, getFlowers } from "@/lib/db/repositories";
import { buildBreadcrumb, canonical, openGraphImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface BouquetPageProps {
  params: Promise<{ slug: string }>;
}
export async function generateStaticParams() {
  const bouquets = await getBouquets();
  return bouquets.map((bouquet) => ({ slug: bouquet.slug }));
}
export async function generateMetadata({
  params,
}: BouquetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const bouquet = await getBouquetBySlug(slug);
  const url = bouquet
    ? canonical(`/bouquets/${slug}`)
    : undefined;
  return {
    title: bouquet
      ? `${bouquet.name} | FreshFlower.zone`
      : "Bouquet not found | FreshFlower.zone",
    description:
      bouquet?.description ?? "Premium bouquets delivered across Delhi NCR.",
    alternates: url ? { canonical: url } : undefined,
    openGraph: url && bouquet
      ? {
          title: `${bouquet.name} | FreshFlower.zone`,
          description: bouquet.description,
          url,
          type: "website",
          images: openGraphImage(),
        }
      : undefined,
  };
}
export default async function BouquetPage({ params }: BouquetPageProps) {
  const { slug } = await params;
  const bouquet = await getBouquetBySlug(slug);
  if (!bouquet) notFound();
  const bouquets = await getBouquets();
  const flowers = await getFlowers();

  const breadcrumb = buildBreadcrumb([
    { name: "Home", href: "/" },
    { name: "Bouquets", href: "/bouquets" },
    { name: bouquet.name, href: `/bouquets/${bouquet.slug}` },
  ]);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bouquet.name,
    description: bouquet.description,
    image: openGraphImage()[0].url,
    sku: bouquet.id,
    brand: { "@type": "Brand", name: "FreshFlower.zone" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: bouquet.price,
      availability: "https://schema.org/InStock",
      url: canonical(`/bouquets/${bouquet.slug}`),
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <JsonLd data={[productLd, breadcrumb]} />
      <BouquetDetailClient
        bouquet={bouquet}
        flowers={flowers}
        relatedBouquets={bouquets.filter((item) => item.id !== bouquet.id)}
      />
    </>
  );
}
