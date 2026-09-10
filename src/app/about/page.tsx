import type { Metadata } from "next";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import Link from "next/link";
import { Leaf, Clock3, Heart, MapPin } from "lucide-react";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About FreshFlower.zone",
  description:
    "The story behind FreshFlower.zone — a Delhi NCR flower studio built on freshness, reliability, and a belief that flowers belong in everyday life.",
  alternates: { canonical: canonical("/about") },
  openGraph: {
    title: "About FreshFlower.zone",
    description:
      "The story behind FreshFlower.zone — a Delhi NCR flower studio built on freshness, reliability, and a belief that flowers belong in everyday life.",
    url: canonical("/about"),
    type: "website",
  },
};

export default function AboutRoute() {
  return (
    <main className="bg-ivory">
      <EditorialHeader
        eyebrow="The FreshFlower.zone story"
        title="Flowers that feel like they belong in your day."
        copy="FreshFlower.zone began with a simple belief: the best flowers do not need to wait for a grand occasion. They should be easy to find, beautifully handled, and at your door while the morning still feels yours."
        video="/assets/video/bg2.mp4"
      />

      {/* Origin story */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-2 md:px-10">
        <article className="rounded-xl bg-blush p-8 md:p-12">
          <h2 className="font-display text-4xl">
            Closer to the grower. Closer to you.
          </h2>
          <p className="mt-6 text-sm leading-8 text-ink-soft">
            We started FreshFlower.zone because we noticed something missing in
            how flowers reached people in Delhi NCR. The market was full of
            options, but finding truly fresh, thoughtfully arranged flowers
            — without a last-minute trip to the mandi — was harder than it
            should be.
          </p>
          <p className="mt-4 text-sm leading-8 text-ink-soft">
            So we built a studio that works directly with trusted growers and
            market partners to select flowers in small batches, choosing stems
            for freshness, character, and the way they will open over the days
            ahead. We prepare close to dispatch, so what arrives is not simply
            pretty at the door — it has a life still unfolding.
          </p>
        </article>
        <article className="rounded-xl bg-sage p-8 md:p-12">
          <h2 className="font-display text-4xl">
            Delhi NCR, thoughtfully served.
          </h2>
          <p className="mt-6 text-sm leading-8 text-ink-soft">
            Our delivery footprint is deliberately focused. From South Extension
            to Gurgaon, Noida, Dwarka, and Vasant Kunj, we know the value of a
            reliable handoff and an early arrival. We chose morning delivery
            windows because that is when flowers look their best — when the
            light is soft and the day is just beginning.
          </p>
          <p className="mt-4 text-sm leading-8 text-ink-soft">
            Local knowledge lets us make the small details count: knowing which
            routes avoid peak traffic, which buildings need extra delivery
            instructions, and which neighbourhoods appreciate a 6 AM surprise.
          </p>
        </article>
      </section>

      {/* Our values */}
      <section className="bg-ink px-5 py-20 text-ivory md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
            What we stand for
          </p>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                title: "Freshness first",
                text: "Flowers selected with their next few beautiful days in mind. We prepare close to dispatch so stems arrive at their peak, not past it.",
                Icon: Leaf,
              },
              {
                title: "Premium without fuss",
                text: "Thoughtful wrapping, clear pricing, and an easy booking flow. No inflated markups, no confusing options — just beautiful flowers made simple.",
                Icon: Heart,
              },
              {
                title: "Reliable mornings",
                text: "A focused local network designed around the hours you actually need. Morning delivery windows that mean your flowers are fresh before the day gets busy.",
                Icon: Clock3,
              },
              {
                title: "Human help",
                text: "A real team for custom orders, celebrations, and questions. Whether it is a quick WhatsApp or a detailed wedding brief, we listen and respond like people, not systems.",
                Icon: MapPin,
              },
            ].map(({ title, text, Icon }) => (
              <div key={title} className="border-t border-ivory/20 pt-5">
                <Icon size={24} className="mb-4 text-gold-soft" />
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ivory/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do differently */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <h2 className="text-4xl">What we do differently</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl">
              Small-batch sourcing
            </h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              We do not buy in bulk and hope for the best. Each batch of flowers
              is selected for the orders we have that day — the right
              varieties, the right quantities, the right stage of bloom. This
              means less waste, fresher stems, and flowers that last longer in
              your vase.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl">
              Morning-first delivery
            </h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Our delivery windows run from 5 AM to 12 PM because mornings are
              when flowers are at their most vibrant. Whether it is a puja
              arrangement, a breakfast surprise, or office flowers that need to
              be in place before 9, we design our logistics around the hours
              that matter.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl">
              Transparent pricing
            </h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              Every product shows its real price — no inflated &ldquo;MRP&rdquo;
              crossed out to fake a deal. Delivery charges are confirmed at
              checkout based on your actual address. Porter charges are paid
              directly to the rider, not hidden in the bill.
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl">
              Made for Delhi NCR
            </h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              We are not a national marketplace trying to be everything to
              everyone. We know Delhi NCR — its weather, its traffic, its
              neighbourhoods, its occasions. This focus lets us deliver a level
              of reliability and local care that a larger operation would
              struggle to match.
            </p>
          </div>
        </div>
      </section>

      {/* The team */}
      <section className="bg-ivory-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
            The team
          </p>
          <h2 className="text-4xl">People who love flowers, doing the work.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-ink-soft">
            Behind every order is a small team that genuinely cares about
            getting the details right — from selecting the freshest stems at
            the morning market to tying the ribbon just so. We are not a
            faceless logistics operation. We are florists, designers, and
            problem-solvers who happen to be very good at getting flowers from
            point A to point B while they still look perfect.
          </p>
        </div>
      </section>

      {/* Instagram */}
      <InstagramFeed
        eyebrow="From our studio"
        copy="Peek behind the scenes — the morning market run, studio prep, and the arrangements that left our hands this week."
      />

      {/* Closing */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center md:px-10">
        <h2 className="text-4xl">
          Flowers for the ordinary days. And the extraordinary ones.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-ink-soft">
          Whether it is a Tuesday morning puja, an anniversary surprise, a
          hotel lobby that needs freshening, or a wedding that needs to be
          unforgettable — we are here to make flowers easy, beautiful, and
          right on time.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/flowers"
            className="inline-flex items-center rounded-lg bg-ink px-8 py-4 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
          >
            Shop flowers
          </Link>
          <Link
            href="/wholesale"
            className="inline-flex items-center rounded-lg border border-ink/20 bg-white/70 px-8 py-4 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Wholesale enquiries
          </Link>
        </div>
        <p className="mt-10 text-xs text-ink-soft">
          FreshFlower.zone is crafted with care by{" "}
          <a
            href="https://nwxglobalservices.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink transition hover:text-gold"
          >
            NWX Global Services
          </a>
          .
        </p>
      </section>
    </main>
  );
}
