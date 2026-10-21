"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flower2 } from "lucide-react";
import { ProductCard } from "@/components/sections/ProductCard";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { CartCta } from "@/components/home/CartCta";
import { Hero } from "@/components/home/Hero";
import { StorefrontHero } from "@/components/home/StorefrontHero";
import { ProductRail } from "@/components/home/ProductRail";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { FestivalBanner } from "@/components/home/FestivalBanner";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TrustStrip } from "@/components/home/TrustStrip";
import {
  ProductGrid,
  Reveal,
  Section,
  SectionIntro,
  reveal,
  stagger,
} from "@/components/home/primitives";
import { isOnSale } from "@/lib/pricing";
import { GRADIENT_TOKENS } from "@/lib/utils";
import { hasFestivalHomepageConfig } from "@/lib/festivals";
import type {
  Category,
  FestivalCollection,
  Flower,
  HomepageConfig,
  HomepageSectionId,
  Occasion,
} from "@/lib/types";

interface HomepageClientProps {
  categories: Category[];
  flowers: Flower[];
  occasions: Occasion[];
  homepage: HomepageConfig;
  festivalCollections: FestivalCollection[];
  storefrontHero?: boolean;
}

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

const colourTokens: Record<string, string> = {
  Red: "#c2413b",
  Pink: "#e9a4b2",
  White: "#fffaf0",
  Yellow: "#e6bd45",
  Orange: "#e8792e",
  Purple: "#8b5fbf",
};

