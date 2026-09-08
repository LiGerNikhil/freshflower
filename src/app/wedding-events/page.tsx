import type { Metadata } from "next";
import { LeadForm } from "@/components/sections/LeadForm";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";
import { Heart, Sparkles, Camera, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Wedding & events flowers | FreshFlower.zone",
  description:
    "Wedding, venue, stage, and bridal flowers planned with care across Delhi NCR. Mandap, aisle, reception, and every detail in between.",
  alternates: { canonical: canonical("/wedding-events") },
  openGraph: {
    title: "Wedding & events flowers | FreshFlower.zone",
    description:
      "Wedding, venue, stage, and bridal flowers planned with care across Delhi NCR.",
    url: canonical("/wedding-events"),
    type: "website",
  },
};

export default function WeddingEventsPage() {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="Weddings & events"
        title="Let the flowers hold the atmosphere."
        copy="For the mandap, the stage, the aisle, the tables, and the bouquet you keep after the music ends. We help turn a venue into a feeling — one stem at a time."
        tone="blush"
        video="/assets/video/bg2.mp4"
      />

      {/* Showcase categories */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            {
              title: "Mandap & venue",
              text: "Flowers that give the room its first impression — marigold garlands, floral arches, and entrance pieces that set the tone before a word is spoken.",
              token: "ivory",
              icon: Sparkles,
            },
            {
              title: "Stage & backdrop",
              text: "A considered backdrop for the moments everyone photographs. We design around your colour palette, lighting, and the story you want the stage to tell.",
              token: "blush",
              icon: Camera,
            },
            {
              title: "Bridal flowers",
              text: "Personal flowers that feel like you, not a template — bouquet, corsages, hair flowers, and garlands crafted around your outfit and style.",
              token: "lavender",
              icon: Heart,
            },
            {
              title: "Table & dining",
              text: "Small details that make dinner feel like an occasion — centrepieces, bud vases, charger-ring florals, and buffet accents.",
              token: "sage",
              icon: Users,
            },
          ].map(({ title, text, token, icon: Icon }) => (
            <div
              key={title}
              className="flex min-h-72 flex-col justify-end rounded-xl p-6"
              style={{
                background: `var(--color-${token})`,
              }}
            >
              <Icon size={24} className="mb-4 text-ink-soft" />
              <h2 className="font-display text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our approach */}
      <section className="bg-ivory-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
            Our approach
          </p>
          <h2 className="text-4xl">
            Flowers that understand the room.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-ink-soft">
            Every venue has its own character, and every couple has a different
            picture in mind. We do not believe in template weddings. Instead, we
            listen first — to your palette, your venue, your story — and then
            design floral moments that feel unmistakably yours.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Colour-led design",
                text: "We start with your palette — not ours. Whether it is blush and ivory, bold marigold and red, or moody jewel tones, every stem is chosen to harmonise with your vision.",
              },
              {
                title: "Venue-aware planning",
                text: "A garden wedding in Gurgaon needs different flowers than a banquet hall in Connaught Place. We factor in light, space, climate, and timing to make every arrangement sing.",
              },
              {
                title: "Day-of coordination",
                text: "We coordinate delivery timing with your wedding planner and venue team. Flowers arrive at the right moment — fresh, not rushed; set, not scattered.",
              },
            ].map(({ title, text }) => (
              <div key={title} className="border-t border-ink/10 pt-5">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events beyond weddings */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Beyond the wedding
            </p>
            <h2 className="text-4xl">Events that deserve flowers too.</h2>
            <p className="mt-5 text-sm leading-8 text-ink-soft">
              Weddings are what we are best known for, but we bring the same care
              to every celebration and milestone.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Engagement parties",
                "Mehendi & sangeet",
                "Birthday celebrations",
                "Anniversary dinners",
                "Baby showers",
                "Corporate galas",
                "Product launches",
                "Diwali & festive decor",
                "Religious ceremonies",
                "Memorial & tribute flowers",
              ].map((event) => (
                <div
                  key={event}
                  className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-3"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-sm text-ink-soft">{event}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-blush/50 p-7">
              <h3 className="font-display text-2xl">Small & intimate</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Not every event needs a thousand stems. For intimate gatherings,
                we create focused, high-impact pieces — a single installation,
                a beautiful arch, or a curated table — that make the space feel
                complete.
              </p>
            </div>
            <div className="rounded-xl bg-sage/50 p-7">
              <h3 className="font-display text-2xl">Grand & multi-day</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Multi-day celebrations across venues? We plan the entire floral
                journey — from the mehendi to the reception — with coordinated
                palettes and staggered deliveries that stay fresh throughout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-ivory-deep px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Start the conversation
            </p>
            <h2 className="text-4xl">Request a bulk quote.</h2>
            <p className="mt-5 text-sm leading-8 text-ink-soft">
              Share your date, venue, scale, and the feeling you want guests to
              remember. We&apos;ll shape the next conversation around your event.
            </p>
            <p className="mt-4 text-sm leading-8 text-ink-soft">
              For quick discussions, reach us on WhatsApp or call during business
              hours. We typically respond within 24 hours.
            </p>
            <div className="mt-6 rounded-lg bg-white/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
                Direct contact
              </p>
              <p className="mt-2 text-lg font-semibold">+91 99999 99999</p>
              <p className="mt-1 text-sm text-ink-soft">
                WhatsApp available · Mon–Sat, 8 AM – 6 PM
              </p>
            </div>
          </div>
          <LeadForm kind="wedding" />
        </div>
      </section>
    </main>
  );
}
