"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function Reveal({
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

export function SectionIntro({
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
    <div className="mb-10 flex flex-col gap-5 md:items-end md:justify-between lg:mb-12 md:flex-row">
      <div className="max-w-xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          {eyebrow}
        </p>
        <h2 className="text-3xl leading-[1.05] text-ink md:text-5xl">
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
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink"
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

export const PRODUCT_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4";

/**
 * Full-bleed section wrapper: max-width container + horizontal padding.
 * The base spacing classes are always applied; `className` only ADDS extras
 * (backgrounds, refinements). It never replaces the section padding, so a
 * caller passing `className="bg-white/60"` cannot accidentally strip the
 * vertical rhythm and make content touch the neighbouring section.
 */
const SECTION_PADDING = "px-5 py-20 sm:px-6 md:px-10 md:py-24";
export function Section({
  id,
  children,
  className = "",
  innerClassName = "mx-auto max-w-7xl",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 ${SECTION_PADDING} ${className ?? ""}`.trim()}
    >
      <div className={innerClassName}>{children}</div>
    </section>
  );
}

/** Shared product grid + reveal animation. */
export function ProductGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      className={`${PRODUCT_GRID} ${className}`}
    >
      {children}
    </motion.div>
  );
}
