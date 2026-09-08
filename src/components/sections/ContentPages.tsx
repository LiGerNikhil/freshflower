import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { deliveryAreas } from "@/lib/data";
import type { FAQ } from "@/lib/data/faqs";

export function EditorialHeader({
  eyebrow,
  title,
  copy,
  tone = "ivory-deep",
  video,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  tone?: string;
  video?: string;
}) {
  return (
    <header
      className={`relative overflow-hidden ${tone ? `bg-${tone}` : ""} px-5 py-20 md:px-10 md:py-28`}
    >
      {video && <HeroVideo src={video} />}
      <div className="relative mx-auto max-w-7xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          {eyebrow}
        </p>
        <h1 className="max-w-4xl text-5xl leading-none md:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft">
          {copy}
        </p>
      </div>
    </header>
  );
}
export function AboutPage() {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="The FreshFlower.zone story"
        title="Flowers that feel like they belong in your day."
        copy="FreshFlower.zone began with a simple belief: the best flowers do not need to wait for a grand occasion. They should be easy to find, beautifully handled, and at your door while the morning still feels yours."
        video="/assets/video/bg2.mp4"
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-2 md:px-10">
        <article className="rounded-xl bg-blush p-8 md:p-12">
          <h2 className="font-display text-4xl">
            Closer to the grower. Closer to you.
          </h2>
          <p className="mt-6 text-sm leading-8 text-ink-soft">
            We work with trusted growers and market partners to select flowers
            in small batches, choosing stems for freshness, character, and the
            way they will open over the days ahead. We prepare close to
            dispatch, so what arrives is not simply pretty at the door; it has a
            life still unfolding.
          </p>
        </article>
        <article className="rounded-xl bg-sage p-8 md:p-12">
          <h2 className="font-display text-4xl">
            Delhi NCR, thoughtfully served.
          </h2>
          <p className="mt-6 text-sm leading-8 text-ink-soft">
            Our delivery footprint is deliberately focused. From South Extension
            to Gurgaon, Noida, Dwarka, and Vasant Kunj, we know the value of a
            reliable handoff and an early arrival. Local knowledge lets us make
            the small details count.
          </p>
        </article>
      </section>
      <section className="bg-ink px-5 py-20 text-ivory md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
            Why choose us
          </p>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              [
                "Freshness first",
                "Flowers selected with their next few beautiful days in mind.",
              ],
              [
                "Premium without fuss",
                "Thoughtful wrapping, clear pricing, and an easy booking flow.",
              ],
              [
                "Reliable mornings",
                "A focused local network designed around the hours you actually need.",
              ],
              [
                "Human help",
                "A real team for custom orders, celebrations, and questions.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="border-t border-ivory/20 pt-5">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ivory/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
export function DeliveryPage() {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="Delivery, made clear"
        title="Fresh flowers, before the day gets busy."
        copy="We deliver across a focused Delhi NCR footprint with morning windows designed for homes, offices, celebrations, and rituals."
      />
      {/* Core delivery facts */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-lg bg-sage p-7">
            <Clock3 className="text-sage-ink" />
            <h2 className="mt-12 font-display text-3xl">5 AM – 12 PM</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Morning delivery windows. Earlier slots (5–7 AM) are marked
              Morning Express when available.
            </p>
          </div>
          <div className="rounded-lg bg-blush p-7">
            <Truck className="text-gold" />
            <h2 className="mt-12 font-display text-3xl">Porter handoff</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Delivery is arranged through Porter. Porter charges are payable
              by the customer at delivery and may vary by route.
            </p>
          </div>
          <div className="rounded-lg bg-lavender p-7">
            <ShieldCheck className="text-lavender-ink" />
            <h2 className="mt-12 font-display text-3xl">Same-day rules</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Order as early as possible for same-day delivery. Availability
              depends on the flower, area, date, and open slot capacity.
            </p>
          </div>
        </div>
      </section>

      {/* Morning dropdown */}
      <section className="bg-ivory-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Morning delivery, explained
            </p>
            <h2 className="text-4xl">Why we deliver in the morning.</h2>
            <p className="mt-5 text-sm leading-8 text-ink-soft">
              Flowers are at their most vibrant in the early hours — petals
              turgid, fragrance intact, stems freshly cut. A morning delivery
              means your flowers arrive at their peak, ready to open through
              the day.
            </p>
            <p className="mt-4 text-sm leading-8 text-ink-soft">
              Morning windows also work better for the things flowers are most
              often for: puja and rituals that need everything ready by
              sunrise, office spaces where a reception desk should be fresh
              before the first guest arrives, and surprises that work best
              early in the day.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Flowers reach you within hours of preparation",
                "Ideal for puja, rituals, and morning ceremonies",
                "Office and hotel lobbies ready before opening",
                "Surprise deliveries when the recipient is still home",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-sm leading-6 text-ink-soft">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-white/70 p-7">
              <h3 className="font-display text-2xl">Available slots</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Our standard morning windows run from 5 AM to 12 PM. When you
                reach checkout, you&apos;ll see the exact slots currently open
                in your area for your chosen date, marked Available or Full.
              </p>
            </div>
            <div className="rounded-xl bg-sage/60 p-7">
              <h3 className="font-display text-2xl">Morning Express</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Slots between 5 AM and 7 AM are designated Morning Express.
                These are limited each day and tend to book first, especially
                for puja and corporate needs. Book early to secure one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where we deliver */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl">Where we deliver</h2>
            <p className="mt-4 text-sm leading-8 text-ink-soft">
              We deliver across a focused set of Delhi NCR areas — South
              Extension, Connaught Place, Vasant Kunj, Dwarka, Gurgaon, Noida,
              Greater Noida, Ghaziabad, and Faridabad — with delivery fees
              starting at ₹99.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {deliveryAreas.map((area) => (
                <div key={area.id} className="border-b border-ink/10 pb-4">
                  <p className="font-semibold">{area.name}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    From ₹{area.deliveryFee} · {area.estimatedMinutes} min
                  </p>
                  <p className="mt-1 text-[10px] text-ink-soft/70">
                    Pincode: {area.pincode.join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-ink-soft">
              Don&apos;t see your area? We may still be able to help. Contact
              us and we&apos;ll check availability.
            </p>
          </div>

          {/* Porter policy */}
          <div>
            <h2 className="text-4xl">Porter policy</h2>
            <p className="mt-4 text-sm leading-8 text-ink-soft">
              We arrange delivery through Porter, a trusted last-mile delivery
              partner. Here is exactly how it works:
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Charges",
                  text: "Porter charges are payable by you directly to the rider at delivery. They are not included in the flower order total.",
                },
                {
                  title: "Estimation",
                  text: "Charges depend on distance, time of day, and demand. We share an estimate where possible, but the final amount is set by Porter at dispatch.",
                },
                {
                  title: "Payment",
                  text: "Pay the rider via UPI, cash, or card (as accepted by the rider) at the time of delivery.",
                },
                {
                  title: "Recurring orders",
                  text: "For wholesale and recurring clients, we can factor Porter charges into a consolidated monthly arrangement. Ask us for details.",
                },
              ].map(({ title, text }) => (
                <div key={title} className="rounded-lg bg-white/60 p-5">
                  <h3 className="font-display text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Same-day & cutoff */}
      <section className="bg-ivory-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl">Same-day delivery</h2>
            <p className="mt-4 text-sm leading-8 text-ink-soft">
              Yes, we offer same-day delivery — order as early as possible and
              choose an available slot at checkout. Same-day delivery depends
              on:
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Flower variety being in today's ready stock",
                "An open delivery slot in your area",
                "The order being placed before the slot closes",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-sm leading-6 text-ink-soft">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-ink-soft">
              If a flower is marked &ldquo;Pre-order,&rdquo; it is not part of
              today&rsquo;s ready stock. We will confirm the best sourcing and
              delivery date for it.
            </p>
          </div>
          <div>
            <h2 className="text-4xl">Order cutoffs</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Same-day morning delivery",
                  text: "Order before the available slots fill up. Morning Express (5–7 AM) slots book out fastest.",
                },
                {
                  title: "Next-day delivery",
                  text: "Order by the previous evening to secure a slot for the following morning.",
                },
                {
                  title: "Weddings & large orders",
                  text: "Place 3–5 days in advance so we can source the right stems and plan the route.",
                },
                {
                  title: "Recurring wholesale",
                  text: "Set up a recurring schedule — we handle the rest.",
                },
              ].map(({ title, text }) => (
                <div key={title} className="border-l-2 border-gold pl-5">
                  <h3 className="font-display text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <h2 className="text-4xl">Delivery &amp; contact</h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-ink-soft">
          For questions about your area, timing, or a time-sensitive handoff,
          reach us directly.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-sage p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Phone
            </p>
            <p className="mt-2 text-xl font-semibold">+91 99999 99999</p>
            <p className="mt-1 text-xs text-ink-soft">Mon–Sat, 6 AM – 8 PM</p>
          </div>
          <div className="rounded-lg bg-blush p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              WhatsApp
            </p>
            <p className="mt-2 text-xl font-semibold">Same number</p>
            <p className="mt-1 text-xs text-ink-soft">
              Best for quick order queries
            </p>
          </div>
          <div className="rounded-lg bg-lavender p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Email
            </p>
            <p className="mt-2 text-xl font-semibold">hello@freshflower.zone</p>
            <p className="mt-1 text-xs text-ink-soft">
              For detailed or written queries
            </p>
          </div>
        </div>
        <p className="mt-8 text-sm leading-7 text-ink-soft">
          <Phone size={14} className="mr-2 inline text-gold" /> +91 99999 99999
        </p>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          <MessageCircle size={14} className="mr-2 inline text-gold" /> WhatsApp
          support
        </p>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          <Clock3 size={14} className="mr-2 inline text-gold" /> Daily, 6 AM – 8
          PM (Sun 7 AM – 2 PM)
        </p>
      </section>
    </main>
  );
}
export function FAQPage({ items }: { items: FAQ[] }) {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="Need to know"
        title="Answers before you order."
        copy="A clear answer is part of a good delivery. Here is what to expect from FreshFlower.zone."
      />
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-10 md:py-24">
        <FAQAccordion items={items} />
      </section>
    </main>
  );
}
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="Important information"
        title={title}
        copy="Preview/draft legal content — must be reviewed by the client or a qualified professional before launch."
      />
      <article className="mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-24 prose prose-stone">
        <div className="rounded-md border border-gold/40 bg-gold-soft/20 p-4 text-sm font-semibold text-ink">
          Preview/draft legal content — must be reviewed by the client/a
          professional before launch.
        </div>
        {children}
      </article>
    </main>
  );
}
