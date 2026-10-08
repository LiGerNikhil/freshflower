"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarDays,
  ChevronDown,
  Flower2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProductCard } from "@/components/sections/ProductCard";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { useCart } from "@/components/providers/CartContext";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";
import { DELIVERY_CHARGE } from "@/lib/cart";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import type { ColorVariant, Flower, Review } from "@/lib/types";

interface FlowerDetailClientProps {
  flower: Flower;
  categoryName: string;
  relatedFlowers: Flower[];
  similarFlowers: Flower[];
  reviews: Review[];
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const estimatedDeliveryLabel = "Estimated delivery by Tomorrow 11:00AM";

function availability(flower: Flower) {
  if (!flower.inStock) return { label: "Sold Out", tone: "blush" as const };
  if (flower.featured) return { label: "Limited Stock", tone: "gold" as const };
  if (flower.availableToday)
    return { label: "Available Today", tone: "sage" as const };
  return { label: "Pre-order", tone: "lavender" as const };
}

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink/10 py-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left font-display text-xl text-ink"
      >
        {title}
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-3 text-sm leading-7 text-ink-soft"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return <Collapsible title={question}>{answer}</Collapsible>;
}

export default function FlowerDetailClient({
  flower,
  categoryName,
  relatedFlowers,
  similarFlowers,
  reviews,
}: FlowerDetailClientProps) {
const router = useRouter();
  const { addItem } = useCart();
  const { requireAuth } = useCustomerAuth();
  const status = availability(flower);
  const variants = flower.colorVariants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(
    variants[0] ?? null,
  );
  const activePrice = selectedVariant?.price ?? flower.price;
  const activeComparePrice =
    selectedVariant?.compareAtPrice ?? flower.compareAtPrice;
  const activeImage =
    selectedVariant?.image ?? flower.images[0] ?? "gradient-blush";
  const seenTokens =
    variants.length && selectedVariant
      ? [selectedVariant.image ?? flower.images[0] ?? "gradient-blush"]
      : flower.images.slice(0, 3);
  const galleryTokens = Array.from(
    new Set([...(seenTokens.length ? seenTokens : ["gradient-blush"])]),
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [quickView, setQuickView] = useState<Flower | null>(null);

  const chooseVariant = (variant: ColorVariant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
  };

  const addFlower = () =>
    addItem({
      productId: flower.id,
      productType: "flower",
      name: flower.name,
      price: activePrice,
      quantity,
      image: activeImage,
      color: selectedVariant?.color,
    });
  const buyNow = () => {
    if (!flower.inStock) return;
    if (!requireAuth()) return;
    addFlower();
    router.push("/checkout");
  };
  const faqItems = [
    {
      question: `How long will ${flower.name} stay fresh?`,
      answer:
        flower.careInstructions ??
        "With fresh water, trimmed stems, and a cool spot away from direct sun, your flowers should stay beautiful for several days.",
    },
    {
      question: "Can I choose a morning delivery slot?",
      answer:
        "Yes. Select any available slot below, including our early morning express windows from 5 AM onward.",
    },
    {
      question: "Can this be delivered today?",
      answer: flower.availableToday
        ? "Yes, this flower is marked Available Today for our current Delhi NCR delivery footprint."
        : "This flower is currently prepared as a pre-order item. Select your preferred date and our team will confirm availability.",
    },
  ];

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <Link
          href="/flowers"
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to flowers
        </Link>
        <div className="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <motion.section variants={reveal} initial="hidden" animate="visible">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl text-left"
              style={{
                background: isRemoteImage(
                  galleryTokens[selectedImage] ?? flower.images[0],
                )
                  ? undefined
                  : GRADIENT_TOKENS[
                      galleryTokens[selectedImage] ?? flower.images[0]
                    ] ?? GRADIENT_TOKENS["gradient-ivory"],
              }}
            >
              {isRemoteImage(galleryTokens[selectedImage] ?? flower.images[0]) ? (
                <Image
                  src={galleryTokens[selectedImage] ?? flower.images[0]}
                  alt={flower.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <Flower2
                  size={220}
                  strokeWidth={0.45}
                  className="text-ink/20 transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <span className="absolute bottom-5 right-5 rounded-full bg-ivory/80 px-3 py-2 text-xs font-semibold text-ink">
                Click to enlarge
              </span>
            </button>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {galleryTokens.map((token, index) => (
                <button
                  key={token}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 ${selectedImage === index ? "border-ink" : "border-transparent"}`}
                  style={{
                    background: isRemoteImage(token)
                      ? undefined
                      : GRADIENT_TOKENS[token] ?? GRADIENT_TOKENS["gradient-ivory"],
                  }}
                >
                  {isRemoteImage(token) ? (
                    <Image
                      src={token}
                      alt={flower.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 12rem"
                      className="object-cover"
                    />
                  ) : (
                    <Flower2
                      size={54}
                      strokeWidth={0.55}
                      className="text-ink/20"
                    />
                  )}
                </button>
              ))}
            </div>
            {flower.videos?.length ? (
              <div className="mt-4 grid gap-3">
                {flower.videos.map((video, index) => (
                  <video
                    key={video}
                    src={video}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-xl border border-ink/10 bg-ink/5"
                    aria-label={`${flower.name} video ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </motion.section>
          <motion.section
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
                  {categoryName} · Fresh from our studio
                </p>
                <h1 className="text-4xl leading-[1.02] sm:text-5xl md:text-6xl">
                  {flower.name}
                </h1>
              </div>
              <button
                type="button"
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => setLiked(!liked)}
                className="rounded-full border border-ink/10 bg-white/60 p-3"
              >
                <Heart
                  size={20}
                  fill={liked ? "currentColor" : "none"}
                  className={liked ? "text-gold" : ""}
                />
              </button>
            </div>
<div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-2xl font-bold">
                ₹{activePrice.toLocaleString("en-IN")}
              </span>
              {activeComparePrice && activeComparePrice > activePrice ? (
                <span className="text-sm text-ink-soft line-through">
                  ₹{activeComparePrice.toLocaleString("en-IN")}
                </span>
              ) : null}
              <span className="text-sm text-ink-soft">
                {flower.stemCount ?? flower.quantity
                  ? `${flower.stemCount ?? flower.quantity} ${flower.unit?.toLowerCase() ?? "stems"}`
                  : "Seasonal bunch"}
              </span>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-6 text-base leading-8 text-ink-soft">
              {flower.shortDescription}
            </p>
            {variants.length > 0 && (
              <div className="mt-8 border-y border-ink/10 py-6">
                <p className="mb-3 text-sm font-semibold">Select colour</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const active = selectedVariant?.color === variant.color;
                    return (
                      <button
                        key={variant.color}
                        type="button"
                        onClick={() => chooseVariant(variant)}
                        aria-pressed={active}
                        className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                          active
                            ? "border-ink bg-ink text-ivory shadow"
                            : "border-ink/10 bg-white/60 text-ink hover:border-ink/30"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 rounded-full border border-ink/10"
                          style={{
                            background: isRemoteImage(variant.image)
                              ? "conic-gradient(#e5e7eb, #9ca3af)"
                              : GRADIENT_TOKENS[variant.image ?? ""] ??
                                "conic-gradient(#e5e7eb, #9ca3af)",
                          }}
                        />
                        {variant.color}
                        <span
                          className={`text-xs ${active ? "text-ivory/70" : "text-ink-soft"}`}
                        >
                          ₹{variant.price.toLocaleString("en-IN")}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedVariant?.compareAtPrice &&
                  selectedVariant.compareAtPrice > activePrice && (
                    <p className="mt-2 text-xs text-ink">
                      Save ₹
                      {(selectedVariant.compareAtPrice - activePrice).toLocaleString(
                        "en-IN",
                      )}{" "}
                      on this colour.
                    </p>
                  )}
                {selectedVariant && (
                  <div className="mt-4 rounded-lg bg-white/60 px-4 py-3 text-sm text-ink-soft">
                    <p>
                      Selected colour: <span className="font-semibold text-ink">{selectedVariant.color}</span>
                    </p>
                    <p className="mt-1">
                      Product price: <span className="font-semibold text-ink">₹{activePrice.toLocaleString("en-IN")}</span> · Porter delivery charge: <span className="font-semibold text-ink">₹{DELIVERY_CHARGE.toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-8 border-y border-ink/10 py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center rounded-md border border-ink/10 bg-white/50">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center text-ink transition hover:text-gold active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-6 text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-11 w-11 items-center justify-center text-ink transition hover:text-gold active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-7">
                <label
                  htmlFor="delivery-date"
                  className="mb-3 flex items-center gap-2 text-sm font-semibold"
                >
                  <CalendarDays size={16} className="text-gold" /> Delivery date
                </label>
                <input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(event) => setDeliveryDate(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white/60 px-4 py-3 text-sm outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-sage-ink/15 bg-sage/70 p-4 text-sm font-semibold text-sage-ink">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70">
                <Bike size={20} />
              </span>
              <div>
                <p>{estimatedDeliveryLabel}</p>
                <p className="mt-1 text-xs font-normal leading-5 text-ink-soft">
                  Porter rider will be assigned after order confirmation. Porter delivery charge: ₹{DELIVERY_CHARGE.toLocaleString("en-IN")}.
                </p>
              </div>
            </div>
<div className="mt-6 hidden grid-cols-2 gap-2 lg:grid sm:gap-3">
              <Button
                size="sm"
                variant="secondary"
                disabled={!flower.inStock}
                onClick={addFlower}
                className="min-h-12 w-full whitespace-nowrap border-blush bg-blush/85 px-3 text-xs text-ink hover:bg-blush sm:text-sm"
              >
                Add to Cart <Plus size={17} />
              </Button>
              <Button
                size="sm"
                variant="gold"
                disabled={!flower.inStock}
                onClick={buyNow}
                className="min-h-12 w-full whitespace-nowrap border border-gold/30 bg-ivory-deep px-3 text-xs text-ink hover:bg-gold/25 sm:text-sm"
              >
                Buy Now <ArrowRight size={17} />
</Button>
            </div>
            <p className="mt-5 text-center text-xs text-ink-soft">
              Added items stay in your cart — review and change quantities
              anytime from the cart icon.
            </p>
          </motion.section>
        </div>
      </div>
      <section className="px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Collapsible title="The details">
            <p>{flower.description}</p>
            <p className="mt-4 font-semibold text-ink">Freshness & sourcing.</p>
            <p>
              Selected in small batches from trusted growers and prepared close
              to dispatch, so your flowers arrive with their best days ahead.
            </p>
          </Collapsible>
        </div>
      </section>
      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="rounded-lg bg-sage p-7">
            <Truck size={22} className="mb-10 text-sage-ink" />
            <h3 className="font-display text-2xl">Delhi NCR delivery</h3>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Morning delivery from 5 AM to 12 PM across our service areas.
            </p>
            <Link
              href="/delivery"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold"
            >
              Full delivery information <ArrowRight size={15} />
            </Link>
          </div>
          <div className="rounded-lg bg-blush p-7">
            <ShieldCheck size={22} className="mb-10 text-gold" />
            <h3 className="font-display text-2xl">Handled with care</h3>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Wrapped thoughtfully and dispatched in a way that protects the
              stems and the feeling behind them.
            </p>
          </div>
          <div className="rounded-lg bg-lavender p-7">
            <CalendarDays size={22} className="mb-10 text-lavender-ink" />
            <h3 className="font-display text-2xl">Choose your moment</h3>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Select a date and delivery window above. We will confirm the best
              available route at checkout.
            </p>
          </div>
        </div>
      </section>
      {relatedFlowers.length > 0 && (
        <section className="bg-ivory-deep px-5 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
                  From the same family
                </p>
                <h2 className="text-4xl">Related flowers</h2>
              </div>
              <Link
                href={`/categories/${flower.categoryId.replace("cat-", "")}`}
                className="text-sm font-semibold"
              >
                View category <ArrowRight size={15} className="ml-1 inline" />
              </Link>
            </div>
            <motion.div
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4"
            >
              {relatedFlowers.map((item) => (
                <ProductCard
                  key={item.id}
                  flower={item}
                  onQuickView={setQuickView}
                />
              ))}
            </motion.div>
          </div>
        </section>
      )}
      {similarFlowers.length > 0 && (
        <section className="px-5 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              You may also like
            </p>
            <h2 className="mb-10 text-4xl">Similar products</h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {similarFlowers.map((item) => (
                <ProductCard
                  key={item.id}
                  flower={item}
                  onQuickView={setQuickView}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Collapsible title={`Reviews (${reviews.length})`}>
            {reviews.length ? (
              <div>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-ink/10 py-5 last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-1 text-gold">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={index}
                            className={
                              index < review.rating ? "text-gold" : "text-ink/15"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-ink-soft">
                        {review.customerName}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-xl leading-snug text-ink">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft">
                Be the first to leave a note about this flower.
              </p>
            )}
          </Collapsible>
        </div>
      </section>
      <section className="px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
            Need to know
          </p>
          <h2 className="mb-8 text-3xl md:text-4xl">About this flower</h2>
          {faqItems.map((item) => (
            <FAQItem key={item.question} {...item} />
          ))}
        </div>
      </section>

      {/* Sticky mobile buy bar — replaces the inline Add/Buy buttons below lg. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-5 py-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">
              {flower.name}
            </p>
            <p className="text-base font-bold text-ink">
              ₹{activePrice.toLocaleString("en-IN")}
              {activeComparePrice && activeComparePrice > activePrice ? (
                <span className="ml-1.5 text-xs font-normal text-ink-soft line-through">
                  ₹{activeComparePrice.toLocaleString("en-IN")}
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            disabled={!flower.inStock}
            onClick={addFlower}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-md border border-blush bg-blush/85 px-4 text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-blush active:scale-[0.98] disabled:bg-ink/5 disabled:text-ink-soft"
          >
            <Plus size={15} /> Add
          </button>
          <button
            type="button"
            disabled={!flower.inStock}
            onClick={buyNow}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-md bg-ink px-4 text-xs font-bold uppercase tracking-wider text-ivory transition hover:bg-ink/90 active:scale-[0.98] disabled:bg-ink/5 disabled:text-ink-soft"
          >
            Buy <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <div className="h-24 lg:hidden" aria-hidden="true" />

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        className="max-w-3xl"
      >
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg"
          style={{
            background: isRemoteImage(
              galleryTokens[selectedImage] ?? flower.images[0],
            )
              ? undefined
              : GRADIENT_TOKENS[
                  galleryTokens[selectedImage] ?? flower.images[0]
                ] ?? GRADIENT_TOKENS["gradient-ivory"],
          }}
        >
          {isRemoteImage(galleryTokens[selectedImage] ?? flower.images[0]) ? (
            <Image
              src={galleryTokens[selectedImage] ?? flower.images[0]}
              alt={flower.name}
              fill
              sizes="(max-width: 768px) 100vw, 48rem"
              className="object-cover"
            />
          ) : (
            <Flower2 size={280} strokeWidth={0.4} className="text-ink/20" />
          )}
        </div>
      </Modal>
      <QuickViewDialog flower={quickView} onClose={() => setQuickView(null)} />
    </main>
  );
}
