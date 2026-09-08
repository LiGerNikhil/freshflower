import type { Metadata } from "next";
import { BouquetListing } from "@/components/sections/BouquetCard";
import { bouquets } from "@/lib/data";
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
export default function BouquetsPage() {
  return <BouquetListing bouquets={bouquets} />;
}
