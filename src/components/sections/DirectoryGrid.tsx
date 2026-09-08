"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Flower2 } from "lucide-react";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Category, Occasion } from "@/lib/types";

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function CategoryDirectory({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  return (
    <DirectoryShell
      basePath="/categories"
      eyebrow="Find your flower"
      title="A world of beautiful stems."
      copy="From familiar favourites to fragrant Delhi classics, browse by bloom and find the right feeling for your space."
      items={categories.map((item) => ({
        ...item,
        count: counts[item.id] ?? 0,
      }))}
    />
  );
}

export function OccasionDirectory({ occasions }: { occasions: Occasion[] }) {
  return (
    <DirectoryShell
      basePath="/occasions"
      eyebrow="Flowers for the feeling"
      title="Give the moment a little more life."
      copy="A considered bloom can say congratulations, I love you, thank you, or simply I was thinking of you."
      video="/assets/video/bg2.mp4"
      items={occasions.map((item) => ({
        ...item,
        heroImage: [
          "gradient-blush",
          "gradient-gold",
          "gradient-lavender",
          "gradient-sage",
        ][item.name.length % 4],
        count: undefined,
      }))}
    />
  );
}

function DirectoryShell({
  basePath,
  eyebrow,
  title,
  copy,
  video,
  items,
}: {
  basePath: string;
  eyebrow: string;
  title: string;
  copy: string;
  video?: string;
  items: Array<Category & { count?: number }>;
}) {
  return (
    <main className="min-h-screen bg-ivory">
      <section className="relative overflow-hidden bg-ivory-deep px-5 py-20 md:px-10 md:py-28">
        {video && <HeroVideo src={video} />}
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-5xl leading-none text-ink md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-ink-soft">
            {copy}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <motion.article key={item.id} variants={reveal}>
              <Link href={`${basePath}/${item.slug}`} className="group block">
                <div
                  className="relative flex aspect-[1.15] items-center justify-center overflow-hidden rounded-xl"
                  style={{ background: GRADIENT_TOKENS[item.heroImage] }}
                >
                  <Flower2
                    size={105}
                    strokeWidth={0.5}
                    className="text-ink/20 transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute bottom-5 left-5 font-display text-3xl text-ink">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 px-1 pt-4">
                  <p className="max-w-sm text-sm leading-6 text-ink-soft">
                    {item.description}
                  </p>
                  {item.count !== undefined && (
                    <span className="whitespace-nowrap text-xs text-ink-soft">
                      {item.count} flowers
                    </span>
                  )}
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
