"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Clock3, MapPin } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import { DELIVERY_CHARGE, DELIVERY_NOTE } from "@/lib/cart";

interface OrderRecord {
  id: string;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  delivery: {
    areaName?: string;
    date: string;
    slotLabel?: string;
    address: string;
    city: string;
  };
}
export default function OrderConfirmationClient({
  orderId,
}: {
  orderId: string;
}) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const { clearCart } = useCart();
  // Guard so a changing callback identity (or re-render) can never re-hydrate
  // the same order record and re-trigger a state update loop.
  const hydratedOrderId = useRef<string | null>(null);
  useEffect(() => {
    if (hydratedOrderId.current === orderId) return;
    const saved = sessionStorage.getItem(`freshflower-order-${orderId}`);
    if (saved) {
      hydratedOrderId.current = orderId;
      // Hydrate the temporary browser order record after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(JSON.parse(saved) as OrderRecord);
      clearCart();
    }
  }, [clearCart, orderId]);
  if (!order)
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-5 text-center">
        <div>
          <h1 className="text-4xl">Loading your booking...</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Your order is being retrieved.
          </p>
        </div>
      </main>
    );
  const subtotal =
    order.subtotal ??
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = order.deliveryFee ?? DELIVERY_CHARGE;
  const total = order.total ?? subtotal + deliveryFee;
  return (
    <main className="min-h-screen bg-ivory px-5 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage">
          <Check size={35} className="text-sage-ink" />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          Booking received
        </p>
        <h1 className="mt-3 text-5xl">Your flowers are on their way.</h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">
          Order <strong className="text-ink">{order.id}</strong> is confirmed.
          We&apos;ll use the details below to prepare the next step.
        </p>
        <div className="mt-10 rounded-xl bg-white/70 p-6 text-left">
          <div className="flex items-start gap-3 border-b border-ink/10 pb-5">
            <Clock3 className="mt-1 text-gold" size={20} />
            <div>
              <p className="font-semibold">
                {order.delivery.date} · {order.delivery.slotLabel}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {order.delivery.areaName}
              </p>
              <p className="mt-2 text-xs font-semibold text-sage-ink">
                Your order will be delivered by Porter.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-b border-ink/10 py-5">
            <MapPin className="mt-1 text-gold" size={20} />
            <div>
              <p className="font-semibold">Delivering to</p>
              <p className="mt-1 text-sm text-ink-soft">
                {order.delivery.address}, {order.delivery.city}
              </p>
            </div>
          </div>
          <div className="divide-y divide-ink/10 border-b border-ink/10 py-2">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center gap-3 py-3 text-sm">
                <ProductItemImage image={item.image} name={item.name} className="h-14 w-14" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{item.name}</span>
                  <span className="text-ink-soft">× {item.quantity}</span>
                </span>
                <span className="font-semibold">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Flowers total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Delivery charge</span>
              <span>₹{deliveryFee.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs leading-5 text-ink-soft">{DELIVERY_NOTE}</p>
          </div>
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-5 text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <Link
          href="/flowers"
          className="mt-8 inline-flex rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-ivory"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
