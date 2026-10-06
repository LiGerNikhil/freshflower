"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";

export function CartCta() {
  const { itemCount } = useCart();

  return (
    <section className="border-y border-ink/10 bg-ivory-deep px-5 py-12 md:px-10 md:py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-3xl leading-tight text-ink">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? "stem" : "stems"} waiting in your bag.`
              : "Your bag is ready when you are."}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Same-day across Delhi NCR when you order before the morning cut.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:flex sm:w-auto">
          <Link
            href="/cart"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory transition active:scale-[0.98] sm:w-auto"
          >
            <ShoppingBag size={16} />
            {itemCount > 0 ? "Review bag" : "View bag"}
          </Link>
          <Link
            href="/flowers"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-ink/15 bg-ivory px-6 py-3.5 text-sm font-semibold text-ink transition active:scale-[0.98] sm:w-auto"
          >
            Keep shopping <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
