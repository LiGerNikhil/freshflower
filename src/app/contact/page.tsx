import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/ContactForm";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { deliveryAreas } from "@/lib/data";
import { canonical } from "@/lib/seo";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact FreshFlower.zone",
  description:
    "Contact FreshFlower.zone by phone, WhatsApp, or email for flower delivery, custom orders, wholesale enquiries, and wedding consultations.",
  alternates: { canonical: canonical("/contact") },
  openGraph: {
    title: "Contact FreshFlower.zone",
    description:
      "Contact FreshFlower.zone by phone, WhatsApp, or email for flower delivery, custom orders, wholesale enquiries, and wedding consultations.",
    url: canonical("/contact"),
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="We're here"
        title="Tell us what you're planning."
        copy="A flower order, a venue question, a custom idea, or simply a little help choosing. Send a note and our team will get back to you during business hours."
        tone="sage"
        video="/assets/video/bg2.mp4"
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-5">
          {/* Phone / WhatsApp */}
          <div className="rounded-lg bg-white/70 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Call or WhatsApp
            </p>
            <p className="mt-3 text-2xl font-semibold">+91 99999 99999</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="tel:+919999999999"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-ink-soft"
              >
                <Phone size={14} /> Call now
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-sage px-4 py-2.5 text-xs font-semibold text-sage-ink transition hover:bg-sage/70"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="rounded-lg bg-blush p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Email
            </p>
            <p className="mt-3 text-2xl font-semibold">
              hello@freshflower.zone
            </p>
            <a
              href="mailto:hello@freshflower.zone"
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
              <div className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-lavender-ink" />
                <span>
                  <strong className="text-ink">Mon – Sat:</strong> 6 AM – 8 PM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-lavender-ink" />
                <span>
                  <strong className="text-ink">Sunday:</strong> 7 AM – 2 PM
                  (limited slots)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-lavender-ink" />
                <span>WhatsApp available during all business hours</span>
              </div>
            </div>
          </div>

          {/* Service area */}
          <div className="rounded-lg bg-ivory-deep p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Service area
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {deliveryAreas.map((area) => (
                <div key={area.id} className="flex items-center gap-2 text-sm">
                  <MapPin size={12} className="shrink-0 text-gold" />
                  <span>{area.name}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              Don&apos;t see your area?{" "}
              <Link href="/delivery" className="font-semibold underline">
                Check delivery details
              </Link>{" "}
              or contact us — we may still be able to help.
            </p>
          </div>
        </div>

        <div>
          <ContactForm />
          <div className="mt-6 rounded-lg bg-white/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Quick links
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Wholesale enquiries", href: "/wholesale" },
                { label: "Wedding & events", href: "/wedding-events" },
                { label: "Delivery info", href: "/delivery" },
                { label: "FAQ", href: "/faq" },
                { label: "Track your order", href: "/account/orders" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-ivory/70 px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
                >
                  {label}
                  <ExternalLink size={10} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
