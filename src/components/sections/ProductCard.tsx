"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { Bike, Flower2, Heart, Plus, ShoppingBag, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DELIVERY_CHARGE } from "@/lib/cart";
import {
  discountPercent,
  effectiveCompareAtPrice,
  lowestPrice,
} from "@/lib/pricing";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import type { Flower } from "@/lib/types";
import { useCart } from "@/components/providers/CartContext";
import { useWishlist } from "@/components/providers/WishlistContext";

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const estimatedDeliveryLabel = "Estimated delivery by Tomorrow 11:00AM";

interface ProductCardProps {
  flower: Flower;
  onQuickView: (flower: Flower) => void;
  onAdd?: () => void;
  onBuyNow?: () => void;
}

export function ProductCard({
  flower,
  onQuickView,
  onAdd,
  onBuyNow,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { has: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const status = !flower.inStock
    ? { label: "Sold Out", tone: "blush" as const }
    : flower.featured
      ? { label: "Limited Stock", tone: "gold" as const }
      : flower.availableToday
        ? { label: "Available Today", tone: "sage" as const }
        : { label: "Pre-order", tone: "lavender" as const };
  const variants = flower.colorVariants ?? [];
  const displayPrice = lowestPrice(flower);
  const compareAtPrice = effectiveCompareAtPrice(flower);
  const discount = discountPercent(flower);
  const href = `/flowers/${flower.slug}`;

  return (
    <motion.article
      variants={cardReveal}
      className="group flex h-full min-w-0 flex-col"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[0.88]"
        style={{
          background: isRemoteImage(flower.images[0])
            ? undefined
            : GRADIENT_TOKENS[flower.images[0]],
        }}
      >
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 block"
        >
          {isRemoteImage(flower.images[0]) ? (
            <Image
              src={flower.images[0]}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Flower2 size={104} strokeWidth={0.7} className="text-ink/25" />
            </span>
          )}
        </Link>

        <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
          {discount !== null ? (
            <Badge tone="gold">{discount}% OFF</Badge>
          ) : (
            <Badge tone={status.tone}>{status.label}</Badge>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isWishlisted(flower.id)
              ? `Remove ${flower.name} from wishlist`
              : `Add ${flower.name} to wishlist`
          }
          onClick={() => toggleWishlist(flower.id)}
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/75 text-ink backdrop-blur-sm transition hover:bg-ivory active:scale-95 sm:right-4 sm:top-4"
        >
          <Heart
            size={17}
            fill={isWishlisted(flower.id) ? "currentColor" : "none"}
            className={isWishlisted(flower.id) ? "text-gold" : ""}
          />
        </button>

        <button
          type="button"
          onClick={() => onQuickView(flower)}
          className="absolute bottom-3 left-3 right-3 z-20 min-h-11 rounded-sm bg-ivory/90 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink backdrop-blur transition-opacity hover:bg-ivory active:scale-[0.98] md:bottom-4 md:left-4 md:right-4 md:text-xs md:opacity-0 md:group-hover:opacity-100"
        >
          Quick view
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 pt-3 sm:pt-4">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[2.5em] font-display text-lg leading-tight text-ink sm:text-xl">
            <Link href={href} className="hover:text-gold">
              {flower.name}
            </Link>
          </h3>
          <p className="mt-1 truncate text-[11px] text-ink-soft sm:text-xs">
            {flower.stemCount ?? flower.quantity
              ? `${flower.stemCount ?? flower.quantity} ${flower.unit?.toLowerCase() ?? "stems"}`
              : "Fresh seasonal bunch"}
          </p>
          <div
            className="mt-2 flex min-h-7 flex-wrap items-center gap-1.5"
            aria-label={`${flower.name} colours`}
          >
            {variants.slice(0, 6).map((variant) => (
              <span
                key={variant.color}
                title={variant.color}
                className="h-3 w-3 rounded-full border border-ink/10"
                style={{
                  background: isRemoteImage(variant.image)
                    ? "conic-gradient(#e5e7eb, #9ca3af)"
                    : GRADIENT_TOKENS[variant.image ?? ""] ??
                      "conic-gradient(#e5e7eb, #9ca3af)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col justify-end gap-0.5 text-right">
          {compareAtPrice ? (
            <p className="text-xs text-ink-soft line-through">
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </p>
          ) : null}
          <p className="text-sm font-bold text-ink">
            {variants.length ? "From " : ""}₹{displayPrice.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col">
        <div className="mt-3 flex items-start gap-2 rounded-md bg-sage/65 px-2.5 py-2 text-[10px] font-semibold leading-5 text-sage-ink sm:mt-4 sm:px-3 sm:text-xs">
          <Bike size={16} className="mt-0.5 shrink-0" />
          <span>
            {estimatedDeliveryLabel} · Porter ₹{DELIVERY_CHARGE}
          </span>
        </div>

        <div className={`mt-3 grid gap-2 ${onBuyNow ? "grid-cols-2" : ""}`}>
          <button
            type="button"
            onClick={() => {
              addItem({
                productId: flower.id,
                productType: "flower",
                name: flower.name,
                price: flower.price,
                quantity: 1,
                image: flower.images[0],
              });
              onAdd?.();
            }}
            disabled={!flower.inStock}
            className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-blush bg-blush/85 px-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-blush active:scale-[0.98] disabled:bg-ink/5 disabled:text-ink-soft sm:text-xs"
          >
            {flower.inStock ? <Plus size={15} /> : <X size={15} />}
            {flower.inStock ? "Add" : "Unavailable"}
          </button>
          {onBuyNow && flower.inStock && (
            <button
              type="button"
              onClick={onBuyNow}
              className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-gold/30 bg-ivory-deep px-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink transition hover:bg-gold/25 active:scale-[0.98] sm:text-xs"
            >
              Buy now <ShoppingBag size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
