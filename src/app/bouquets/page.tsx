import type { Metadata } from "next";
import { BouquetListing } from "@/components/sections/BouquetCard";
import { getBouquets } from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bouquets | FreshFlower.zone",
  description:
    "Premium hand-tied bouquets and custom floral arrangements delivered across Delhi NCR.",
  alternates: { canonical: canonical("/bouquets") },
  openGraph: {
    title: "Bouquets | FreshFlower.zone",
    description:
      "Premium hand-tied bouquets and custom floral arrangements delivered across Delhi NCR.",
    url: canonical("/bouquets"),
    type: "website",
  },
};
export const dynamic = "force-dynamic";

export default async function BouquetsPage() {
  const bouquets = await getBouquets();
  return <BouquetListing bouquets={bouquets} />;
}
