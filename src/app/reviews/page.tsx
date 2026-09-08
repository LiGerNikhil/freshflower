import type { Metadata } from "next";
import { ReviewsClient } from "@/components/sections/ReviewsClient";
import { flowers, reviews } from "@/lib/data";
import { canonical } from "@/lib/seo";
export const metadata: Metadata = {
  title: "Customer reviews | FreshFlower.zone",
  description:
    "Read verified customer reviews about FreshFlower.zone flowers and delivery.",
  alternates: { canonical: canonical("/reviews") },
  openGraph: {
    title: "Customer reviews | FreshFlower.zone",
    description:
      "Read verified customer reviews about FreshFlower.zone flowers and delivery.",
    url: canonical("/reviews"),
    type: "website",
  },
};
export default function ReviewsPage() {
  return <ReviewsClient reviews={reviews} flowers={flowers} />;
}
