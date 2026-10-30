import type { Metadata } from "next";
import { BouquetListing } from "@/components/sections/BouquetCard";
import {
  getActiveFlowers,
  getBouquets,
  getOccasions,
} from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface BouquetsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: BouquetsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const title = query ? `Bouquet results for “${query}”` : "Bouquets";
  const description = query
    ? `Hand-tied bouquets matching “${query}” with delivery across Delhi NCR.`
    : "Premium hand-tied bouquets and custom floral arrangements delivered across Delhi NCR.";

  return {
    title,
    description,
    alternates: { canonical: canonical("/bouquets") },
    robots: query ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${title} | FreshFlower.zone`,
      description,
      url: canonical("/bouquets"),
      type: "website",
    },
  };
}

export default async function BouquetsPage({
  searchParams,
}: BouquetsPageProps) {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const [bouquets, flowers, occasions] = await Promise.all([
    getBouquets(),
    getActiveFlowers(),
    getOccasions(),
  ]);
  return (
    <BouquetListing
      bouquets={bouquets}
      query={query}
      flowers={flowers}
      occasions={occasions}
    />
  );
}
