"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartContext";
import { coupons } from "@/lib/data";
import { DELIVERY_NOTE } from "@/lib/cart";
import { GRADIENT_TOKENS } from "@/lib/utils";

export default function CartPageClient() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [discount, setDiscount] = useState(0);
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const coupon = coupons.find(
      (item) =>
        item.code === code &&
        item.active &&
        subtotal >= (item.minOrderValue ?? 0),
    );
    if (!coupon) {
      setDiscount(0);
      setCouponMessage({
        kind: "error",
        text: "Invalid code or minimum order not reached.",
      });
      return;
    }
    const value =
      coupon.discountType === "percentage"
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : coupon.discountValue;
    setDiscount(Math.min(value, subtotal));
    setCouponMessage({
      kind: "success",
      text: `${coupon.code} applied: ${coupon.description}`,
    });
  };

  if (!items.length)
    return (
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-blush">
            <Tag size={30} className="text-gold" />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            Your cart is waiting
          </p>
          <h1 className="text-5xl">Nothing here yet.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
            Choose a few fresh stems and we&apos;ll keep them safe here while
            you decide on the morning that suits you.
          </p>
          <Link
            href="/flowers"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
          >
            Browse flowers <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-ivory">
      <section className="bg-ivory-deep px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            Almost yours
          </p>
          <h1 className="text-5xl md:text-7xl">Your cart.</h1>
          <p className="mt-4 text-sm text-ink-soft">
            {itemCount} item{itemCount === 1 ? "" : "s"} selected for a more
            beautiful morning.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-10 lg:grid-cols-[1fr_370px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl">Selected flowers</h2>
            <Link
              href="/flowers"
              className="inline-flex items-center gap-2 text-sm font-semibold"
            >
              <ArrowLeft size={15} /> Continue shopping
            </Link>
          </div>
          <div className="divide-y divide-ink/10">
            {items.map((item) => (
              <article
                key={`${item.productType}-${item.productId}`}
                className="flex gap-4 py-6"
              >
                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background:
                      GRADIENT_TOKENS[item.image] ??
                      GRADIENT_TOKENS["gradient-ivory"],
                  }}
                >
                  <span className="font-display text-ink/25">Bloom</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl leading-tight">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-ink-soft">
                        {item.productType === "bouquet"
                          ? "Premium bouquet"
                          : "Fresh flower stems"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-ink-soft hover:text-ink"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-white/60 px-2 py-1.5">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-5 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="glass-deep rounded-xl p-6">
            <h2 className="font-display text-3xl">Order summary</h2>
            <div className="mt-7 space-y-4 border-b border-ink/10 pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs leading-5 text-ink-soft">{DELIVERY_NOTE}</p>
            </div>
            <div className="mt-5">
              <label
                htmlFor="coupon"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-soft"
              >
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="WELCOME10"
                  className="min-w-0 flex-1 rounded-md border border-ink/10 bg-white/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-ivory"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p
                  className={`mt-2 text-xs ${couponMessage.kind === "success" ? "text-sage-ink" : "text-red-700"}`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>
            <div className="mt-6 space-y-3 border-t border-ink/10 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">Discount</span>
                <span className={discount ? "text-sage-ink" : ""}>
                  {discount ? `-₹${discount.toLocaleString("en-IN")}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{(subtotal - discount).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-7 flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-3.5 text-sm font-semibold text-ink"
            >
              Proceed to booking <ArrowRight size={16} />
            </Link>
            <p className="mt-3 text-center text-xs text-ink-soft">
              Delivery fee is confirmed for your address at booking.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
