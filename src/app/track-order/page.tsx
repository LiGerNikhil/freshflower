import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/sections/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track your order | FreshFlower.zone",
  description:
    "Check the live delivery status of your FreshFlower.zone order — received, confirmed, preparing, ready, and out for delivery.",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <TrackOrderClient initialOrder={order ?? ""} />;
}