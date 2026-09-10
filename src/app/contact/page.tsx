import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactInfoCards } from "@/components/sections/ContactInfoCards";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { getDeliveryAreas } from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";

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
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const deliveryAreas = await getDeliveryAreas();
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
          <ContactInfoCards />

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

      {/* Instagram */}
      <InstagramFeed
        title="Fresh blooms, every day."
        copy="Follow our feed for daily arrangements, new arrivals, and a look at what leaves the studio each morning."
      />
    </main>
  );
}
