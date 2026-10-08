"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionIntro, reveal, stagger } from "@/components/home/primitives";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Occasion } from "@/lib/types";

interface Guide {
  key: string;
  title: string;
  note: string;
  gradient: string;
  max?: number;
  occasionSlug?: string;
}

const GUIDES: Guide[] = [
  {
    key: "under-499",
    title: "Gifts under ₹499",
    note: "Small, still thoughtful",
    gradient: "gradient-sage",
    max: 499,
  },
  {
    key: "under-999",
    title: "Gifts under ₹999",
    note: "Everyday gifting",
    gradient: "gradient-blush",
    max: 999,
  },
  {
    key: "birthday",
    title: "Birthday",
    note: "Bright, cheerful bunches",
    gradient: "gradient-gold",
    occasionSlug: "birthday",
  },
  {
    key: "anniversary",
    title: "Anniversary",
    note: "Roses & lilies",
    gradient: "gradient-blush",
    occasionSlug: "anniversary",
  },
  {
    key: "pooja",
    title: "Pooja & Festivals",
    note: "Traditional stems",
    gradient: "gradient-ivory",
    occasionSlug: "pooja-festivals",
  },
  {
    key: "wedding",
    title: "Wedding",
    note: "Event-scale florals",
    gradient: "gradient-lavender",
    occasionSlug: "wedding",
  },
];

function guideHref(guide: Guide, occasions: Occasion[]): string {
  if (guide.max !== undefined) return `/flowers?max=${guide.max}`;
  const occasion = occasions.find((item) => item.slug === guide.occasionSlug);
  return occasion ? `/flowers?occasion=${occasion.id}` : "/flowers";
}

export function GiftGuides({ occasions }: { occasions: Occasion[] }) {
  return (
    <section className="bg-white/55 px-5 py-20 sm:px-6 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionIntro
            eyebrow="Shop by occasion"
            title="Picked for the moment"
            copy="One tap drops you straight into a filtered shelf."
            href="/flowers"
            linkLabel="Browse everything"
          />
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {GUIDES.map((guide) => (
            <motion.div variants={reveal} key={guide.key} className="h-full">
              <Link
                href={guideHref(guide, occasions)}
                className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-lg p-4 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[220px] sm:p-5"
                style={{ background: GRADIENT_TOKENS[guide.gradient] }}
              >
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink/45">
                  {guide.note}
                </span>
                <span className="flex items-end justify-between gap-2">
                  <span className="font-display text-xl leading-tight text-ink sm:text-2xl">
                    {guide.title}
                  </span>
                  <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60 text-ink transition-transform group-hover:translate-x-1">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
