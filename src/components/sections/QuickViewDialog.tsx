"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flower2, Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import { useCart } from "@/components/providers/CartContext";
import type { Flower } from "@/lib/types";

export function QuickViewDialog({
  flower,
  onClose,
}: {
  flower: Flower | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const status = !flower?.inStock
    ? { label: "Sold Out", tone: "blush" as const }
    : flower.availableToday
      ? { label: "Available Today", tone: "sage" as const }
      : { label: "Pre-order", tone: "lavender" as const };

  const addToCart = () => {
    if (!flower) return;
    addItem({
      productId: flower.id,
      productType: "flower",
      name: flower.name,
      price: flower.price,
      quantity,
      image: flower.images[0],
    });
    onClose();
  };

  return (
    <Modal
      open={Boolean(flower)}
      onClose={onClose}
      className="max-w-3xl p-0 sm:p-0"
    >
      {flower && (
        <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
          <Link
            href={`/flowers/${flower.slug}`}
            onClick={onClose}
            aria-label={`View full details of ${flower.name}`}
            className="group block min-h-[190px] overflow-hidden rounded-t-lg md:min-h-full md:rounded-bl-lg md:rounded-tr-none"
            style={{
              background: isRemoteImage(flower.images[0])
                ? undefined
                : GRADIENT_TOKENS[flower.images[0]],
            }}
          >
            {isRemoteImage(flower.images[0]) ? (
              <div className="relative h-full min-h-[190px] w-full md:min-h-full">
                <Image
                  src={flower.images[0]}
                  alt={flower.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 24rem"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[190px] w-full items-center justify-center md:min-h-full">
                <Flower2
                  size={110}
                  strokeWidth={0.5}
                  className="text-ink/25"
                />
              </div>
            )}
          </Link>
          <div className="flex flex-col pt-6 md:pt-10">
            <div className="px-6 md:pr-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
                  {flower.availableToday ? "Available today" : "Pre-order"}
                </p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <h2 className="pr-6 text-3xl leading-tight text-ink">
                {flower.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                {flower.shortDescription}
              </p>
              <p className="mt-4 text-sm leading-6 text-ink-soft">
                {flower.stemCount ?? flower.quantity
                  ? `${flower.stemCount ?? flower.quantity} ${flower.unit?.toLowerCase() ?? "stems"}`
                  : "Fresh seasonal bunch"}
              </p>
            </div>
            <div className="mt-8 flex-1 border-t border-ink/10 px-6 py-6 md:pr-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  {flower.compareAtPrice && flower.compareAtPrice > flower.price ? (
                    <p className="text-sm text-ink-soft line-through">
                      ₹{flower.compareAtPrice.toLocaleString("en-IN")}
                    </p>
                  ) : null}
                  <span className="text-2xl font-bold text-ink">
                    ₹{flower.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  className="flex items-center gap-4 rounded-md border border-ink/10 bg-white/50 px-3 py-2"
                  aria-label={`Quantity, currently ${quantity}`}
                >
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-ink transition hover:text-gold"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-5 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-ink transition hover:text-gold"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <Button
                disabled={!flower.inStock}
                className="mt-5 w-full"
                onClick={addToCart}
              >
                {flower.inStock
                  ? `Add ${quantity} to cart`
                  : "Currently unavailable"}{" "}
                <Plus size={16} />
              </Button>
              <Link
                href={`/flowers/${flower.slug}`}
                onClick={onClose}
                className="mt-4 block text-center text-sm font-semibold text-gold underline-offset-4 hover:underline"
              >
                View full details <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
