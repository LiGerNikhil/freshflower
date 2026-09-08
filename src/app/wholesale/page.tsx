import type { Metadata } from "next";
import { LeadForm } from "@/components/sections/LeadForm";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";
import {
  Building2,
  CalendarCheck,
  Flower2,
  Truck,
  Repeat,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Wholesale flowers | FreshFlower.zone",
  description:
    "Reliable bulk flower supply for hotels, restaurants, florists, decorators, and corporate teams across Delhi NCR. Daily, weekly, and event-based arrangements.",
  alternates: { canonical: canonical("/wholesale") },
  openGraph: {
    title: "Wholesale flowers | FreshFlower.zone",
    description:
      "Reliable bulk flower supply for hotels, restaurants, florists, decorators, and corporate teams across Delhi NCR.",
    url: canonical("/wholesale"),
    type: "website",
  },
};

export default function WholesalePage() {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="For businesses that care about the details"
        title="Flowers at the scale your work requires."
        copy="From hotel lobbies and restaurant tables to florist counters, event installations, and corporate gifting — we help teams source beautiful flowers without the last-minute scramble."
        tone="gold"
        video="/assets/video/bg2.mp4"
      />

      {/* Who we serve */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <h2 className="text-4xl">Who we work with</h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-ink-soft">
          Every business has a different relationship with flowers. A hotel
          lobby needs daily freshness, a restaurant needs table-ready stems, a
          florist needs reliable wholesale stock, and a corporate office needs
          something that quietly says &ldquo;we care.&rdquo; We understand all of these.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-sage p-7">
            <Building2 className="text-sage-ink" size={28} />
            <h3 className="mt-5 font-display text-2xl">Hotels & resorts</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Daily lobby arrangements, corridor vases, restaurant centrepieces,
              and welcome displays. We match your brand palette and deliver
              before guests arrive.
            </p>
          </div>
          <div className="rounded-xl bg-blush p-7">
            <Flower2 className="text-gold" size={28} />
            <h3 className="mt-5 font-display text-2xl">Restaurants & cafés</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Table flowers that complement your ambience without overwhelming
              conversation. Fresh stems changed on a schedule that works for
              your kitchen.
            </p>
          </div>
          <div className="rounded-xl bg-lavender p-7">
            <Repeat className="text-lavender-ink" size={28} />
            <h3 className="mt-5 font-display text-2xl">Florists & studios</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Bulk stems for your own arrangements — roses, carnations, mogra,
              seasonal varieties. Consistent quality at wholesale pricing so you
              can focus on creating.
            </p>
          </div>
          <div className="rounded-xl bg-ivory-deep p-7">
            <Truck className="text-gold" size={28} />
            <h3 className="mt-5 font-display text-2xl">Event decorators</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Colour-led stems for stages, backdrops, arches, and large-scale
              installations. We coordinate volume, timing, and variety so
              install day goes smoothly.
            </p>
          </div>
          <div className="rounded-xl bg-sage p-7">
            <CalendarCheck className="text-sage-ink" size={28} />
            <h3 className="mt-5 font-display text-2xl">Corporate gifting</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Festive arrangements for Diwali, Christmas, and New Year.
              Client gift boxes, employee appreciation flowers, and office
              refresh programs.
            </p>
          </div>
          <div className="rounded-xl bg-blush p-7">
            <ShieldCheck className="text-gold" size={28} />
            <h3 className="mt-5 font-display text-2xl">Temples & institutions</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Regular supply for daily offerings, prayer halls, and cultural
              spaces. Mogra, marigold, rajnigandha, and seasonal blooms at
              wholesale scale.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink px-5 py-20 text-ivory md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
            How it works
          </p>
          <h2 className="text-4xl text-ivory">Three steps to fresh supply.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Tell us what you need",
                text: "Fill in the form with your business name, flower types, quantities, delivery location, and preferred schedule. The more detail, the better the quote.",
              },
              {
                step: "02",
                title: "We build your quote",
                text: "Our team reviews your requirements, sources the right stems, and sends a transparent quote — no hidden charges, clear per-stem or per-bunch pricing.",
              },
              {
                step: "03",
                title: "Fresh flowers, on schedule",
                text: "Once confirmed, we deliver on the agreed dates with Porter handoff. Recurring clients get a dedicated contact for easy reordering and adjustments.",
              },
            ].map(({ step, title, text }) => (
              <div key={step} className="border-t border-ivory/20 pt-5">
                <span className="text-5xl font-display text-gold-soft">
                  {step}
                </span>
                <h3 className="mt-4 font-display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ivory/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Why businesses choose us
            </p>
            <h2 className="text-4xl">
              A dependable floral partner, not just a supplier.
            </h2>
            <p className="mt-5 text-sm leading-8 text-ink-soft">
              We know that late flowers or wilted stems are not just an
              inconvenience — they affect your guest experience, your brand, and
              your team&rsquo;s morning. That is why reliability is not a nice-to-have
              for us; it is the core of how we work.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Same fresh quality whether you order 50 stems or 500",
                "Flexible scheduling — daily, weekly, or on-demand",
                "Transparent pricing with no last-minute surprises",
                "Porter charges confirmed upfront, not at the door",
                "Dedicated contact for recurring clients",
                "Backup sourcing for unexpected demand spikes",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-sm leading-6 text-ink-soft">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-sage/50 p-7">
              <h3 className="font-display text-2xl">Regular supply</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Set it and forget it. We deliver on a recurring schedule — daily
                for hotels, weekly for offices, or aligned to your event
                calendar. Adjust quantities with a quick message.
              </p>
            </div>
            <div className="rounded-xl bg-blush/50 p-7">
              <h3 className="font-display text-2xl">Event & bulk orders</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                One-time or multi-day events. We plan sourcing, prep, and
                delivery around your timeline so the right flowers arrive at the
                right moment — not too early, not too late.
              </p>
            </div>
            <div className="rounded-xl bg-lavender/50 p-7">
              <h3 className="font-display text-2xl">Emergency supply</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Last-minute event? Unexpected demand? Reach out and we will do
                our best to accommodate. Our local sourcing network means we can
                often turn around urgent requests within hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="bg-ivory-deep px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Start the conversation
            </p>
            <h2 className="text-4xl">Request a wholesale quote.</h2>
            <p className="mt-5 text-sm leading-8 text-ink-soft">
              Tell us what you need, when you need it, and where it should
              arrive. We&apos;ll come back with a practical quote built around stems,
              scale, freshness, and timing.
            </p>
            <p className="mt-4 text-sm leading-8 text-ink-soft">
              Typical response time: within 24 hours on business days. For urgent
              requirements, call us directly.
            </p>
            <div className="mt-6 rounded-lg bg-white/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
                Direct contact
              </p>
              <p className="mt-2 text-lg font-semibold">+91 99999 99999</p>
              <p className="mt-1 text-sm text-ink-soft">
                Mon–Sat, 8 AM – 6 PM
              </p>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>
    </main>
  );
}
