"use client";

import Link from "next/link";
import { ArrowRight, Check, Leaf, Sparkles, Truck } from "lucide-react";
import { Reveal } from "@/components/home/primitives";

const PROMISES = [
  {
    Icon: Leaf,
    title: "Cut fresh daily",
    copy: "Sourced straight from Ghazipur flower market.",
  },
  {
    Icon: Truck,
    title: "Same-day delivery",
    copy: "Across Delhi NCR through Porter.",
  },
  {
    Icon: Check,
    title: "Clear pricing",
    copy: "Delivery fee shown before you pay.",
  },
  {
    Icon: Sparkles,
    title: "Hand-checked",
    copy: "Every bunch inspected before dispatch.",
  },
];

export function TrustStrip() {
  return (
    <section id="delivery" className="bg-ink px-5 py-16 text-ivory md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">
                Delivered across Delhi NCR
              </p>
              <h2 className="text-3xl leading-tight md:text-4xl">
                Nothing between you and the flowers.
              </h2>
            </div>
            <Link
              href="/delivery"
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-soft"
            >
              Delivery areas
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4">
          {PROMISES.map(({ Icon, title, copy }) => (
            <Reveal key={title}>
              <div className="border-t border-ivory/20 pt-4">
                <Icon size={20} className="mb-5 text-gold-soft" aria-hidden="true" />
                <h3 className="font-display text-xl md:text-2xl">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-ivory/60 md:text-sm md:leading-6">
                  {copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
