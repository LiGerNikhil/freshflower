import type { Metadata } from "next";
import HomepageClient from "@/components/sections/HomepageClient";
import {
  getCategories,
  getDeliveryAreas,
  getFlowers,
  getOccasions,
  getReviews,
} from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FreshFlower.zone — Fresh flower delivery in Delhi NCR",
  description:
    "Fresh flowers delivered in Delhi, Gurgaon, Noida and across Delhi NCR. Same-day and early-morning delivery, hand-tied bouquets, birthday flowers, and wedding florals.",
  alternates: { canonical: canonical("/") },
  openGraph: {
    title: "FreshFlower.zone — Fresh flower delivery in Delhi NCR",
    description:
      "Fresh flowers delivered in Delhi, Gurgaon, Noida and across Delhi NCR. Same-day and early-morning delivery, hand-tied bouquets, birthday flowers, and wedding florals.",
    url: canonical("/"),
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, flowers, occasions, deliveryAreas, reviews] = await Promise.all([
    getCategories(),
    getFlowers(),
    getOccasions(),
    getDeliveryAreas(),
    getReviews(),
  ]);
  return (
    <HomepageClient
      categories={categories}
      flowers={flowers}
      occasions={occasions}
      deliveryAreas={deliveryAreas}
      reviews={reviews}
    />
  );
}