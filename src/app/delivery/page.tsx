import type { Metadata } from "next";
import { DeliveryPage } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Delivery information | FreshFlower.zone",
  description:
    "Delhi NCR flower delivery areas, morning timings, Porter policy, delivery charges, same-day rules, and order cutoff times.",
  alternates: { canonical: canonical("/delivery") },
  openGraph: {
    title: "Delivery information | FreshFlower.zone",
    description:
      "Delhi NCR flower delivery areas, morning timings, Porter policy, delivery charges, same-day rules, and order cutoff times.",
    url: canonical("/delivery"),
    type: "website",
  },
};

export default function DeliveryRoute() {
  return <DeliveryPage />;
}
