import type { Metadata } from "next";
import HomepageClient from "@/components/sections/HomepageClient";
import {
  categories,
  deliveryAreas,
  flowers,
  occasions,
  reviews,
} from "@/lib/data";
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

export default function HomePage() {
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
