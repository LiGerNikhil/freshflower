"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Flower2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { useCart } from "@/components/providers/CartContext";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Bouquet } from "@/lib/types";

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
export function BouquetCard({
  bouquet,
  onAdd,
}: {
  bouquet: Bouquet;
  onAdd?: () => void;
}) {
  const { addItem } = useCart();
  return (
    <motion.article variants={reveal} className="group">
      <Link href={`/bouquets/${bouquet.slug}`}>
        <div
          className="relative flex aspect-[0.9] items-center justify-center overflow-hidden rounded-lg"
          style={{ background: GRADIENT_TOKENS[bouquet.images[0]] }}
        >
          <Flower2
            size={130}
            strokeWidth={0.5}
            className="text-ink/20 transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute left-4 top-4">
            {bouquet.featured && <Badge tone="gold">Signature</Badge>}
          </div>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <Link
            href={`/bouquets/${bouquet.slug}`}
            className="font-display text-2xl text-ink"
          >
            {bouquet.name}
          </Link>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            {bouquet.description}
          </p>
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-ink">
          ₹{bouquet.price.toLocaleString("en-IN")}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          addItem({
            productId: bouquet.id,
            productType: "bouquet",
            name: bouquet.name,
            price: bouquet.price,
            quantity: 1,
            image: bouquet.images[0],
          });
          onAdd?.();
        }}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
      >
        {" "}
        <Plus size={15} /> Add to cart
      </button>
    </motion.article>
  );
}

export function BouquetListing({ bouquets }: { bouquets: Bouquet[] }) {
  return (
    <main className="min-h-screen bg-ivory">
      <section className="relative overflow-hidden bg-blush px-5 py-20 md:px-10 md:py-28">
        <HeroVideo />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            Arranged with intention
          </p>
          <h1 className="max-w-3xl text-5xl leading-none md:text-7xl">
            Bouquets for the beautiful bits.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-ink-soft">
            Our hand-tied bouquets bring together colour, fragrance, and a
            little ceremony. Choose a signature arrangement or tell us what you
            have in mind.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              The studio edit
            </p>
            <h2 className="text-4xl">Premium bouquets</h2>
          </div>
          <span className="text-sm text-ink-soft">
            {bouquets.length} arrangements
          </span>
        </div>
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {bouquets.map((bouquet) => (
            <BouquetCard key={bouquet.id} bouquet={bouquet} />
          ))}
        </motion.div>
      </section>
      <CustomBouquetForm />
    </main>
  );
}

function CustomBouquetForm() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    console.log(
      "TODO Phase 5: POST custom bouquet enquiry to the real API",
      payload,
    );
    setSubmitted(true);
    event.currentTarget.reset();
  };
  return (
    <section className="bg-ink px-5 py-20 text-ivory md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
            Made for you
          </p>
          <h2 className="text-4xl md:text-5xl">Request a custom bouquet.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-ivory/60">
            Tell us the feeling, the budget, and the occasion. Our floral team
            will shape a considered proposal for you.
          </p>
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <input
            required
            name="name"
            placeholder="Your name"
            className="rounded-md bg-ivory/10 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory/45"
          />
          <input
            required
            name="phone"
            placeholder="Phone number"
            className="rounded-md bg-ivory/10 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory/45"
          />
          <input
            required
            name="occasion"
            placeholder="Occasion"
            className="rounded-md bg-ivory/10 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory/45"
          />
          <input
            required
            name="budget"
            placeholder="Budget range"
            className="rounded-md bg-ivory/10 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory/45"
          />
          <textarea
            required
            name="description"
            placeholder="Tell us about the bouquet"
            rows={4}
            className="rounded-md bg-ivory/10 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory/45 sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink sm:col-span-2"
          >
            {submitted ? "Enquiry received" : "Request custom bouquet"}
          </button>
          {submitted && (
            <p className="text-sm text-gold-soft sm:col-span-2">
              Thank you. We&apos;ll shape something lovely and get back to you.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
