"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Flower2,
  Heart,
  Minus,
  Plus,
  Quote,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { DeliverySlotSelector } from "@/components/ui/DeliverySlotSelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProductCard } from "@/components/sections/ProductCard";
import { QuickViewDialog } from "@/components/sections/QuickViewDialog";
import { useCart } from "@/components/providers/CartContext";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import type { Flower, Review } from "@/lib/types";

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

function availability(flower: Flower) {
  if (!flower.inStock) return { label: "Sold Out", tone: "blush" as const };
  if (flower.featured) return { label: "Limited Stock", tone: "gold" as const };
  if (flower.availableToday)
    return { label: "Available Today", tone: "sage" as const };
  return { label: "Pre-order", tone: "lavender" as const };
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/10 py-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left font-display text-xl text-ink"
      >
        {question}
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-3 text-sm leading-7 text-ink-soft"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
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
  const status = availability(flower);
  const galleryTokens = Array.from(
    new Set([
      flower.images[0] ?? "gradient-blush",
      "gradient-blush",
      "gradient-ivory",
    ]),
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [slotId, setSlotId] = useState("slot-6-7");
  const [quickView, setQuickView] = useState<Flower | null>(null);

  const addFlower = () =>
    addItem({
      productId: flower.id,
      productType: "flower",
      name: flower.name,
      price: flower.price,
      quantity,
      image: flower.images[0],
    });
  const buyNow = () => {
    if (flower.inStock) {
      addFlower();
      router.push("/checkout");
    }
  };
  const whatsappText = encodeURIComponent(
    `Hello FreshFlower.zone, I would like to order ${flower.name} (qty: ${quantity}).`,
  );
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
        ? "Yes, this flower is marked Available Today for our current Delhi NCR preview delivery footprint."
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
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
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
                <h1 className="text-5xl leading-[1.02] md:text-6xl">
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
                ₹{flower.price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-ink-soft">
                {flower.stemCount
                  ? `${flower.stemCount} stems`
                  : "Seasonal bunch"}
              </span>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-6 text-base leading-8 text-ink-soft">
              {flower.shortDescription}
            </p>
            <div className="mt-8 border-y border-ink/10 py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center gap-4 rounded-md border border-ink/10 bg-white/50 px-3 py-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-5 text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
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
              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold">Delivery slot</p>
                <DeliverySlotSelector
                  selectedSlotId={slotId}
                  onChange={setSlotId}
                />
              </div>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                disabled={!flower.inStock}
                onClick={addFlower}
              >
                Add to Cart <Plus size={17} />
              </Button>
              <Button
                size="lg"
                variant="gold"
                disabled={!flower.inStock}
                onClick={buyNow}
              >
                Buy Now <ArrowRight size={17} />
              </Button>
            </div>
            <a
              href={`https://wa.me/919999999999?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center rounded-md border border-ink/10 bg-white/55 px-5 py-3 text-sm font-semibold text-ink"
            >
              Order on WhatsApp
            </a>
            <p className="mt-5 text-center text-xs text-ink-soft">
              Added items stay in your cart — review and change quantities
              anytime from the cart icon. Checkout connects in a later phase.
            </p>
          </motion.section>
        </div>
      </div>
      <section className="mt-20 bg-ivory-deep px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              The details
            </p>
            <h2 className="text-4xl">Grown for the moment.</h2>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-ink-soft">
              {flower.description}
            </p>
          </div>
          <div className="rounded-lg bg-white/60 p-6">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="mt-1 text-gold" />
              <div>
                <h3 className="font-display text-2xl">Freshness & sourcing</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">
                  Selected in small batches from trusted growers and prepared
                  close to dispatch, so your flowers arrive with their best days
                  ahead.
                </p>
              </div>
            </div>
          </div>
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
      <section className="bg-ink px-5 py-20 text-ivory md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
              Customer notes
            </p>
            <h2 className="text-4xl">Reviews for {flower.name}.</h2>
          </div>
          <div>
            {reviews.length ? (
              reviews.map((review) => (
                <div key={review.id} className="border-t border-ivory/20 py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-1 text-gold">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={
                            index < review.rating
                              ? "text-gold"
                              : "text-ivory/20"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-ivory/50">
                      {review.customerName}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-2xl leading-snug">
                    &quot;{review.comment}&quot;
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ivory/60">
                Be the first to leave a note about this flower.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
            Need to know
          </p>
          <h2 className="mb-8 text-4xl">About this flower</h2>
          {faqItems.map((item) => (
            <FAQItem key={item.question} {...item} />
          ))}
        </div>
      </section>
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
