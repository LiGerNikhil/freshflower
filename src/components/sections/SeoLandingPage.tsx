import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Phone, Truck } from "lucide-react";
import { FilteredFlowerCollection } from "@/components/sections/FilteredFlowerCollection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import type { CatalogState } from "@/lib/catalog";
import type { Flower } from "@/lib/types";

export interface SEOArea {
  name: string;
  pincodes: string[];
  fee: number;
  eta: number;
}

const TONES: Record<string, { bg: string; eyebrow: string }> = {
  blush: { bg: "bg-blush", eyebrow: "text-sage-ink" },
  sage: { bg: "bg-sage", eyebrow: "text-sage-ink" },
  lavender: { bg: "bg-lavender", eyebrow: "text-lavender-ink" },
  "ivory-deep": { bg: "bg-ivory-deep", eyebrow: "text-sage-ink" },
  "gold-soft": { bg: "bg-gold-soft/30", eyebrow: "text-sage-ink" },
};

export function SeoLandingPage({
  eyebrow,
  title,
  intro,
  highlights,
  areas,
  flowers,
  initialState,
  productLabel,
  faqs,
  tone = "ivory-deep",
  nearby,
}: {
  eyebrow: string;
  title: string;
  intro: string[];
  highlights: string[];
  areas?: SEOArea[];
  flowers: Flower[];
  initialState: CatalogState;
  productLabel: string;
  faqs: { question: string; answer: string }[];
  tone?: keyof typeof TONES | string;
  nearby: { label: string; href: string }[];
}) {
  const toneClasses = TONES[tone] ?? TONES["ivory-deep"];

  return (
    <main className="bg-ivory">
      {/* Hero */}
      <section className={`${toneClasses.bg} px-5 py-16 md:px-10 md:py-24`}>
        <div className="mx-auto max-w-7xl">
          <p
            className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${toneClasses.eyebrow}`}
          >
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-5xl leading-none md:text-6xl">
            {title}
          </h1>
          <div className="mt-6 grid max-w-4xl gap-6 md:grid-cols-2">
            {intro.map((paragraph, i) => (
              <p key={i} className="text-sm leading-8 text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/flowers"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
            >
              Browse flowers <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <a
              href="tel:+919999999999"
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white/60 px-6 py-3 text-sm font-semibold text-ink transition hover:border-gold"
            >
              <Phone size={15} aria-hidden="true" /> +91 99999 99999
            </a>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((text) => (
            <div
              key={text}
              className="rounded-lg bg-white/70 p-5 text-sm leading-6 text-ink"
            >
              <span className="mb-3 block h-1.5 w-6 rounded-full bg-gold" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Local delivery details */}
      {areas && areas.length > 0 && (
        <section className="bg-ink px-5 py-16 text-ivory md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
              <MapPin size={14} aria-hidden="true" /> Local delivery details
            </p>
            <h2 className="text-3xl">Where the morning arrives first.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {areas.map((area) => (
                <div
                  key={area.name}
                  className="rounded-lg border border-ivory/15 p-5"
                >
                  <p className="font-display text-xl">{area.name}</p>
                  <p className="mt-2 text-xs text-ivory/60">
                    Pincode: {area.pincodes.join(", ")}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-ivory/80">
                    <span className="flex items-center gap-1">
                      <Truck size={13} aria-hidden="true" className="text-gold" />
                      ₹{area.fee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={13} aria-hidden="true" className="text-gold" />
                      ~{area.eta} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-ivory/55">
              Porter delivery charges are payable to the rider at the door and
              may vary by route and demand. The exact fee is confirmed at
              dispatch.
            </p>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
            Shop the collection
          </p>
          <h2 className="mt-2 text-3xl">{productLabel}</h2>
        </div>
        <div className="mt-8">
          <FilteredFlowerCollection flowers={flowers} initialState={initialState} />
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="bg-ivory-deep px-5 py-16 md:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Good to know
            </p>
            <h2 className="mt-2 text-3xl">Common questions</h2>
            <div className="mt-8 border-t border-ink/10">
              <FAQAccordion
                items={faqs.map((faq, index) => ({
                  id: `seo-faq-${index}`,
                  question: faq.question,
                  answer: faq.answer,
                  category: "General",
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Nearby + CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="flex flex-wrap gap-2">
          {nearby.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-ink px-8 py-10 text-center text-ivory md:py-14">
          <h2 className="text-3xl md:text-4xl">
            Not sure which flowers today?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ivory/60">
            Tell us the occasion, the area, and the date — we will find the
            right stems and a delivery slot that fits.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-soft"
            >
              Chat with our team
            </Link>
            <Link
              href="/delivery"
              className="rounded-md border border-ivory/25 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-gold"
            >
              Delivery details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}