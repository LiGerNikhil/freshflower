import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiwaliBookingClient } from "@/components/sections/DiwaliBookingClient";
import {
  getActiveDeliveryAreas,
  getBusinessSettings,
  getLiveFestivalCollectionBySlug,
  getPublishedFlowers,
} from "@/lib/db/repositories";
import type { Flower } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diwali flower pre-booking | FreshFlower.zone",
  description: "Choose fresh flowers and request your preferred Diwali delivery date across eligible Delhi NCR locations.",
  robots: { index: false, follow: true },
};

export default async function DiwaliBookingPage() {
  const campaign = await getLiveFestivalCollectionBySlug("diwali");
  if (!campaign?.advanceBooking) notFound();
  const [allFlowers, allAreas, settings] = await Promise.all([
    getPublishedFlowers(),
    getActiveDeliveryAreas(),
    getBusinessSettings(),
  ]);
  const productSettings = new Map(
    campaign.advanceBooking.productSettings.map((item) => [item.productId, item]),
  );
  const flowersById = new Map(allFlowers.map((flower) => [flower.id, flower]));
  const products = campaign.productIds
    .map((id) => flowersById.get(id))
    .filter((flower): flower is Flower => Boolean(flower))
    .filter((flower) => productSettings.get(flower.id)?.visible !== false)
    .filter((flower) => flower.inStock && flower.stockStatus !== "sold-out")
    .map((flower) => ({ ...flower, campaignSettings: productSettings.get(flower.id) }));
  const areaIds = campaign.advanceBooking.deliveryAreaIds;
  const areas = areaIds.length
    ? allAreas.filter((area) => areaIds.includes(area.id))
    : allAreas;

  return (
    <DiwaliBookingClient
      campaign={campaign}
      products={products}
      areas={areas}
      whatsappNumber={settings.whatsappNumber}
    />
  );
}