export default function HomepageClient({
  categories,
  flowers,
  occasions,
  homepage,
  festivalCollections,
  storefrontHero = true,
}: HomepageClientProps) {
  const [quickView, setQuickView] = useState<Flower | null>(null);
  const [selectedColour, setSelectedColour] = useState("Red");

  const featured = useMemo(() => {
    const selected = homepage.featuredFlowerIds
      .map((id) => flowers.find((flower) => flower.id === id))
      .filter((flower): flower is Flower => Boolean(flower));
    return selected.length > 0
      ? selected
      : flowers.filter((flower) => flower.featured);
  }, [homepage.featuredFlowerIds, flowers]);

  const onSale = useMemo(() => flowers.filter(isOnSale).slice(0, 8), [flowers]);

  const newArrivals = useMemo(() => {
    const fresh = flowers.filter((flower) => flower.newArrival);
    return (fresh.length ? fresh : flowers)
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 8);
  }, [flowers]);

  const freshToday = useMemo(
    () => flowers.filter((flower) => flower.availableToday).slice(0, 4),
    [flowers],
  );

  const colourFlowers = useMemo(
    () =>
      flowers
        .filter((flower) =>
          flower.colorVariants?.some(
            (variant) =>
              variant.color.toLowerCase() === selectedColour.toLowerCase(),
          ),
        )
        .slice(0, 4),
    [flowers, selectedColour],
  );

  const findOccasion = (name: string) =>
    occasions.find((occasion) => occasion.name === name) ??
    occasions.find((occasion) => occasion.slug === "just-because");

  const categorySection = (
    <Section id="shop">
      <Reveal>
        <SectionIntro
          eyebrow="Find your bloom"
          title="Shop by category"
          href="/categories"
          linkLabel="See all categories"
        />
      </Reveal>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="flex snap-x gap-4 overflow-x-auto pb-6 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6"
      >
        {categories.slice(0, 6).map((category) => (
          <motion.div
            variants={reveal}
            key={category.id}
            className="min-w-[180px] snap-start sm:min-w-[210px]"
          >
            <Link href={`/categories/${category.slug}`} className="group block">
              <div
                className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg"
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
                    sizes="(max-width: 768px) 180px, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <Flower2
                    size={82}
                    strokeWidth={0.65}
                    className="text-ink/25 transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <span className="absolute bottom-4 left-4 right-4 rounded-full bg-ivory/75 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
                  {category.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
  const onSaleSection = (
    <ProductRail
      eyebrow="Prices just dropped"
      title="On sale now"
      copy="The same stems, a little kinder on the wallet."
      href="/flowers"
      linkLabel="All offers"
      flowers={onSale}
      onQuickView={setQuickView}
      className="bg-white/60"
    />
  );
  const bestSellersSection = (
    <ProductRail
      eyebrow="Most loved"
      title="Best sellers"
      href="/categories"
      linkLabel="See all categories"
      flowers={featured}
      onQuickView={setQuickView}
      className="bg-ivory-deep"
    />
  );
  const newArrivalsSection = (
    <ProductRail
      eyebrow="Just landed"
      title="New arrivals"
      href="/flowers?sort=new"
      linkLabel="See everything new"
      flowers={newArrivals}
      onQuickView={setQuickView}
    />
  );
  const renderOffers = (offers: HomepageConfig["offers"]): ReactNode =>
    offers.length > 0 ? (
      <section className="grid gap-4 px-5 py-8 sm:px-6 md:grid-cols-2 md:px-10 md:py-12">
        {offers.map((offer) => (
          <Reveal key={offer.id}>
            <div className="overflow-hidden rounded-xl bg-gold px-7 py-10 md:px-14 md:py-14">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
                    {offer.badge}
                  </p>
                  <h2 className="max-w-2xl text-3xl text-ink md:text-4xl">
                    {offer.title}
                  </h2>
                  {offer.copy && (
                    <p className="mt-3 max-w-lg text-sm leading-6 text-ink/70">
                      {offer.copy}
                    </p>
                  )}
                </div>
                <Link
                  href={offer.ctaHref}
                  className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory transition active:scale-[0.98]"
                >
                  {offer.ctaLabel} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    ) : null;
  const offersSection = renderOffers(homepage.offers);
  const wholesaleSection = renderOffers(
    homepage.offers.filter((offer) => offer.ctaHref === "/wholesale"),
  );
  const freshTodaySection = homepage.showsFreshToday ? (
    <ProductRail
      eyebrow="Picked this morning"
      title="Today's fresh flowers"
      copy="Ready to leave our studio and arrive at yours."
      href="/flowers?availability=today"
      linkLabel="See all flowers"
      flowers={freshToday}
      onQuickView={setQuickView}
      className="bg-ivory-deep"
    />
  ) : null;
  const occasionSection = (
      <Section>
        <Reveal>
          <SectionIntro eyebrow="For every feeling" title="Flowers by occasion" />
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
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/50 p-4 backdrop-blur-sm">
                        <h3 className="font-display text-xl text-ivory sm:text-2xl">
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
      </Section>
  );
  const colourSection = (
    <Section className="bg-white/55">
        <Reveal>
          <SectionIntro
            eyebrow="Shop by colour"
            title="Pick a mood first"
            copy="Choose a colour and matching stems come up straight away."
            href="/flowers"
            linkLabel="Browse all colours"
          />
        </Reveal>
        <div className="mb-8 flex snap-x gap-2 overflow-x-auto pb-4">
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
        <ProductGrid>
          {(colourFlowers.length ? colourFlowers : featured.slice(0, 4)).map(
            (flower) => (
              <ProductCard
                key={`${selectedColour}-${flower.id}`}
                flower={flower}
                onQuickView={setQuickView}
              />
            ),
          )}
        </ProductGrid>
      </Section>
  );

  const legacySections = [
    categorySection,
    onSaleSection,
    bestSellersSection,
    newArrivalsSection,
    offersSection,
    freshTodaySection,
    occasionSection,
    colourSection,
    <TrustStrip key="trust" />,
    <CartCta key="cart-cta" />,
  ];

  const selectedCollections = useMemo(() => {
    const live = homepage.festivalCollectionIds?.length
      ? homepage.festivalCollectionIds
          .map((id) => festivalCollections.find((collection) => collection.id === id))
          .filter((collection): collection is FestivalCollection => Boolean(collection))
      : festivalCollections;
    return live;
  }, [festivalCollections, homepage.festivalCollectionIds]);

  const configuredHomepage =
    hasFestivalHomepageConfig(homepage) && selectedCollections.length > 0;

  if (!configuredHomepage) {
    return (
      <main className="overflow-hidden bg-ivory">
        <Hero
          hero={homepage.hero}
          categories={categories}
          collections={selectedCollections}
        />
        {legacySections.map((section, index) => (
          <Fragment key={index}>{section}</Fragment>
        ))}
        <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
      </main>
    );
  }

  const selectedCategories = homepage.categoryIds?.length
    ? homepage.categoryIds
        .map((id) => categories.find((category) => category.id === id))
        .filter((category): category is Category => Boolean(category))
    : categories;
  const productsInOrder = (ids: string[]) =>
    [...new Set(ids)]
      .map((id) => flowers.find((flower) => flower.id === id))
      .filter((flower): flower is Flower => Boolean(flower));
  const specialIds = selectedCollections.flatMap((collection) => collection.productIds);
  const curatedFestivalSpecials = productsInOrder(specialIds);
  const festivalSpecials = curatedFestivalSpecials.length
    ? curatedFestivalSpecials
    : flowers.filter(
        (flower) =>
          flower.badges?.includes("festival-special") ||
          (flower.festivalTags?.length ?? 0) > 0,
      );
  const poojaIds = selectedCollections
    .filter((collection) => collection.poojaCollection)
    .flatMap((collection) => collection.productIds);
  const curatedPoojaEssentials = productsInOrder(poojaIds);
  const poojaEssentials = [
    ...curatedPoojaEssentials,
    ...flowers.filter(
      (flower) =>
        flower.poojaEligible &&
        !curatedPoojaEssentials.some((selected) => selected.id === flower.id),
    ),
  ];

  const sectionContent: Record<HomepageSectionId, ReactNode> = {
    categories: <CategoryCarousel categories={selectedCategories} />,
    "festival-specials": (
      <ProductCarousel
        eyebrow="Made for the celebration"
        title="Festival Specials"
        flowers={festivalSpecials}
        onQuickView={setQuickView}
        className="bg-white/60"
      />
    ),
    "pooja-essentials": (
      <ProductCarousel
        eyebrow="For your rituals"
        title="Pooja Essentials"
        copy="Fresh flowers and malas selected for your morning pooja."
        flowers={poojaEssentials}
        onQuickView={setQuickView}
      />
    ),
    "on-sale": onSaleSection,
    "best-sellers": bestSellersSection,
    "new-arrivals": newArrivalsSection,
    offers: offersSection,
    "fresh-today": freshTodaySection,
    occasions: occasionSection,
    colours: colourSection,
    wholesale: wholesaleSection,
    reviews: <TrustStrip />,
    trust: <TrustStrip />,
    "cart-cta": <CartCta />,
  };

  const orderedSections = [...(homepage.sections ?? [])]
    .filter((section) => section.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((section) => (
      <Fragment key={section.id}>{sectionContent[section.id]}</Fragment>
    ));

  return (
    <main className="overflow-hidden bg-ivory">
      <Hero
        hero={homepage.hero}
        categories={categories}
        collections={selectedCollections}
      />
      <FestivalBanner
        collections={selectedCollections}
        showCutoff={homepage.salesBoosters?.collectionCutoff === true}
      />
      {orderedSections}
      <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
