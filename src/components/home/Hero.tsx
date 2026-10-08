"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Flower2, Leaf, MapPin, Truck } from "lucide-react";
import { Reveal } from "@/components/home/primitives";
import type { HomepageHeroConfig } from "@/lib/types";

const CHIPS = [
  { label: "Cut fresh this morning", Icon: Leaf },
  { label: "Delhi NCR wide", Icon: MapPin },
  { label: "Porter same-day", Icon: Truck },
];

export function Hero({ hero }: { hero: HomepageHeroConfig }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-blush px-5 pb-20 pt-24 sm:min-h-[640px] md:min-h-[720px] md:px-10 md:pb-24 md:pt-36">
      {!reduceMotion && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          src="/assets/video/bg1.mp4"
        />
      )}
      {/* Contrast scrim: heavy + vertical on mobile, weighted to the copy side on desktop. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-white/85 md:bg-gradient-to-r md:from-white/90 md:via-white/70 md:to-white/20" />

      {/* Decorative shapes are desktop-only so the mobile hero stays readable. */}
      <div className="absolute -right-24 top-24 hidden h-[480px] w-[480px] rounded-full border border-white/60 bg-white/20 md:block md:h-[620px] md:w-[620px]" />
      {!reduceMotion && (
        <motion.div
          animate={{ y: [0, -13, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[8%] top-[22%] hidden h-52 w-52 items-center justify-center rounded-full bg-ivory/25 md:flex md:h-80 md:w-80"
        >
          <Flower2 size={190} strokeWidth={0.45} className="text-ink/25 md:h-72 md:w-72" />
        </motion.div>
      )}

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-sage-ink">
            {hero.eyebrow}
          </p>
          <h1 className="max-w-4xl text-[2.4rem] leading-[0.98] text-ink min-[480px]:text-[2.6rem] sm:text-5xl md:text-7xl lg:text-[5.8rem]">
            {hero.titleLines.map((line, lineIndex) => (
              <span key={line}>
                {lineIndex === hero.accentLineIndex ? (
                  <>
                    <em className="text-gold">{line}</em>
                    <br />
                  </>
                ) : (
                  <>
                    {line}
                    <br
                      className={
                        lineIndex === hero.titleLines.length - 1 ? "md:hidden" : ""
                      }
                    />
                  </>
                )}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-ink-soft sm:text-base">
            {hero.subtitle}
          </p>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href={hero.ctaPrimaryHref}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory sm:w-auto"
            >
              {hero.ctaPrimaryLabel} <ArrowRight size={16} />
            </Link>
            <Link
              href={hero.ctaSecondaryHref}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/20 bg-white/60 px-6 py-3.5 text-sm font-semibold text-ink sm:w-auto"
            >
              {hero.ctaSecondaryLabel}
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/65 px-3 py-1.5 text-[0.7rem] font-semibold text-ink-soft backdrop-blur-sm sm:text-xs"
              >
                <Icon size={13} className="shrink-0 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <a
        href="#shop"
        aria-label="Scroll to shop"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-ink/60 md:block"
      >
        <ArrowDown size={20} />
      </a>
    </section>
  );
}
