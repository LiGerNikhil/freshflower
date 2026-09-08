"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Flower2,
  Minus,
  Plus,
  Sparkles,
  Truck,
} from "lucide-react";
import { DeliverySlotSelector } from "@/components/ui/DeliverySlotSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/sections/ProductCard";
import { useCart } from "@/components/providers/CartContext";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Bouquet, Flower } from "@/lib/types";

export default function BouquetDetailClient({
  bouquet,
  flowers,
  relatedBouquets,
}: {
  bouquet: Bouquet;
  flowers: Flower[];
  relatedBouquets: Bouquet[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [slotId, setSlotId] = useState("slot-6-7");
  const [date, setDate] = useState("");
  const bouquetFlowers = bouquet.items
    .map((item) => flowers.find((flower) => flower.id === item.flowerId))
    .filter(Boolean) as Flower[];
  const add = () =>
    addItem({
      productId: bouquet.id,
      productType: "bouquet",
      name: bouquet.name,
      price: bouquet.price,
      quantity,
      image: bouquet.images[0],
    });
  const buy = () => {
    add();
    router.push("/checkout");
  };
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div
            className="flex aspect-square items-center justify-center rounded-xl"
            style={{ background: GRADIENT_TOKENS[bouquet.images[0]] }}
          >
            <Flower2 size={240} strokeWidth={0.45} className="text-ink/20" />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
              Hand-tied studio arrangement
            </p>
            <h1 className="text-5xl md:text-6xl">{bouquet.name}</h1>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-2xl font-bold">
                ₹{bouquet.price.toLocaleString("en-IN")}
              </span>
              <Badge tone="sage">Made to order</Badge>
            </div>
            <p className="mt-6 text-base leading-8 text-ink-soft">
              {bouquet.description}
            </p>
            <div className="mt-8 border-y border-ink/10 py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center gap-4 rounded-md border border-ink/10 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <label
                htmlFor="bouquet-date"
                className="mt-7 flex items-center gap-2 text-sm font-semibold"
              >
                <CalendarDays size={16} className="text-gold" /> Delivery date
              </label>
              <input
                id="bouquet-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-3 w-full rounded-md border border-ink/10 bg-white/60 px-4 py-3 text-sm"
              />
              <p className="mb-3 mt-7 text-sm font-semibold">Delivery slot</p>
              <DeliverySlotSelector
                selectedSlotId={slotId}
                onChange={setSlotId}
              />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button size="lg" onClick={add}>
                Add to Cart <Plus size={17} />
              </Button>
              <Button size="lg" variant="gold" onClick={buy}>
                Buy Now <ArrowRight size={17} />
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-ink-soft">
              Added items stay in your cart — review and change quantities
              anytime from the cart icon. Checkout connects in a later phase.
            </p>
          </div>
        </div>
        <section className="mt-20 border-t border-ink/10 pt-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Sparkles className="mb-5 text-gold" />
              <h2 className="font-display text-3xl">What&apos;s inside</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                {bouquetFlowers.map((flower) => flower.name).join(", ")}.
              </p>
            </div>
            <div>
              <Truck className="mb-5 text-sage-ink" />
              <h2 className="font-display text-3xl">Freshly arranged</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Our studio prepares each bouquet close to dispatch, with a
                little room for every stem to breathe.
              </p>
            </div>
            <div>
              <CalendarDays className="mb-5 text-lavender-ink" />
              <h2 className="font-display text-3xl">Made for your moment</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Choose your date and morning slot above, then let us handle the
                beautiful details.
              </p>
            </div>
          </div>
        </section>
        {relatedBouquets.length > 0 && (
          <section className="mt-20 bg-ivory-deep px-6 py-16">
            <h2 className="mb-8 text-4xl">More from the studio</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedBouquets.map((item) => (
                <Link
                  key={item.id}
                  href={`/bouquets/${item.slug}`}
                  className="group"
                >
                  <div
                    className="flex aspect-[1.1] items-center justify-center rounded-lg"
                    style={{ background: GRADIENT_TOKENS[item.images[0]] }}
                  >
                    <Flower2
                      size={100}
                      strokeWidth={0.5}
                      className="text-ink/20 transition-transform group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">{item.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
        {bouquetFlowers.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-4xl">The flowers within</h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {bouquetFlowers.map((flower) => (
                <ProductCard
                  key={flower.id}
                  flower={flower}
                  onQuickView={() => undefined}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
