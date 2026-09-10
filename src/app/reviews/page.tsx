import type { Metadata } from "next";
import { ReviewsClient } from "@/components/sections/ReviewsClient";
import { getFlowers, getReviews } from "@/lib/db/repositories";
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

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const flowers = await getFlowers();
  const approvedReviews = reviews.filter(
    (review) => review.status === "approved" || review.status === "featured",
  );
  return <ReviewsClient reviews={approvedReviews} flowers={flowers} />;
}
