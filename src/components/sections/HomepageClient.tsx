"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Flower2,
  Leaf,
  MapPin,
  MessageCircle,
  Quote,
  Sparkles,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/sections/ProductCard";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { DELIVERY_CHARGE } from "@/lib/cart";
import { faqs, type FAQ } from "@/lib/data/faqs";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type {
  Category,
  DeliveryArea,
  Flower,
  Occasion,
  Review,
} from "@/lib/types";

interface HomepageClientProps {
  categories: Category[];
  flowers: Flower[];
  occasions: Occasion[];
  deliveryAreas: DeliveryArea[];
  reviews: Review[];
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const occasionNames = [
  "Anniversary",
  "Birthday",
  "Wedding",
  "Romance",
  "Gifting",
];
const occasionIcons = ["01", "02", "03", "04", "05"];
const occasionImages: Record<string, string> = {
  Anniversary:
    "https://static.vecteezy.com/system/resources/thumbnails/060/294/693/small/bouquet-of-flowers-with-rings-and-anniversary-card-on-soft-fabric-background-in-warm-setting-free-photo.jpeg",
  Birthday:
    "https://m.media-amazon.com/images/I/81jYgQvuJHL._AC_UF1000,1000_QL80_.jpg",
  Wedding:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu1rAQs4D30VEC-f_i916fPOzVhgY-0EzvgaYscSjYrRSYHPI-jpEs2mLI&s=10",
  Gifting:
    "https://plus.unsplash.com/premium_photo-1700353612860-bd8ab8d71f05?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cm9tYW5jZXxlbnwwfHwwfHx8MA%3D%3D",
  Romance:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf1zIeg72YRU-2UpC9augotGSullilxqdUPj7rOrDc6PqMRNkwtFWHjY4L&s=10",
};

const storyTimeline = [
  ["5 AM", "Market sourcing", "Fresh stems are selected early from trusted Delhi NCR flower-market supply."],
  ["7 AM", "Sorting & packing", "Colours, stem quality and bunches are checked before breathable packing."],
  ["9 AM+", "Porter dispatch", "Orders move through Porter with the delivery charge shown clearly."],
  ["Same day", "Fresh at your door", "Flowers arrive ready for puja, gifting, home styling or event prep."],
];

const useCases = [
  {
    title: "Daily puja flowers",
    copy: "Loose flowers and fragrant stems for morning rituals and home mandirs.",
    href: "/flower-delivery-delhi",
    flowers: "Mogra · Rose · Rajnigandha",
  },
  {
    title: "Gifting blooms",
    copy: "Colour-led roses, orchids, lilies and carnations for birthdays and thoughtful gestures.",
    href: "/occasions/gifting",
    flowers: "Rose · Orchid · Lily",
  },
  {
    title: "Home styling",
    copy: "Fresh bunches for tables, corners, entryways and weekend hosting.",
    href: "/flowers",
    flowers: "Gerbera · Daisy · Carnation",
  },
  {
    title: "Events & bulk",
    copy: "Colour planning, bulk stems and WhatsApp coordination for weddings and functions.",
    href: "/wedding-events",
    flowers: "Bulk stems · Colour matching",
  },
];

const deliveryConditions = [
  "Seamless retail flower delivery across the entire Delhi NCR region via Porter.",
  "Porter delivery charges are paid by the customer and shown clearly before checkout.",
  "Locations beyond Delhi NCR are served for bulk flower orders only.",
];

const businessProof = [
  {
    eyebrow: "Why choose us",
    title: "12+ years in the floral industry",
    copy: "With over 12 years of dedicated experience, we have built our reputation on quality, reliability and trust. From our authorised shop in Ghazipur Flower Market, Delhi, we source directly to bring premium fresh flowers at highly reasonable rates.",
  },
  {
    eyebrow: "About FreshFlower.zone",
    title: "Direct sourcing, wholesale strength",
    copy: "We source flowers directly from farmers and operate a registered wholesale shop in India’s largest flower market. That is why our pricing stays competitive for everyday buyers, event planners, suppliers and shopkeepers.",
  },
  {
    eyebrow: "Wholesale details",
    title: "Bangalore flowers, fresh and premium",
    copy: "We deal in high-quality Bangalore flowers with strict wholesale pricing. Whether you purchase a single piece, a single bunch or place a bulk order, we work to deliver fresh flowers across Delhi NCR at wholesale-friendly rates.",
  },
];

const colourTokens: Record<string, string> = {
  Red: "#c2413b",
  Pink: "#e9a4b2",
  White: "#fffaf0",
  Yellow: "#e6bd45",
  Orange: "#e8792e",
  Purple: "#8b5fbf",
};

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </motion.div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  href,
  linkLabel = "Explore all",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          {eyebrow}
        </p>
        <h2 className="text-4xl leading-[1.05] text-ink md:text-5xl">
          {title}
        </h2>
        {copy && (
          <p className="mt-4 max-w-lg text-sm leading-7 text-ink-soft">
            {copy}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-ink"
        >
          {linkLabel}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}

function FAQItem({
  item,
  open,
  onToggle,
}: {
  item: FAQ;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-ink/10 py-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-5 text-left font-display text-xl text-ink"
      >
        {item.question}
        <ChevronDown
          size={19}
          className={`shrink-0 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-3 text-sm leading-7 text-ink-soft"
          >
            {item.answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomepageClient({
  categories,
  flowers,
  occasions,
  deliveryAreas,
  reviews,
}: HomepageClientProps) {
  const [quickView, setQuickView] = useState<Flower | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);
  const [selectedColour, setSelectedColour] = useState("Red");
  const { homepage, settings } = useSiteContent();

  // Featured selection & testimonials come from the Phase 16 homepage config
  // (seeded identically on server + client, so hydration is safe). Unknown
  // ids fall back to the legacy `featured` flag / first reviews.
  const featured = useMemo(() => {
    const ids = homepage.featuredFlowerIds;
    const selected = ids
      .map((id) => flowers.find((flower) => flower.id === id))
      .filter((flower): flower is Flower => Boolean(flower));
    return selected.length > 0 ? selected : flowers.filter((flower) => flower.featured);
  }, [homepage.featuredFlowerIds, flowers]);

  const heroReviews = useMemo(() => {
    const selected = homepage.testimonialReviewIds
      .map((id) => reviews.find((review) => review.id === id))
      .filter((review): review is Review => Boolean(review));
    return selected.length > 0 ? selected : reviews.slice(0, 3);
  }, [homepage.testimonialReviewIds, reviews]);

  const freshToday = flowers.filter((flower) => flower.availableToday);
  const colourFlowers = useMemo(
    () =>
      flowers
        .filter((flower) =>
          flower.colorVariants?.some(
            (variant) => variant.color.toLowerCase() === selectedColour.toLowerCase(),
          ),
        )
        .slice(0, 4),
    [flowers, selectedColour],
  );
  const findOccasion = (name: string) =>
    occasions.find((occasion) => occasion.name === name) ??
    occasions.find((occasion) => occasion.slug === "just-because");

  return (
    <main className="overflow-hidden bg-ivory">
      <section className="relative min-h-[720px] overflow-hidden bg-blush px-5 pb-20 pt-28 md:px-10 md:pt-36">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          src="/assets/video/bg1.mp4"
        />
        <div className="absolute inset-0 bg-ivory/40" />
        <div className="absolute -right-24 top-24 h-[480px] w-[480px] rounded-full border border-white/60 bg-white/20 blur-[1px] md:h-[620px] md:w-[620px]" />
        <motion.div
          animate={{ y: [0, -13, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[8%] top-[22%] flex h-52 w-52 items-center justify-center rounded-full bg-ivory/25 md:h-80 md:w-80"
        >
          <Flower2
            size={190}
            strokeWidth={0.45}
            className="text-ink/25 md:h-72 md:w-72"
          />
        </motion.div>
        <div className="relative mx-auto grid max-w-7xl items-end gap-14 md:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-sage-ink">
              {homepage.hero.eyebrow}
            </p>
            <h1 className="max-w-4xl text-5xl leading-[0.98] text-ink md:text-7xl lg:text-[5.8rem]">
              {homepage.hero.titleLines.map((line, lineIndex) => (
                <span key={line}>
                  {lineIndex === homepage.hero.accentLineIndex ? (
                    <>
                      <em className="text-gold">{line}</em>
                      <br />
                    </>
                  ) : (
                    <>
                      {line}
                      <br className={lineIndex === homepage.hero.titleLines.length - 1 ? "md:hidden" : ""} />
                    </>
                  )}
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-ink-soft">
              {homepage.hero.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={homepage.hero.ctaPrimaryHref}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
              >
                {homepage.hero.ctaPrimaryLabel} <ArrowRight size={16} />
              </Link>
              <Link
                href={homepage.hero.ctaSecondaryHref}
                className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white/35 px-6 py-3.5 text-sm font-semibold text-ink"
              >
                {homepage.hero.ctaSecondaryLabel} <Clock3 size={16} />
              </Link>
            </div>
          </Reveal>
          <Reveal className="hidden md:block">
            <div className="ml-auto max-w-xs rounded-lg bg-ivory/70 p-5 backdrop-blur-md">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                  The morning edit
                </span>
                <Sparkles size={17} className="text-gold" />
              </div>
              <p className="font-display text-3xl leading-tight text-ink">
                Flowers that make the day feel considered.
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs text-ink-soft">
                <MapPin size={14} /> South Delhi · Gurgaon · Noida
              </div>
            </div>
          </Reveal>
        </div>
        <a
          href="#shop"
          aria-label="Scroll to shop"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-ink/60"
        >
          <ArrowDown size={20} />
        </a>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <div className="rounded-2xl bg-ink p-7 text-ivory shadow-sm md:p-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">
                The FreshFlower.zone story
              </p>
              <h2 className="text-4xl leading-tight md:text-5xl">
                Fresh flowers without the usual guessing.
              </h2>
              <p className="mt-5 text-sm leading-7 text-ivory/70">
                FreshFlower.zone is built for Delhi NCR customers who want real fresh stems,
                clear colour choices, honest product pricing and Porter delivery visibility before checkout.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold text-ivory">
                {[
                  "Daily sourcing",
                  "Colour-wise pricing",
                  `Porter ₹${DELIVERY_CHARGE}`,
                  "WhatsApp support",
                ].map((label) => (
                  <span key={label} className="rounded-full border border-ivory/15 px-3 py-1.5">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {storyTimeline.map(([time, title, copy]) => (
              <motion.div
                key={time}
                variants={reveal}
                className="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                  {time}
                </p>
                <h3 className="mt-4 font-display text-2xl text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{copy}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory-deep px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
                Built from the flower market
              </p>
              <h2 className="text-4xl leading-tight text-ink md:text-6xl">
                Wholesale roots. Retail convenience.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft">
                FreshFlower.zone brings Ghazipur Flower Market strength online: direct sourcing,
                premium Bangalore flowers, wholesale-friendly rates and reliable Porter delivery across Delhi NCR.
              </p>
            </div>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {businessProof.map((item) => (
              <motion.article
                key={item.eyebrow}
                variants={reveal}
                className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-sm"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/15" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                  {item.eyebrow}
                </p>
                <h3 className="mt-10 font-display text-3xl leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-ink-soft">{item.copy}</p>
              </motion.article>
            ))}
          </motion.div>
          <Reveal>
            <div className="mt-5 rounded-2xl bg-ink px-6 py-7 text-ivory md:px-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
                    Team FreshFlower.zone
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ivory/75">
                    Event planners, suppliers and shopkeepers outside Delhi NCR can place bulk flower orders with us. We keep all types of flowers available at the best possible wholesale rates.
                  </p>
                </div>
                <Link
                  href="/wholesale"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-ivory px-5 py-3 text-sm font-semibold text-ink"
                >
                  Wholesale enquiry <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="shop" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="Find your bloom"
              title="Shop by category"
              copy="A little beauty for the table, the doorstep, and all the moments in between."
            />
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="flex snap-x gap-4 overflow-x-auto pb-5 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6"
          >
            {categories.slice(0, 6).map((category) => (
              <motion.div
                variants={reveal}
                key={category.id}
                className="min-w-[210px] snap-start"
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <div
                    className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg"
                    style={
                      category.imageUrl
                        ? undefined
                        : { background: GRADIENT_TOKENS[category.heroImage] }
                    }
                  >
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 210px, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <>
                        <Flower2
                          size={82}
                          strokeWidth={0.65}
                          className="text-ink/25 transition-transform duration-500 group-hover:scale-110"
                        />
                      </>
                    )}
                    <span className="absolute bottom-4 left-4 rounded-full bg-ivory/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
                      {category.name}
                    </span>
                  </div>
                  <p className="pr-3 text-sm leading-6 text-ink-soft">
                    {category.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-white/55 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="Shop by colour"
              title="Pick a mood before you pick a flower"
              copy="Roses, gerberas, carnations, orchids and lilies now support colour-wise pricing where stock is available. Choose a colour and see matching stems first."
              href="/flowers"
              linkLabel="Browse all colours"
            />
          </Reveal>
          <div className="mb-8 flex snap-x gap-2 overflow-x-auto pb-2">
            {Object.entries(colourTokens).map(([colour, token]) => {
              const active = selectedColour === colour;
              return (
                <button
                  key={colour}
                  type="button"
                  onClick={() => setSelectedColour(colour)}
                  className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/10 bg-ivory text-ink hover:border-ink/30"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border border-ink/10"
                    style={{ background: token }}
                  />
                  {colour}
                </button>
              );
            })}
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4"
          >
            {(colourFlowers.length ? colourFlowers : featured.slice(0, 4)).map((flower) => (
              <ProductCard
                key={`${selectedColour}-${flower.id}`}
                flower={flower}
                onQuickView={setQuickView}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory-deep px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="Most loved"
              title="Best sellers"
              href="/categories"
            />
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4"
          >
            {featured.map((flower) => (
              <ProductCard
                key={flower.id}
                flower={flower}
                onQuickView={setQuickView}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {homepage.showsFreshToday && (
        <section className="px-5 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionIntro
                eyebrow="Picked this morning"
                title="Today's fresh flowers"
                copy="The best of today's harvest, ready to leave our studio and arrive at yours."
                href="/flowers"
                linkLabel="See all flowers"
              />
            </Reveal>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08 }}
              className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4"
            >
              {freshToday.slice(0, 4).map((flower) => (
                <ProductCard
                  key={flower.id}
                  flower={flower}
                  onQuickView={setQuickView}
                />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="What are you buying for?"
              title="Start with the moment"
              copy="FreshFlower.zone is organised around real needs: daily puja, gifting, home styling and bulk event flowers."
            />
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {useCases.map((item, index) => (
              <motion.div key={item.title} variants={reveal}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-md"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                      0{index + 1}
                    </span>
                    <h3 className="mt-8 font-display text-2xl text-ink">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink-soft">{item.copy}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink/10 pt-4 text-xs font-semibold text-ink-soft">
                    <span>{item.flowers}</span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-ink transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Reveal>
        <section
          id="delivery"
          className="mx-5 overflow-hidden rounded-xl bg-sage px-7 py-12 md:mx-10 md:px-16 md:py-16"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
                Porter delivery, made clear
              </p>
              <h2 className="text-4xl text-ink md:text-6xl">5 AM – 12 PM</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                Morning delivery across Delhi NCR, with Porter delivery charge shown before checkout. Current Porter charge: ₹{DELIVERY_CHARGE}.
              </p>
              <div className="mt-5 grid gap-2 text-xs font-semibold text-sage-ink sm:grid-cols-3">
                {deliveryConditions.map((condition, index) => (
                  <p
                    key={condition}
                    className="rounded-lg border border-sage-ink/10 bg-white/35 px-3 py-3 leading-5"
                  >
                    <span className="mr-1.5 text-gold">0{index + 1}</span>
                    {condition}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
              >
                Book your delivery <ArrowRight size={16} />
              </Link>
              <Link
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 bg-white/45 px-6 py-3.5 text-sm font-semibold text-ink"
              >
                WhatsApp us <MessageCircle size={16} />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="For every feeling"
              title="Flowers by occasion"
            />
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            {occasionNames.map((name, index) => {
              const occasion = findOccasion(name);
              return (
                <motion.div variants={reveal} key={name} className="h-full">
                  <Link
                    href={`/occasions/${occasion?.slug ?? name.toLowerCase()}`}
                    className={`group relative block overflow-hidden rounded-lg ${occasionImages[name] ? "aspect-[0.8]" : "h-full bg-lavender p-6 transition-colors hover:bg-blush"}`}
                  >
                    {occasionImages[name] ? (
                      <>
                        <Image
                          src={occasionImages[name]}
                          alt={`${name} flowers`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/45 p-4 backdrop-blur-sm">
                          <h3 className="font-display text-2xl text-ivory">
                            {name}
                          </h3>
                          <ArrowRight
                            size={18}
                            className="text-ivory transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-lavender-ink">
                          {occasionIcons[index]}
                        </span>
                        <h3 className="mt-16 font-display text-2xl text-ink">
                          {name}
                        </h3>
                        <div className="mt-5 flex justify-end">
                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section
        id="story"
        className="bg-ink px-5 py-24 text-ivory md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 max-w-xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">
                Our promise
              </p>
              <h2 className="text-4xl leading-tight md:text-5xl">
                The little things, done beautifully.
              </h2>
            </div>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {[
              ["Fresh", "Selected close to dispatch", Leaf],
              ["Premium", "Beautiful by design", Sparkles],
              ["Reliable", "On time, every time", Check],
              ["Local", "Rooted in Delhi NCR", MapPin],
              ["Fast", "Morning, not maybe", Truck],
            ].map(([title, text, Icon]) => (
              <motion.div
                variants={reveal}
                key={title as string}
                className="border-t border-ivory/20 pt-5"
              >
                <Icon size={21} className="mb-8 text-gold-soft" />
                <h3 className="font-display text-2xl">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-ivory/60">
                  {text as string}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="We deliver here"
              title="Delhi NCR, made easy"
              copy="A focused delivery footprint means fresher flowers, better timing, and fewer miles between us and your door."
            />
          </Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal className="relative min-h-[310px] overflow-hidden rounded-xl bg-blush">
              <div className="absolute inset-8 rounded-full border border-ink/10" />
              <div className="absolute inset-20 rounded-full border border-ink/10" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-ivory px-4 py-2 text-sm font-semibold shadow-lg">
                <MapPin size={15} className="text-gold" /> Delhi NCR
              </div>
            </Reveal>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-2 gap-x-8 gap-y-7 self-center"
            >
              {deliveryAreas.map((area) => (
                <motion.div
                  variants={reveal}
                  key={area.id}
                  className="border-b border-ink/10 pb-4"
                >
                  <p className="font-display text-xl text-ink">{area.name}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {area.pincode.length ? `${area.pincode.join(" · ")} · ` : ""}
                    Porter charge ₹{area.deliveryFee}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {homepage.offers.length > 0 && (
        <section className="mx-5 grid gap-4 md:mx-10 md:grid-cols-2">
          {homepage.offers.map((offer) => (
            <Reveal key={offer.id}>
              <div className="overflow-hidden rounded-xl bg-gold px-7 py-12 md:px-16 md:py-16">
                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
                      {offer.badge}
                    </p>
                    <h2 className="max-w-2xl text-4xl text-ink md:text-5xl">
                      {offer.title}
                    </h2>
                    {offer.copy && (
                      <p className="mt-4 max-w-lg text-sm leading-6 text-ink/70">
                        {offer.copy}
                      </p>
                    )}
                  </div>
                  <Link
                    href={offer.ctaHref}
                    className="inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
                  >
                    {offer.ctaLabel} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </section>
      )}

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="Kind words"
              title="What our customers say"
              href="/reviews"
              linkLabel="Read all reviews"
            />
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {heroReviews.map((review) => (
              <motion.div
                variants={reveal}
                key={review.id}
                className="rounded-lg bg-white/75 p-7"
              >
                <Quote size={23} className="mb-7 text-gold" />
                <div className="mb-5 flex gap-1 text-gold">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index < review.rating ? "text-gold" : "text-ink/15"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="min-h-24 font-display text-2xl leading-snug text-ink">
                  &quot;{review.comment}&quot;
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4 text-xs">
                  <span className="font-bold text-ink">
                    {review.customerName}
                  </span>
                  <span className="text-ink-soft">Verified purchase</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <InstagramFeed />

      <section id="faq" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[0.7fr_1.3fr]">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
              Need to know
            </p>
            <h2 className="text-4xl leading-tight text-ink md:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mt-5 text-sm leading-7 text-ink-soft">
              Still curious? Our team is one message away.
            </p>
            <Link
              href="/faq"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-ink"
            >
              Visit the FAQ <ArrowRight size={16} />
            </Link>
          </Reveal>
          <Reveal>
            <div>
              {faqs.slice(0, 3).map((item) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  open={openFaq === item.id}
                  onToggle={() =>
                    setOpenFaq(openFaq === item.id ? null : item.id)
                  }
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <section className="border-y border-ink/10 bg-ivory-deep px-5 py-14 md:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="font-display text-3xl text-ink">
                Fresh notes, occasional offers.
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Join the list or say hello on WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory"
              >
                Join the newsletter <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-ivory px-5 py-3 text-sm font-semibold text-ink"
              >
                WhatsApp us
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
