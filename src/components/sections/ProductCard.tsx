"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { Flower2, Heart, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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

  return (
    <motion.article variants={cardReveal} className="group min-w-0">
      <div
        className="relative aspect-[0.88] overflow-hidden rounded-lg"
        style={{
          background: isRemoteImage(flower.images[0])
            ? undefined
            : GRADIENT_TOKENS[flower.images[0]],
        }}
      >
        {isRemoteImage(flower.images[0]) ? (
          <Image
            src={flower.images[0]}
            alt={flower.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <Flower2 size={104} strokeWidth={0.7} className="text-ink/25" />
          </div>
        )}
        <div className="absolute left-4 top-4">
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <button
          type="button"
          aria-label={
            isWishlisted(flower.id)
              ? `Remove ${flower.name} from wishlist`
              : `Add ${flower.name} to wishlist`
          }
          onClick={() => toggleWishlist(flower.id)}
          className="absolute right-4 top-4 rounded-full bg-ivory/75 p-2.5 text-ink backdrop-blur-sm transition hover:bg-ivory"
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
          className="absolute bottom-4 left-4 right-4 rounded-sm bg-ivory/85 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-ink opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
        >
          Quick view
        </button>
      </div>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <h3 className="font-display text-xl leading-tight text-ink">
            {flower.name}
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            {flower.stemCount
              ? `${flower.stemCount} stems`
              : "Fresh seasonal bunch"}
          </p>
        </div>
        <p className="whitespace-nowrap text-sm font-bold text-ink">
          ₹{flower.price.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-ink">
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
          className="inline-flex items-center gap-2 disabled:text-ink-soft/50"
        >
          {flower.inStock ? <Plus size={15} /> : <X size={15} />}
          {flower.inStock ? "Add to cart" : "Unavailable"}
        </button>
        {onBuyNow && flower.inStock && (
          <button
            type="button"
            onClick={onBuyNow}
            className="text-gold underline-offset-4 hover:underline"
          >
            Buy now
          </button>
        )}
      </div>
    </motion.article>
  );
}
