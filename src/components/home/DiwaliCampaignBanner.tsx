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
  const dateLabel = deliveryDates.slice(0, 4).map(formatShortDate).join(", ");
  const bulkWelcome = settings?.customRequirementsEnabled
    || settings?.productSettings.some((setting) => setting.bulkOrderEligible);

  return (
    <section
      aria-labelledby="diwali-campaign-title"
      className="relative isolate mx-auto my-7 max-w-7xl overflow-hidden rounded-2xl bg-ink px-5 py-7 text-ivory shadow-sm sm:mx-6 sm:px-8 md:my-10 md:px-12 md:py-9 lg:mx-auto"
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/75 to-ink/30" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-soft sm:text-xs">
            <Sparkles size={14} /> {settings?.announcement || campaign.badgeText || "Diwali special · Advance bookings open"}
          </p>
          <h2 id="diwali-campaign-title" className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
            {campaign.title || "Hosting a Diwali Party? We’ve Got Your Flowers Covered!"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/80 sm:text-base">
            {settings?.description || campaign.subtitle || "Beat the festive rush. Choose your flowers, share your requirements, and request your preferred delivery date."}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ivory/80 sm:text-sm">
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
        <div className="flex flex-wrap gap-3 md:max-w-[230px] md:flex-col">
          <Link
            href="/diwali#booking"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
          >
            {settings?.primaryCtaLabel || "Book Your Diwali Flowers"} <ArrowRight size={15} />
          </Link>
          <Link
            href="/diwali#products"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-ivory/35 px-4 py-2.5 text-sm font-semibold text-ivory transition hover:bg-ivory/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
          >
            {settings?.secondaryCtaLabel || "Explore Diwali Collection"}
          </Link>
        </div>
      </div>
    </section>
  );
}
