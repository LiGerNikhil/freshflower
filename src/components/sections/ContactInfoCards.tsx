"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { GOOGLE_MAPS_URL, telHref, waMeHref } from "@/lib/utils";

/**
 * Contact page info cards — phone, WhatsApp, email and business hours. All
 * values are read from SiteContentProvider (single source of truth managed in
 * /admin/settings), so an admin edit shows up here without touching code.
 */
export function ContactInfoCards() {
  const { settings } = useSiteContent();

  return (
    <>
      {/* Phone / WhatsApp */}
      <div className="rounded-lg bg-white/70 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
          Call or WhatsApp
        </p>
        <p className="mt-3 text-2xl font-semibold">{settings.phoneNumber}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={telHref(settings.phoneNumber)}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-ink-soft"
          >
            <Phone size={14} /> Call now
          </a>
          <a
            href={waMeHref(settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-sage px-4 py-2.5 text-xs font-semibold text-sage-ink transition hover:bg-sage/70"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>

      {/* Address / office */}
      <div className="rounded-lg bg-sage p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
          Address
        </p>
        <p className="mt-3 text-xl font-semibold leading-snug">
          {settings.addressLine || "Flower Market, Ghazipur Village, Ghazipur, New Delhi, Delhi 110096"}
        </p>
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          <MapPin size={14} /> Get directions
        </a>
      </div>

      {/* Email */}
      <div className="rounded-lg bg-blush p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
          Email
        </p>
        <p className="mt-3 text-2xl font-semibold">{settings.email}</p>
        <a
          href={`mailto:${settings.email}`}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          <Mail size={14} /> Send an email
        </a>
      </div>

      {/* Business hours */}
      <div className="rounded-lg bg-lavender p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
          Business hours
        </p>
        <div className="mt-4 space-y-2 text-sm text-ink-soft">
          {settings.businessHours.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-lavender-ink" />
              <span>
                <strong className="text-ink">{label}:</strong> {value}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="shrink-0 text-lavender-ink" />
            <span>WhatsApp available during all business hours</span>
          </div>
        </div>
      </div>
    </>
  );
}