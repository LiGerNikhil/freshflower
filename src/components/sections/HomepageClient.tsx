"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Camera as Instagram,
  Check,
  ChevronDown,
  Clock3,
  Flower2,
  Leaf,
  MapPin,
  Quote,
  Sparkles,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/sections/ProductCard";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
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
const galleryTokens = [
  "https://content.jdmagicbox.com/comp/srinagar/d7/9999px194.x194.190617094002.n2d7/catalogue/flower-gallery-srinagar-0kfk0kiokt.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQndDdXFvkhtyUjrTmPaskzwfxmcBToh4R7EIpKHYq_O7bM86U3c0KaH3cS&s=10",
  "https://png.pngtree.com/thumb_back/fh260/background/20240704/pngtree-beautiful-flowers-in-the-garden-image_15852403.jpg",
  "https://fiorellaindia.com/images/decor/decor_5.webp",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRueA0blnNs5R7kEsyhUAQoBp09Y3ujrX6kXaA2a2fK8G_VMTeXtzL9z1t&s=10",
  "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,f_jpg,h_555,q_65,w_639/v1/crm/manitowocwi/IMG_4252_CD42D96E-035A-48F4-88102AA393E2B7C2-cd42d112a8b53a9_cd42dde4-b4a7-0178-ca9f9bdddd812226.jpg",
];

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
  const bestSellers = flowers.filter((flower) => flower.featured);
  const freshToday = flowers.filter((flower) => flower.availableToday);
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
              Same morning flower delivery · Delhi NCR
            </p>
            <h1 className="max-w-4xl text-5xl leading-[0.98] text-ink md:text-7xl lg:text-[5.8rem]">
              Fresh Flowers.
              <br />
              <em className="text-gold">Fresh Mornings.</em>
              <br />
              Delivered to
              <br className="md:hidden" /> Your Door.
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-ink-soft">
              Thoughtfully gathered blooms, delivered across Delhi NCR while the
              city is still waking up.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#shop"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
              >
                Shop Flowers <ArrowRight size={16} />
              </Link>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white/35 px-6 py-3.5 text-sm font-semibold text-ink"
              >
                Book a Delivery <Clock3 size={16} />
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
            className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
          >
            {bestSellers.map((flower) => (
              <ProductCard
                key={flower.id}
                flower={flower}
                onQuickView={setQuickView}
              />
            ))}
          </motion.div>
        </div>
      </section>

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
            className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
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

      <Reveal>
        <section
          id="delivery"
          className="mx-5 overflow-hidden rounded-xl bg-sage px-7 py-12 md:mx-10 md:px-16 md:py-16"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
                Made for early starts
              </p>
              <h2 className="text-4xl text-ink md:text-6xl">5 AM – 12 PM</h2>
              <p className="mt-3 text-sm text-ink-soft">
                Morning delivery across Delhi NCR, before the day gets busy.
              </p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
            >
              Book your delivery <ArrowRight size={16} />
            </Link>
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
                    {area.pincode.join(" · ")} · from ₹{area.deliveryFee}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-5 overflow-hidden rounded-xl bg-gold px-7 py-12 md:mx-10 md:px-16 md:py-16">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
                For hotels, offices & celebrations
              </p>
              <h2 className="max-w-2xl text-4xl text-ink md:text-5xl">
                A lot of flowers? Let&apos;s make it effortless.
              </h2>
            </div>
            <Link
              href="/wholesale"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
            >
              Request a quote <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </Reveal>

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
            {reviews.slice(0, 3).map((review) => (
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

      <section className="bg-lavender px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionIntro
              eyebrow="From our studio"
              title="A little flower joy for your feed"
            />
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 gap-3 md:grid-cols-3"
          >
            {galleryTokens.map((token, index) => (
              <motion.div
                variants={reveal}
                key={`${token}-${index}`}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-lg ${index === 1 ? "md:row-span-2 md:aspect-auto" : ""}`}
              >
                <Image
                  src={token}
                  alt={`FreshFlower.zone on Instagram ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                {index === 0 && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ivory/75 px-3 py-2 text-xs text-ink">
                    <Instagram size={13} /> @freshflower.zone
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
