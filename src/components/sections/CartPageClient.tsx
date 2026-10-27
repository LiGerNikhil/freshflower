"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Tag, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import {
  DiscountJourney,
  DiscountJourneyBar,
} from "@/components/sections/DiscountJourney";
import { DELIVERY_CHARGE, DELIVERY_NOTE, COUPON_STORAGE_KEY } from "@/lib/cart";
import { formatDiscountINR } from "@/lib/discounts";
import { useTieredDiscount } from "@/lib/use-tiered-discount";

interface CouponMessage {
  kind: "success" | "error";
  text: string;
}

/** Snapshot of a validated coupon, keyed by the subtotal it was quoted for. */
interface AppliedCoupon {
  codes: string[];
  value: number;
  subtotal: number;
}

export default function CartPageClient() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const tier = useTieredDiscount(subtotal, "orders");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<CouponMessage | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const tierActive = tier.discount > 0;
  // Derived during render: a quote only counts for the subtotal it was priced
  // for, and never alongside the automatic reward (no stacking).
  const couponIsCurrent =
    !tierActive && appliedCoupon?.subtotal === subtotal;
  const couponCodes = couponIsCurrent ? appliedCoupon.codes : [];
  const couponValue = couponIsCurrent ? appliedCoupon.value : 0;
  const appliedDiscount = Math.min(
    subtotal,
    tierActive ? tier.discount : couponValue,
  );
  const total = Math.max(0, subtotal + DELIVERY_CHARGE - appliedDiscount);

  // Restore and re-price a saved code whenever the cart value changes. All
  // state writes happen in async callbacks, so no cascading render happens
  // while this effect runs.
  useEffect(() => {
    if (tierActive) return;

    let codes: string[] = [];
    try {
      const saved = JSON.parse(
        window.sessionStorage.getItem(COUPON_STORAGE_KEY) ?? "[]",
      );
      if (Array.isArray(saved)) {
        codes = saved.filter(
          (code): code is string => typeof code === "string" && code.length > 0,
        );
      }
    } catch {
      try {
        window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
      } catch {
        /* storage can be unavailable in private mode */
      }
      return;
    }
    if (!codes.length) return;

    let alive = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codes, subtotal }),
          });
          if (!alive) return;
          const body = await response.json().catch(() => null);
          if (!response.ok) return;
          if (body?.source === "tiered") {
            setAppliedCoupon({ codes: [], value: 0, subtotal });
            setCouponMessage({
              kind: "error",
              text:
                body?.message ??
                "Automatic cart reward applied instead — coupon codes can't be combined.",
            });
            window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
            return;
          }
          const valid: string[] = Array.isArray(body?.codes) ? body.codes : [];
          setAppliedCoupon({
            codes: valid,
            value: valid.length ? Number(body?.discount) || 0 : 0,
            subtotal,
          });
          if (valid.length) {
            window.sessionStorage.setItem(
              COUPON_STORAGE_KEY,
              JSON.stringify(valid),
            );
          } else {
            window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
            setCouponMessage({
              kind: "error",
              text:
                body?.message ?? "That code is no longer valid for this cart.",
            });
          }
        } catch {
          /* keep the last known value; checkout revalidates authoritatively */
        }
      })();
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [subtotal, tierActive]);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMessage({ kind: "error", text: "Enter a coupon code first." });
      return;
    }
    if (tierActive) {
      setCouponMessage({
        kind: "error",
        text: "Your automatic cart reward is already applied — coupon codes can't be combined.",
      });
      return;
    }
    setCouponChecking(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: [code], subtotal }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not check that coupon.");
      }
      if (body?.source === "tiered") {
        setAppliedCoupon({ codes: [], value: 0, subtotal });
        setCouponMessage({ kind: "error", text: body.message });
        window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
        return;
      }
      const codes: string[] = Array.isArray(body?.codes) ? body.codes : [];
      if (!codes.length) {
        setAppliedCoupon({ codes: [], value: 0, subtotal });
        setCouponMessage({
          kind: "error",
          text: body?.message ?? "Invalid code or minimum order not reached.",
        });
        window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
        return;
      }
      setAppliedCoupon({
        codes,
        value: Number(body?.discount) || 0,
        subtotal,
      });
      setCouponMessage({
        kind: "success",
        text: body?.message ?? "Coupon applied.",
      });
      window.sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(codes));
      setCouponInput("");
    } catch (cause) {
      setCouponMessage({
        kind: "error",
        text: cause instanceof Error ? cause.message : "Could not check that coupon.",
      });
    } finally {
      setCouponChecking(false);
    }
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
      <section className="mx-auto max-w-7xl px-5 pt-10 md:px-10">
        <DiscountJourney result={tier} />
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
                key={`${item.productType}-${item.productId}-${item.color ?? "default"}`}
                className="flex gap-4 py-6"
              >
                <ProductItemImage image={item.image} name={item.name} className="h-28 w-28" />
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
                        {item.color && (
                          <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 font-semibold text-ink">
                            {item.color} colour
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.color)}
                      aria-label={`Remove ${item.name}${item.color ? ` (${item.color})` : ""}`}
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
                          updateQuantity(item.productId, item.quantity - 1, item.color)
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
                          updateQuantity(item.productId, item.quantity + 1, item.color)
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
                  placeholder={tierActive ? "Automatic reward applied" : "WELCOME10"}
                  disabled={tierActive || couponChecking}
                  aria-describedby="coupon-help"
                  className="min-w-0 flex-1 rounded-md border border-ink/10 bg-white/70 px-3 py-2.5 text-sm outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon()}
                  disabled={tierActive || couponChecking}
                  className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-ivory disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {couponChecking ? "Checking…" : "Apply"}
                </button>
              </div>
              {tierActive && (
                <p id="coupon-help" className="mt-2 text-xs text-sage-ink">
                  🎉 Your automatic cart reward is applied. Coupon codes can&apos;t be combined with it.
                </p>
              )}
              {!tierActive && couponMessage && (
                <p
                  id="coupon-help"
                  role={couponMessage.kind === "error" ? "alert" : "status"}
                  className={`mt-2 text-xs ${couponMessage.kind === "success" ? "text-sage-ink" : "text-red-700"}`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>
            <div className="mt-6 space-y-3 border-t border-ink/10 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">Porter delivery charge</span>
                <span>₹{DELIVERY_CHARGE.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">
                  {tierActive
                    ? "Automatic reward"
                    : couponCodes.length
                      ? `Coupon (${couponCodes.join(", ")})`
                      : "Discount"}
                </span>
                <span className={appliedDiscount ? "font-semibold text-sage-ink" : ""}>
                  {appliedDiscount ? `−${formatDiscountINR(appliedDiscount)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-7 flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-3.5 text-sm font-semibold text-ink"
            >
              Proceed to booking <ArrowRight size={16} />
            </Link>
            <p className="mt-3 text-center text-xs text-ink-soft">
              Your order will be delivered by Porter.
            </p>
          </div>
        </aside>
      </section>
      <DiscountJourneyBar result={tier} />
    </main>
  );
}
