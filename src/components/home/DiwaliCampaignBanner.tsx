import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { FestivalCollection } from "@/lib/types";
import { GRADIENT_TOKENS } from "@/lib/utils";

function formatShortDate(value: string): string {
  const date = new Date(`${value}T12:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function DiwaliCampaignBanner({
  campaign,
}: {
  campaign: FestivalCollection;
}) {
  const settings = campaign.advanceBooking;
  const deliveryDates = settings?.deliveryDates ?? [];
  const sortedDeliveryDates = [...deliveryDates].sort();
  const isConsecutiveDateRange = sortedDeliveryDates.length > 2
    && sortedDeliveryDates.every((date, index) =>
      index === 0
      || Date.parse(`${date}T12:00:00Z`) - Date.parse(`${sortedDeliveryDates[index - 1]}T12:00:00Z`) === 86_400_000,
    );
  const dateLabel = isConsecutiveDateRange
    ? `${formatShortDate(sortedDeliveryDates[0])} – ${formatShortDate(sortedDeliveryDates[sortedDeliveryDates.length - 1])}`
    : deliveryDates.map(formatShortDate).join(", ");
  const bulkWelcome = settings?.customRequirementsEnabled
    || settings?.productSettings.some((setting) => setting.bulkOrderEligible);

  return (
    <section
      aria-labelledby="diwali-campaign-title"
      className="relative isolate mx-auto my-5 max-w-7xl overflow-hidden rounded-2xl bg-ink px-4 py-5 text-ivory shadow-sm sm:mx-6 sm:my-7 sm:px-8 sm:py-7 md:my-10 md:px-12 md:py-9 lg:mx-auto"
      style={!campaign.bannerImage ? { background: GRADIENT_TOKENS["gradient-sage"] } : undefined}
    >
      {campaign.bannerImage && (
        <Image
          src={campaign.bannerImage}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="-z-20 object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/90 via-ink/85 to-ink/70 sm:bg-gradient-to-r sm:from-ink/90 sm:via-ink/75 sm:to-ink/30" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-soft sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
            <Sparkles size={14} /> {settings?.announcement || campaign.badgeText || "Diwali special · Advance bookings open"}
          </p>
          <h2 id="diwali-campaign-title" className="font-display text-2xl leading-tight sm:text-4xl md:text-5xl">
            {campaign.title || "Hosting a Diwali Party? We’ve Got Your Flowers Covered!"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-ivory/85 sm:mt-3 sm:text-base sm:leading-6">
            {settings?.description || campaign.subtitle || "Beat the festive rush. Choose your flowers, share your requirements, and request your preferred delivery date."}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] leading-5 text-ivory/85 sm:mt-4 sm:gap-x-5 sm:gap-y-2 sm:text-sm">
            <li>Farm-fresh premium blooms</li>
            <li>
              {settings?.earlyMorningDelivery
                ? "Early-morning delivery across eligible NCR areas"
                : "Delivery across eligible Delhi NCR areas"}
            </li>
            {dateLabel && <li>Advance bookings for {dateLabel}</li>}
            {bulkWelcome && <li>Bulk requirements welcome</li>}
          </ul>
          {campaign.lastOrderByText && (
            <p className="mt-3 text-xs font-medium text-gold-soft">{campaign.lastOrderByText}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 md:max-w-[230px] md:flex-col">
          <Link
            href="/diwali#products"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory sm:w-auto md:w-full"
          >
            {settings?.primaryCtaLabel || "Book Your Diwali Flowers"} <ArrowRight size={15} />
          </Link>
          <Link
            href="/diwali#products"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-ivory/45 px-4 py-2.5 text-sm font-semibold text-ivory transition hover:bg-ivory/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory sm:w-auto md:w-full"
          >
            {settings?.secondaryCtaLabel || "Explore Diwali Collection"}
          </Link>
        </div>
      </div>
    </section>
  );
}
