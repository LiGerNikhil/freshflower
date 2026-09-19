"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Edit3,
  Heart,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { AccountShell } from "@/components/sections/AccountShell";
import { OrderStatusStepper } from "@/components/sections/OrderStatusStepper";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import { useCart } from "@/components/providers/CartContext";
import { useWishlist } from "@/components/providers/WishlistContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-media";
import type { Address, Customer, Flower, Order, Review } from "@/lib/types";

interface AccountContentProps {
  mode:
    | "overview"
    | "orders"
    | "addresses"
    | "wishlist"
    | "notifications"
    | "reviews";
  customer: Customer;
  orders: Order[];
  flowers: Flower[];
  reviews: Review[];
}
const titles = {
  overview: "Good morning, Ananya.",
  orders: "Your orders",
  addresses: "Saved addresses",
  wishlist: "Your wishlist",
  notifications: "Notifications",
  reviews: "Your reviews",
} as const;
export default function AccountContent({
  mode,
  customer,
  orders,
  flowers,
  reviews,
}: AccountContentProps) {
  return (
    <AccountShell title={titles[mode]}>
      {mode === "overview" && <Overview customer={customer} orders={orders} />}
      {mode === "orders" && <Orders orders={orders} flowers={flowers} />}
      {mode === "addresses" && <Addresses initial={customer.addresses} />}
      {mode === "wishlist" && <Wishlist flowers={flowers} />}
      {mode === "notifications" && <Notifications orders={orders} />}
      {mode === "reviews" && <Reviews reviews={reviews} />}
    </AccountShell>
  );
}
function Overview({
  customer,
  orders,
}: {
  customer: Customer;
  orders: Order[];
}) {
  const upcoming = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blush p-7">
        <p className="text-sm text-ink-soft">Signed in as demo customer</p>
        <h2 className="mt-2 font-display text-3xl">{customer.name}</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {customer.email} · {customer.phone}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders" className="rounded-lg bg-white/70 p-6">
          <Package className="text-gold" />
          <h3 className="mt-10 font-display text-2xl">
            {orders.length} orders
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            {upcoming.length} currently in progress
          </p>
        </Link>
        <Link href="/account/addresses" className="rounded-lg bg-sage p-6">
          <MapPin className="text-sage-ink" />
          <h3 className="mt-10 font-display text-2xl">
            {customer.addresses.length} saved address
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            Ready for your next morning delivery
          </p>
        </Link>
      </div>
      <div className="rounded-lg border border-ink/10 p-6">
        <h2 className="font-display text-2xl">Quick links</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/account/wishlist"
            className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-ivory"
          >
            Wishlist
          </Link>
          <Link
            href="/account/notifications"
            className="rounded-md border border-ink/10 px-4 py-3 text-sm font-semibold"
          >
            Notifications
          </Link>
          <Link
            href="/flowers"
            className="rounded-md border border-ink/10 px-4 py-3 text-sm font-semibold"
          >
            Shop flowers
          </Link>
        </div>
      </div>
    </div>
  );
}
function Orders({ orders, flowers }: { orders: Order[]; flowers: Flower[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="block rounded-lg bg-white/70 p-6 transition hover:bg-white"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <ProductItemImage
              image={resolveProductImage(order.items[0] ?? {}, flowers)}
              name={order.items[0]?.name ?? order.orderNumber}
              className="h-16 w-16"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage-ink">
                {order.orderNumber}
              </p>
              <h2 className="mt-2 font-display text-2xl">
                {order.items[0]?.name}
                {order.items.length > 1 && ` + ${order.items.length - 1} more`}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {order.deliveryDate} · ₹{order.total.toLocaleString("en-IN")}
              </p>
            </div>
            <Badge
              tone={
                order.status === "delivered"
                  ? "sage"
                  : order.status === "cancelled"
                    ? "blush"
                    : "gold"
              }
            >
              {order.status.replaceAll("_", " ")}
            </Badge>
          </div>
          <div className="mt-6">
            <OrderStatusStepper status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
function Addresses({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const empty: Address = {
    id: "",
    label: "Home",
    line1: "",
    city: "New Delhi",
    areaId: "area-south-ext",
    pincode: "",
    isDefault: false,
  };
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;
    const next = {
      ...empty,
      ...value,
      id: editing?.id ?? `addr-${Date.now()}`,
      isDefault: value.isDefault === "on",
    };
    setAddresses((current) =>
      editing
        ? current.map((item) => (item.id === editing.id ? next : item))
        : [...current, next],
    );
    setEditing(null);
    setShowForm(false);
  };
  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus size={16} /> Add address
        </Button>
      </div>
      {addresses.map((address) => (
        <div key={address.id} className="mb-4 rounded-lg bg-white/70 p-6">
          <div className="flex justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl">{address.label}</h2>
                {address.isDefault && <Badge tone="sage">Default</Badge>}
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                {address.line1}
                <br />
                {address.city} · {address.pincode}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Edit address"
                onClick={() => {
                  setEditing(address);
                  setShowForm(true);
                }}
              >
                <Edit3 size={17} />
              </button>
              <button
                type="button"
                aria-label="Delete address"
                onClick={() =>
                  setAddresses((current) =>
                    current.filter((item) => item.id !== address.id),
                  )
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {showForm && (
        <form
          onSubmit={save}
          className="glass-deep mt-5 grid gap-4 rounded-lg p-6 sm:grid-cols-2"
        >
          <Field
            name="label"
            label="Label"
            defaultValue={editing?.label ?? "Home"}
          />
          <Field
            name="line1"
            label="Address"
            defaultValue={editing?.line1 ?? ""}
          />
          <Field
            name="city"
            label="City"
            defaultValue={editing?.city ?? "New Delhi"}
          />
          <Field
            name="pincode"
            label="Pincode"
            defaultValue={editing?.pincode ?? ""}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              name="isDefault"
              type="checkbox"
              defaultChecked={editing?.isDefault}
            />{" "}
            Default address
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save address</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        required
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-ink/10 bg-white/70 p-3 text-sm"
      />
    </label>
  );
}
function Wishlist({ flowers }: { flowers: Flower[] }) {
  const { ids, remove } = useWishlist();
  const { addItem } = useCart();
  const items = flowers.filter((flower) => ids.includes(flower.id));
  return items.length ? (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((flower) => (
        <div key={flower.id} className="rounded-lg bg-white/70 p-5">
          <div
            className="relative flex aspect-[1.2] items-center justify-center overflow-hidden rounded-md"
            style={{
              background: isRemoteImage(flower.images[0])
                ? undefined
                : GRADIENT_TOKENS[flower.images[0]] ??
                  GRADIENT_TOKENS["gradient-ivory"],
            }}
          >
            {isRemoteImage(flower.images[0]) ? (
              <Image
                src={flower.images[0]}
                alt={flower.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <Heart size={58} className="text-ink/20" />
            )}
          </div>
          <h2 className="mt-4 font-display text-2xl">{flower.name}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            ₹{flower.price.toLocaleString("en-IN")}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() =>
                addItem({
                  productId: flower.id,
                  productType: "flower",
                  name: flower.name,
                  price: flower.price,
                  quantity: 1,
                  image: flower.images[0],
                })
              }
              className="text-sm font-semibold"
            >
              Move to cart <ShoppingBag size={14} className="ml-1 inline" />
            </button>
            <button
              type="button"
              onClick={() => remove(flower.id)}
              className="text-sm text-ink-soft"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-lg bg-lavender p-8 text-center">
      <Heart className="mx-auto text-lavender-ink" />
      <h2 className="mt-4 font-display text-3xl">Your wishlist is quiet.</h2>
      <Link
        href="/flowers"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
      >
        Find something lovely <ArrowRight size={15} />
      </Link>
    </div>
  );
}
function Notifications({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-3">
      {orders.slice(0, 5).map((order, index) => (
        <div key={order.id} className="rounded-lg bg-white/70 p-5">
          <p className="text-xs text-ink-soft">
            {index + 1} day{index ? "s" : ""} ago
          </p>
          <h2 className="mt-2 font-semibold">
            Order {order.orderNumber} is {order.status.replaceAll("_", " ")}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Your {order.items[0]?.name} delivery is moving through our studio.
          </p>
        </div>
      ))}
    </div>
  );
}
function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.length ? (
        reviews.map((review) => (
          <div key={review.id} className="rounded-lg bg-white/70 p-6">
            <div className="flex justify-between">
              <span className="text-gold">{"★".repeat(review.rating)}</span>
              <span className="text-xs text-ink-soft">Verified purchase</span>
            </div>
            <p className="mt-4 font-display text-2xl">
              &quot;{review.comment}&quot;
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-ink-soft">
          You haven&apos;t reviewed a flower yet.
        </p>
      )}
    </div>
  );
}
