"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Flower2,
  Loader2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Truck,
  X,
} from "lucide-react";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";
import { DIWALI_PORTER_DELIVERY_FEE } from "@/lib/festivals";
import { payWithRazorpay } from "@/lib/payments/checkout-client";
import {
  DiscountJourney,
  DiscountJourneySummary,
} from "@/components/sections/DiscountJourney";
import { useTieredDiscount } from "@/lib/use-tiered-discount";
import type {
  DeliveryArea,
  DiwaliBooking,
  FestivalCollection,
  Flower,
  Order,
  PaymentEvent,
} from "@/lib/types";
import { isRemoteImage, GRADIENT_TOKENS, waMeHref } from "@/lib/utils";

type CampaignProductSettings =
  NonNullable<FestivalCollection["advanceBooking"]>["productSettings"][number];
type CampaignFlower = Flower & { campaignSettings?: CampaignProductSettings };
type ColorChoice = NonNullable<Flower["colorVariants"]>[number];

const DRAFT_KEY = "diwali-booking-draft-v1";

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink-soft/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 sm:text-sm";

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-ivory transition hover:bg-ink/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const goldButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-bold text-ink transition hover:bg-gold/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-ivory-deep active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";

const cardButton =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-bold uppercase tracking-[0.08em] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type FormState = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  deliveryDate: string;
  deliveryTimePreference: string;
  deliveryAreaId: string;
  address: string;
  locality: string;
  pincode: string;
  specialInstructions: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  deliveryDate: "",
  deliveryTimePreference: "",
  deliveryAreaId: "",
  address: "",
  locality: "",
  pincode: "",
  specialInstructions: "",
};

type BookingDraft = {
  id: string;
  reference: string;
  estimatedAmount: number;
  discount: number;
  needsQuote: boolean;
  fingerprint: string;
};

type Receipt = {
  booking: DiwaliBooking;
  order: Order | null;
  events: PaymentEvent[];
};

const stepLabels = ["Choose flowers", "Booking details", "Pay advance"];

function unitText(product: CampaignFlower): string {
  if (product.unitLabel?.trim()) return product.unitLabel.trim();
  if (product.quantity) return `${product.quantity} ${product.unit ?? "unit"}`;
  return product.unit?.trim() || "unit";
}

function formatDayMonth(value: string): string {
  const date = new Date(`${value}T12:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatLongDate(value: string): string {
  const date = new Date(`${value}T12:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function inr(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status}).`);
  return body;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="mx-auto flex w-full max-w-3xl items-center gap-2" aria-label="Booking progress">
      {stepLabels.map((label, index) => {
        const number = index + 1;
        const active = step === number;
        const done = step > number;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                done
                  ? "bg-sage text-ink"
                  : active
                    ? "bg-gold text-ink"
                    : "bg-ink/10 text-ink-soft"
              }`}
            >
              {done ? <Check size={14} aria-hidden="true" /> : number}
            </span>
            <span
              className={`truncate text-[11px] font-semibold sm:text-xs ${
                active ? "text-ink" : "text-ink-soft"
              }`}
            >
              {label}
            </span>
            {index < stepLabels.length - 1 && (
              <span className="hidden h-px flex-1 bg-ink/10 sm:block" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function DiwaliBookingClient({
  campaign,
  products,
  areas,
  whatsappNumber,
}: {
  campaign: FestivalCollection;
  products: CampaignFlower[];
  areas: DeliveryArea[];
  whatsappNumber: string;
}) {
  const config = campaign.advanceBooking!;
  const { user, requireAuth } = useCustomerAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<Record<string, { quantity: number; variant: string; inBooking: boolean }>>({});
  const [customRequirements, setCustomRequirements] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [restored, setRestored] = useState(false);

  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Restore an in-progress selection after a sign-in round trip.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as {
          selected?: typeof selected;
          customRequirements?: string;
          form?: Partial<FormState>;
        };
        if (draft.selected && typeof draft.selected === "object") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelected(draft.selected);
        }
        if (typeof draft.customRequirements === "string") {
          setCustomRequirements(draft.customRequirements);
        }
        if (draft.form && typeof draft.form === "object") {
          setForm((current) => ({ ...current, ...draft.form }));
        }
      }
    } catch {
      // A corrupt draft should never block the booking form.
    } finally {
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!restored || receipt) return;
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ selected, customRequirements, form }),
      );
    } catch {
      // Private-mode storage failures are non-fatal.
    }
  }, [restored, receipt, selected, customRequirements, form]);

  // Pre-fill account details without overwriting anything typed before sign-in.
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
      phone: current.phone || user.phone,
    }));
  }, [user]);

  const variantsFor = (product: CampaignFlower): ColorChoice[] =>
    (product.colorVariants ?? []).filter(
      (variant) =>
        !product.campaignSettings ||
        (product.campaignSettings.eligibleVariants ?? []).includes(variant.color),
    );

  const minFor = (product: CampaignFlower) => product.campaignSettings?.minQuantity ?? 1;
  const maxFor = (product: CampaignFlower) => product.campaignSettings?.maxQuantity ?? 99;
  const quantityFor = (product: CampaignFlower) => selected[product.id]?.quantity ?? minFor(product);
  const activeVariantFor = (product: CampaignFlower) =>
    selected[product.id]?.variant || variantsFor(product)[0]?.color || "";
  const priceFor = (product: CampaignFlower) =>
    variantsFor(product).find((variant) => variant.color === activeVariantFor(product))?.price ??
    product.price;

  const selectedProducts = products.filter((product) => selected[product.id]?.inBooking);
  const itemCount = selectedProducts.reduce((sum, product) => sum + quantityFor(product), 0);
  const needsQuote =
    Boolean(customRequirements.trim()) ||
    selectedProducts.some((product) => {
      const setting = product.campaignSettings;
      return Boolean(setting?.bulkOrderEligible && quantityFor(product) > 1);
    });
  const estimate = selectedProducts.reduce(
    (sum, product) => sum + priceFor(product) * quantityFor(product),
    0,
  );
  const deliveryFee = DIWALI_PORTER_DELIVERY_FEE;
  const tier = useTieredDiscount(estimate, "diwali");
  const appliedDiscount = Math.min(estimate, booking?.discount ?? tier.discount);
  const advanceTotal = Math.max(0, estimate - appliedDiscount + deliveryFee);

  const fingerprint = useMemo(
    () =>
      JSON.stringify({
        items: selectedProducts.map((product) => ({
          id: product.id,
          quantity: quantityFor(product),
          variant: activeVariantFor(product),
        })),
        customRequirements: customRequirements.trim(),
        form,
      }),
    // The derived helpers are pure projections of these inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedProducts, selected, customRequirements, form],
  );

  function scrollTop(behavior: ScrollBehavior = "smooth") {
    window.scrollTo({ top: 0, behavior });
  }

  function invalidateBooking() {
    if (booking && !receipt) setBooking(null);
  }

  function updateProduct(product: CampaignFlower, patch: Partial<{ quantity: number; variant: string }>) {
    invalidateBooking();
    setSelected((current) => {
      const previous = current[product.id];
      return {
        ...current,
        [product.id]: {
          quantity: previous?.quantity ?? minFor(product),
          variant: previous?.variant ?? "",
          inBooking: previous?.inBooking ?? false,
          ...patch,
        },
      };
    });
  }

  function stepQuantity(product: CampaignFlower, delta: number) {
    const next = quantityFor(product) + delta;
    updateProduct(product, {
      quantity: Math.min(maxFor(product), Math.max(minFor(product), next)),
    });
  }

  function toggleProduct(product: CampaignFlower) {
    invalidateBooking();
    setSelected((current) => {
      const previous = current[product.id];
      return {
        ...current,
        [product.id]: {
          quantity: previous?.quantity ?? minFor(product),
          variant: previous?.variant || variantsFor(product)[0]?.color || "",
          inBooking: !previous?.inBooking,
        },
      };
    });
    setError("");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    invalidateBooking();
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goToDetails() {
    if (!selectedProducts.length) {
      setError("Add at least one flower to continue.");
      return;
    }
    setError("");
    setStep(2);
    scrollTop();
  }

  async function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProducts.length) {
      setError("Add at least one flower to continue.");
      setStep(1);
      return;
    }
    if (!user) {
      requireAuth();
      return;
    }
    if (booking?.fingerprint === fingerprint) {
      setStep(3);
      scrollTop();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = await readJson(
        await fetch("/api/diwali/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              name: form.name,
              phone: form.phone,
              whatsapp: form.whatsapp || undefined,
              email: form.email || undefined,
            },
            items: selectedProducts.map((product) => ({
              productId: product.id,
              variant: activeVariantFor(product) || undefined,
              quantity: quantityFor(product),
            })),
            deliveryDate: form.deliveryDate,
            deliveryTimePreference: form.deliveryTimePreference,
            deliveryAreaId: form.deliveryAreaId,
            address: form.address,
            locality: form.locality,
            pincode: form.pincode,
            specialInstructions: form.specialInstructions || undefined,
            customRequirements: customRequirements.trim() || undefined,
          }),
        }),
      );
      setBooking({
        id: String(body.booking.id),
        reference: String(body.reference),
        estimatedAmount: Number(body.estimatedAmount ?? 0),
        discount: Number(body.discount ?? 0),
        needsQuote: Boolean(body.needsQuote),
        fingerprint,
      });
      setStep(3);
      scrollTop();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function payNow() {
    if (!booking) {
      setStep(2);
      return;
    }
    setPaying(true);
    setError("");
    try {
      const order = await readJson(
        await fetch(`/api/diwali/bookings/${encodeURIComponent(booking.id)}/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        }),
      );
      if (order.alreadyPaid) {
        const receiptBody = await readJson(
          await fetch(`/api/diwali/bookings/${encodeURIComponent(booking.id)}`),
        );
        setReceipt({
          booking: receiptBody.booking as DiwaliBooking,
          order: receiptBody.order as Order | null,
          events: (receiptBody.events ?? []) as PaymentEvent[],
        });
        setBooking(null);
        window.sessionStorage.removeItem(DRAFT_KEY);
        return;
      }
      await payWithRazorpay(String(order.orderId), {
        name: form.name,
        email: form.email || undefined,
        contact: form.phone,
      });
      const receiptBody = await readJson(
        await fetch(`/api/diwali/bookings/${encodeURIComponent(booking.id)}`),
      );
      setReceipt({
        booking: receiptBody.booking as DiwaliBooking,
        order: receiptBody.order as Order | null,
        events: (receiptBody.events ?? []) as PaymentEvent[],
      });
      setBooking(null);
      window.sessionStorage.removeItem(DRAFT_KEY);
      scrollTop("auto");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Payment could not be completed. You can retry below.");
    } finally {
      setPaying(false);
    }
  }

  const supportHref = whatsappNumber
    ? `${waMeHref(whatsappNumber)}?text=${encodeURIComponent("Hi FreshFlower.zone, I need help with my Diwali advance booking.")}`
    : "";

  if (receipt) {
    const paidOrder = receipt.order;
    const paidAmount = paidOrder?.total ?? receipt.booking.paymentAmount ?? receipt.booking.estimatedAmount ?? 0;
    return (
      <main className="min-h-screen bg-ivory px-4 py-8 text-ink sm:px-5 sm:py-16">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
          <div className="bg-ink px-5 py-8 text-center text-ivory sm:px-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-ink">
              <CheckCircle2 size={30} aria-hidden="true" />
            </span>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-soft">Advance payment received</p>
            <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">Your Diwali booking is confirmed.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ivory/75">
              We have verified your payment with Razorpay. Our team will contact you to confirm availability and the final delivery details.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="rounded-xl border border-dashed border-gold/50 bg-gold/5 px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">Booking reference</p>
              <p className="mt-1 font-mono text-base font-bold tracking-[0.08em] sm:text-lg">{receipt.booking.reference}</p>
              {paidOrder && <p className="mt-1 text-[11px] text-ink-soft">Order {paidOrder.orderNumber}</p>}
            </div>

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Amount paid</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">{inr(paidAmount)}</dd>
                <dd className="mt-0.5 text-[11px] text-ink-soft">
                  Includes {inr(paidOrder?.deliveryFee ?? deliveryFee)} Porter delivery
                </dd>
                {Number(receipt.booking.discount ?? 0) > 0 && (
                  <dd className="mt-0.5 text-[11px] text-sage-ink">
                    Includes {inr(Number(receipt.booking.discount))} cart reward
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Payment status</dt>
                <dd className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-sage/40 px-3 py-1 text-xs font-bold uppercase text-sage-ink">
                  <BadgeCheck size={14} /> Paid
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Transaction ID</dt>
                <dd className="mt-1 break-all font-mono text-xs">
                  {receipt.booking.razorpayPaymentId ?? paidOrder?.razorpayPaymentId ?? "Recorded by Razorpay"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Payment mode</dt>
                <dd className="mt-1">
                  {(receipt.booking.razorpayPaymentMethod ?? paidOrder?.razorpayPaymentMethod)?.toUpperCase() ?? "Razorpay"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Paid at</dt>
                <dd className="mt-1">{formatDateTime(receipt.booking.paidAt ?? paidOrder?.paidAt)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Delivery</dt>
                <dd className="mt-1">{formatLongDate(receipt.booking.deliveryDate)} · {receipt.booking.deliveryTimePreference}</dd>
              </div>
            </dl>

            {receipt.events.length > 0 && (
              <div className="mt-6 border-t border-ink/10 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">Payment events</p>
                <ol className="mt-3 space-y-3">
                  {receipt.events.map((event) => (
                    <li key={`${event.type}-${event.createdAt}`} className="flex gap-3 text-sm">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                      <span>
                        <span className="block font-semibold">{event.type.replaceAll(".", " ")}</span>
                        <span className="block text-xs text-ink-soft">
                          {formatDateTime(event.createdAt)}{event.actor ? ` · ${event.actor}` : ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {paidOrder && (
                <Link href={`/account/orders/${paidOrder.id}`} className={primaryButton}>
                  <CreditCard size={17} aria-hidden="true" /> View in my orders
                </Link>
              )}
              <Link href="/flowers" className={paidOrder ? secondaryButton : primaryButton}>
                Continue shopping <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-ink-soft">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" />
              {receipt.booking.needsQuote
                ? "This payment is an advance against your estimate. Our team will confirm the final amount and adjust any difference before delivery."
                : "Your payment is verified. The booking remains an advance request until our team confirms stock and delivery."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const productImage = (product: CampaignFlower) => product.images[0] ?? "gradient-ivory";

  return (
    <main className="min-h-screen bg-ivory text-ink">
      {step === 1 ? (
        <>
          <section className="relative isolate overflow-hidden bg-ink px-4 pb-7 pt-8 text-ivory sm:px-6 sm:pb-10 sm:pt-12 md:px-10 md:py-14">
            {campaign.bannerImage && (
              <Image src={campaign.bannerImage} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/45" />
            <div className="mx-auto max-w-7xl">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-soft sm:text-xs">
                <Sparkles size={14} aria-hidden="true" />
                {config.announcement || "Diwali special · Advance bookings open"}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-[1.75rem] leading-[1.15] sm:mt-4 sm:text-5xl md:text-6xl">
                {campaign.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/80 sm:mt-4 sm:text-base sm:leading-7">
                {config.description || campaign.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                {config.deliveryDates.slice(0, 4).map((date) => (
                  <span key={date} className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-ivory/10 px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur-sm sm:px-3 sm:text-xs">
                    <CalendarDays size={13} aria-hidden="true" /> {formatDayMonth(date)}
                  </span>
                ))}
                {config.earlyMorningDelivery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-ivory/10 px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur-sm sm:px-3 sm:text-xs">
                    <Sunrise size={13} aria-hidden="true" /> Early morning
                  </span>
                )}
                {campaign.whatsappBulkOrderEnabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-ivory/10 px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur-sm sm:px-3 sm:text-xs">
                    <Truck size={13} aria-hidden="true" /> Bulk orders welcome
                  </span>
                )}
              </div>
              {campaign.lastOrderByText && (
                <p className="mt-3 text-[11px] font-medium text-gold-soft/90 sm:text-xs">{campaign.lastOrderByText}</p>
              )}
            </div>
          </section>

          <section aria-label="How advance booking works" className="border-b border-ink/10 bg-white/70">
            <ul className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-ink/10 px-2 py-3 sm:py-4">
              {[
                { icon: ShieldCheck, label: "Select flowers" },
                { icon: MapPin, label: "Add delivery details" },
                { icon: CreditCard, label: "Pay advance securely" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-semibold leading-4 text-ink-soft sm:flex-row sm:gap-2 sm:text-xs">
                  <Icon size={16} className="shrink-0 text-sage-ink" aria-hidden="true" /> {label}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className="border-b border-ink/10 bg-white/80 px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => {
                setStep(step === 3 ? 2 : 1);
                scrollTop();
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-ink-soft transition hover:text-ink"
            >
              <ArrowLeft size={16} aria-hidden="true" /> {step === 3 ? "Back to details" : "Back to flowers"}
            </button>
            <div className="mt-3">
              <StepIndicator step={step} />
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-8 md:px-10">
          <StepIndicator step={1} />

          <section id="products" className="mt-7">
            <div className="mb-4 sm:mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage-ink sm:text-xs">Step 1 · Choose flowers</p>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-2 sm:mt-2">
                <h2 className="font-display text-2xl leading-tight sm:text-4xl">Diwali flowers</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/30 px-2.5 py-1 text-[10px] font-semibold text-sage-ink sm:text-xs">
                  <Flower2 size={13} aria-hidden="true" />
                  {products.length} {products.length === 1 ? "flower" : "flowers"} available
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-ink-soft sm:text-sm">
                Live catalogue prices and options. Choose your flowers, then add delivery details on the next step.
              </p>
            </div>

            {error && (
              <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-900">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </p>
            )}

            {products.length ? (
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {products.map((product) => {
                  const variants = variantsFor(product);
                  const choice = selected[product.id];
                  const inBooking = Boolean(choice?.inBooking);
                  const quantity = quantityFor(product);
                  const min = minFor(product);
                  const max = maxFor(product);
                  const image = productImage(product);
                  const displayName = product.campaignSettings?.displayLabel || product.name;
                  const description = product.campaignSettings?.promotionalDescription || product.shortDescription;
                  const price = priceFor(product);
                  const unit = unitText(product);

                  return (
                    <article
                      key={product.id}
                      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(43,38,32,0.04)] transition ${
                        inBooking ? "border-gold/60 ring-1 ring-gold/20" : "border-ink/10"
                      }`}
                    >
                      <div className="flex gap-3 p-3 sm:block sm:p-4">
                        <div
                          className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-xl sm:aspect-[4/3] sm:h-auto sm:w-full"
                          style={
                            !isRemoteImage(image)
                              ? { background: GRADIENT_TOKENS[image] ?? GRADIENT_TOKENS["gradient-ivory"] }
                              : undefined
                          }
                        >
                          {isRemoteImage(image) ? (
                            <Image
                              src={image}
                              alt={displayName}
                              fill
                              sizes="(max-width: 640px) 88px, (max-width: 1024px) 45vw, 30vw"
                              className="object-cover"
                            />
                          ) : (
                            <Flower2 size={34} strokeWidth={0.9} className="absolute inset-0 m-auto text-ink/25" aria-hidden="true" />
                          )}
                          {product.campaignSettings?.featured && (
                            <span title="Featured" className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-ink shadow-sm sm:left-3 sm:top-3">
                              <Sparkles size={12} aria-hidden="true" />
                              <span className="sr-only">Featured flower</span>
                            </span>
                          )}
                          {inBooking && (
                            <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-sage text-ink shadow-sm sm:right-3 sm:top-3">
                              <Check size={13} aria-hidden="true" />
                              <span className="sr-only">Added to your booking</span>
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 sm:mt-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{displayName}</h3>
                            <p className="shrink-0 text-sm font-bold tabular-nums sm:text-base">{inr(price)}</p>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-ink-soft sm:text-xs sm:leading-5">{description}</p>
                          <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-sage-ink sm:text-[11px]">
                            {unit}
                            {product.campaignSettings?.bulkOrderEligible && (
                              <span className="rounded-full bg-sage/30 px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal">Bulk ok</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto px-3 pb-3 sm:px-4 sm:pb-4">
                        {variants.length > 0 && (
                          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                            Variant
                            <select
                              value={activeVariantFor(product)}
                              onChange={(event) => updateProduct(product, { variant: event.target.value })}
                              className={fieldClass}
                            >
                              {variants.map((variant) => (
                                <option key={variant.color} value={variant.color}>
                                  {variant.color} · {inr(variant.price)}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}

                        <div className="flex items-center justify-between gap-2 pb-1.5 pt-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft sm:text-[11px]">Quantity · {unit}</span>
                          {inBooking && <span className="text-[10px] font-semibold text-sage-ink sm:text-[11px]">In booking</span>}
                        </div>

                        <div className="flex items-stretch gap-2">
                          <div className="flex shrink-0 items-center rounded-lg border border-ink/15 bg-white">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${displayName}`}
                              disabled={quantity <= min}
                              onClick={() => stepQuantity(product, -1)}
                              className="flex h-11 w-11 items-center justify-center rounded-l-lg text-ink transition hover:bg-ivory-deep active:bg-ivory-deep disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Minus size={16} aria-hidden="true" />
                            </button>
                            <input
                              type="number"
                              aria-label={`Quantity of ${displayName}`}
                              inputMode="numeric"
                              min={min}
                              max={max}
                              value={quantity}
                              onFocus={(event) => event.currentTarget.select()}
                              onChange={(event) => {
                                const next = Number(event.target.value);
                                if (!Number.isFinite(next)) return;
                                updateProduct(product, { quantity: Math.min(max, Math.max(min, Math.round(next))) });
                              }}
                              className="h-11 w-11 border-x border-ink/10 bg-transparent text-center text-sm font-bold tabular-nums text-ink focus:outline-none"
                            />
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${displayName}`}
                              disabled={quantity >= max}
                              onClick={() => stepQuantity(product, 1)}
                              className="flex h-11 w-11 items-center justify-center rounded-r-lg text-ink transition hover:bg-ivory-deep active:bg-ivory-deep disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus size={16} aria-hidden="true" />
                            </button>
                          </div>

                          <button
                            type="button"
                            aria-pressed={inBooking}
                            onClick={() => toggleProduct(product)}
                            className={`${cardButton} ${
                              inBooking ? "border border-ink/15 bg-white text-ink hover:bg-ivory-deep" : "bg-ink text-ivory hover:bg-ink/90"
                            }`}
                          >
                            {inBooking ? (
                              <>
                                <X size={15} aria-hidden="true" /> Remove
                              </>
                            ) : (
                              <>
                                <Plus size={15} aria-hidden="true" /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl bg-white p-6 text-sm text-ink-soft">
                The campaign has no currently available products. Please contact us on WhatsApp.
              </p>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:mt-10 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                  {itemCount} {itemCount === 1 ? "item" : "items"} selected
                </p>
                <p className="mt-1 text-2xl font-display">{inr(advanceTotal)}</p>
                <p className="text-[11px] text-ink-soft">
                  Includes {inr(deliveryFee)} Porter delivery · {needsQuote ? "final amount confirmed by our team" : "payable on the next step"}
                </p>
              </div>
              <button type="button" onClick={goToDetails} disabled={!selectedProducts.length} className={`${goldButton} w-full sm:w-auto`}>
                Continue to details <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
            {selectedProducts.length > 0 && (
              <ul className="mt-4 grid gap-2 border-t border-ink/10 pt-4 sm:grid-cols-2">
                {selectedProducts.map((product) => (
                  <li key={product.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {quantityFor(product)} × {product.campaignSettings?.displayLabel || product.name}
                      </span>
                      <span className="text-[11px] text-ink-soft">
                        {unitText(product)}{activeVariantFor(product) ? ` · ${activeVariantFor(product)}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{inr(priceFor(product) * quantityFor(product))}</span>
                  </li>
                ))}
              </ul>
            )}
            {selectedProducts.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-ink/10 pt-3 text-sm">
                <p className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Flower subtotal</span>
                  <span className="font-semibold tabular-nums">{inr(estimate)}</span>
                </p>
                {appliedDiscount > 0 && (
                  <p className="flex items-center justify-between gap-3 text-sage-ink">
                    <span>Automatic reward</span>
                    <span className="font-semibold tabular-nums">−{inr(appliedDiscount)}</span>
                  </p>
                )}
                <p className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Porter delivery</span>
                  <span className="font-semibold tabular-nums">{inr(deliveryFee)}</span>
                </p>
              </div>
            )}
          </section>

          {selectedProducts.length > 0 && (
            <DiscountJourney result={tier} className="mt-6" />
          )}

          {selectedProducts.length > 0 && (
            <div
              className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur-md lg:hidden"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto flex max-w-7xl items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-ink-soft">
                    {itemCount} {itemCount === 1 ? "item" : "items"} · incl. delivery
                  </p>
                  <p className="truncate text-sm font-bold tabular-nums">{inr(advanceTotal)}</p>
                </div>
                <button type="button" onClick={goToDetails} className={`${goldButton} shrink-0 px-4`}>
                  Continue <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form
          id="booking-details-form"
          onSubmit={submitDetails}
          className="mx-auto grid max-w-7xl items-start gap-5 px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:grid-cols-[1fr_360px] lg:gap-8 md:px-10"
        >
          <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage-ink sm:text-xs">Step 2 · Booking details</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl">Where should we deliver?</h1>
            <p className="mt-1.5 text-xs leading-5 text-ink-soft sm:text-sm">
              We only use these details to confirm and deliver your Diwali booking.
            </p>

            {!user && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-gold/10 px-3 py-2 text-xs leading-5 text-ink-soft">
                <LockKeyhole size={15} className="mt-0.5 shrink-0" />
                You&apos;ll be asked to sign in when you continue. Your selection is saved automatically.
              </p>
            )}

            {error && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-900">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </p>
            )}

            <div className="mt-5 border-t border-ink/10 pt-5">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft sm:text-xs">
                <Phone size={14} className="text-sage-ink" aria-hidden="true" /> Contact
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <label className="block text-sm font-medium">
                  Name <span className="text-gold" aria-hidden="true">*</span>
                  <input
                    required
                    name="name"
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Mobile number <span className="text-gold" aria-hidden="true">*</span>
                  <input
                    required
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  WhatsApp number <span className="text-ink-soft">(if different)</span>
                  <input
                    type="tel"
                    name="whatsapp"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="Optional"
                    value={form.whatsapp}
                    onChange={(event) => updateField("whatsapp", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Email <span className="text-ink-soft">(optional)</span>
                  <input
                    type="email"
                    name="email"
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 border-t border-ink/10 pt-5">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft sm:text-xs">
                <MapPin size={14} className="text-sage-ink" aria-hidden="true" /> Delivery
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <label className="block text-sm font-medium">
                  Delivery date <span className="text-gold" aria-hidden="true">*</span>
                  <select
                    required
                    name="deliveryDate"
                    value={form.deliveryDate}
                    onChange={(event) => updateField("deliveryDate", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="" disabled>Select a date</option>
                    {config.deliveryDates.map((date) => (
                      <option key={date} value={date}>{formatLongDate(date)}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Delivery time <span className="text-gold" aria-hidden="true">*</span>
                  <select
                    required
                    name="deliveryTimePreference"
                    value={form.deliveryTimePreference}
                    onChange={(event) => updateField("deliveryTimePreference", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="" disabled>Select a time</option>
                    {config.deliveryTimePreferences.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium sm:col-span-2">
                  Delivery area <span className="text-gold" aria-hidden="true">*</span>
                  <select
                    required
                    name="deliveryAreaId"
                    value={form.deliveryAreaId}
                    onChange={(event) => updateField("deliveryAreaId", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="" disabled>Select your locality</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium sm:col-span-2">
                  Full delivery address <span className="text-gold" aria-hidden="true">*</span>
                  <textarea
                    required
                    name="address"
                    minLength={5}
                    maxLength={300}
                    autoComplete="street-address"
                    rows={2}
                    placeholder="House / flat, street, landmark"
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Locality <span className="text-gold" aria-hidden="true">*</span>
                  <input
                    required
                    name="locality"
                    maxLength={120}
                    autoComplete="address-level2"
                    placeholder="Area or colony"
                    value={form.locality}
                    onChange={(event) => updateField("locality", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium">
                  PIN code <span className="text-gold" aria-hidden="true">*</span>
                  <input
                    required
                    name="pincode"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="6-digit PIN"
                    value={form.pincode}
                    onChange={(event) => updateField("pincode", event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 border-t border-ink/10 pt-5">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft sm:text-xs">
                <MessageSquareText size={14} className="text-sage-ink" aria-hidden="true" /> Notes
              </p>
              <div className="mt-3 grid gap-3 sm:gap-4">
                <label className="block text-sm font-medium">
                  Special instructions <span className="text-ink-soft">(optional)</span>
                  <textarea
                    name="specialInstructions"
                    maxLength={1000}
                    rows={2}
                    placeholder="Delivery notes, gate code, preferred timing"
                    value={form.specialInstructions}
                    onChange={(event) => updateField("specialInstructions", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                {config.customRequirementsEnabled && (
                  <label className="block text-sm font-medium">
                    Custom or bulk flower requirements <span className="text-ink-soft">(optional)</span>
                    <textarea
                      name="customRequirements"
                      value={customRequirements}
                      onChange={(event) => {
                        invalidateBooking();
                        setCustomRequirements(event.target.value);
                      }}
                      maxLength={2000}
                      rows={3}
                      placeholder="Tell us about additional flowers, large quantities or event requirements."
                      className={fieldClass}
                    />
                    <span className="mt-1 block text-[11px] font-normal leading-4 text-ink-soft">
                      Bulk notes or larger quantities are priced as an estimate; our team confirms the final amount.
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="mt-6 hidden gap-3 sm:flex">
              <button type="button" onClick={() => { setStep(1); scrollTop(); }} className={secondaryButton}>
                <ArrowLeft size={16} aria-hidden="true" /> Back
              </button>
              <button type="submit" disabled={submitting} className={`${goldButton} flex-1`}>
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Saving booking…
                  </>
                ) : (
                  <>
                    Continue to payment <ArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </section>

          <aside className="rounded-2xl bg-ink p-4 text-ivory shadow-sm sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-soft sm:text-xs">Your selection</p>
              <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[10px] font-semibold text-ivory/80">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <ul className="mt-3 divide-y divide-ivory/10">
              {selectedProducts.map((product) => (
                <li key={product.id} className="flex items-start gap-2 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5 text-ivory/90 sm:text-sm">
                      {quantityFor(product)} × {product.campaignSettings?.displayLabel || product.name}
                      {activeVariantFor(product) ? ` (${activeVariantFor(product)})` : ""}
                    </p>
                    <p className="text-[11px] text-ivory/50">{unitText(product)}</p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold tabular-nums sm:text-sm">
                    {inr(priceFor(product) * quantityFor(product))}
                  </p>
                </li>
              ))}
            </ul>
            <DiscountJourneySummary result={tier} tone="dark" className="mt-3" />
            <div className="mt-3 space-y-1.5 border-t border-ivory/15 pt-3 text-sm">
              <p className="flex items-center justify-between gap-3 text-xs text-ivory/60">
                <span>Flower subtotal</span>
                <span className="tabular-nums">{inr(estimate)}</span>
              </p>
              {appliedDiscount > 0 && (
                <p className="flex items-center justify-between gap-3 text-xs text-gold-soft">
                  <span>Automatic reward</span>
                  <span className="tabular-nums">−{inr(appliedDiscount)}</span>
                </p>
              )}
              <p className="flex items-center justify-between gap-3 text-xs text-ivory/60">
                <span>Porter delivery</span>
                <span className="tabular-nums">{inr(deliveryFee)}</span>
              </p>
              <p className="flex items-center justify-between gap-3 border-t border-ivory/15 pt-2">
                <span className="text-ivory/65">Advance payable</span>
                <strong className="text-base tabular-nums sm:text-lg">{inr(advanceTotal)}</strong>
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-4 text-ivory/60">
                <ShieldCheck size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                You&apos;ll review this amount and pay securely on the next step.
              </p>
              <button type="button" onClick={() => { setStep(1); scrollTop(); }} className="mt-3 text-xs font-semibold text-gold-soft underline decoration-gold-soft/40 underline-offset-4">
                Edit flowers
              </button>
            </div>
          </aside>

          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur-md sm:hidden"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-ink-soft">Advance payable · incl. delivery</p>
                <p className="truncate text-sm font-bold tabular-nums">{inr(advanceTotal)}</p>
              </div>
              <button type="submit" disabled={submitting} className={`${goldButton} shrink-0 px-4`}>
                {submitting ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                {user ? "Continue" : "Sign in & continue"}
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="mx-auto max-w-2xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
          <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
            <div className="border-b border-ink/10 bg-ivory-deep/40 px-5 py-5 sm:px-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage-ink">Step 3 · Pay advance</p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl">Secure your Diwali booking</h1>
              <p className="mt-1.5 text-sm leading-6 text-ink-soft">
                Pay the advance now. Your booking is confirmed only after Razorpay verifies the payment.
              </p>
            </div>

            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-end justify-between gap-3 rounded-xl bg-ink px-4 py-4 text-ivory">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-soft">Advance payable</p>
                  <p className="mt-1 text-3xl font-display tabular-nums">{inr(booking?.estimatedAmount ?? advanceTotal)}</p>
                </div>
                <span className="rounded-full bg-ivory/10 px-2.5 py-1 text-[10px] font-semibold text-ivory/80">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {booking?.reference && (
                <p className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-ivory px-3 py-2 text-xs">
                  <span className="text-ink-soft">Booking reference</span>
                  <span className="font-mono font-bold">{booking.reference}</span>
                </p>
              )}

              <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                {selectedProducts.map((product) => (
                  <li key={product.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {quantityFor(product)} × {product.campaignSettings?.displayLabel || product.name}
                      </span>
                      <span className="text-[11px] text-ink-soft">
                        {unitText(product)}{activeVariantFor(product) ? ` · ${activeVariantFor(product)}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{inr(priceFor(product) * quantityFor(product))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Flower subtotal</span>
                  <span className="font-semibold tabular-nums">{inr(estimate)}</span>
                </p>
                {appliedDiscount > 0 && (
                  <p className="flex items-center justify-between gap-3 text-sage-ink">
                    <span>Automatic reward</span>
                    <span className="font-semibold tabular-nums">−{inr(appliedDiscount)}</span>
                  </p>
                )}
                <p className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Porter delivery</span>
                  <span className="font-semibold tabular-nums">{inr(deliveryFee)}</span>
                </p>
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Delivery</dt>
                  <dd className="mt-0.5">{form.deliveryDate ? formatLongDate(form.deliveryDate) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Time</dt>
                  <dd className="mt-0.5">{form.deliveryTimePreference || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Address</dt>
                  <dd className="mt-0.5">{form.address}, {form.locality} · {form.pincode}</dd>
                </div>
              </dl>

              {(booking?.needsQuote ?? needsQuote) && (
                <p className="mt-4 rounded-lg bg-gold/10 px-3 py-2 text-xs leading-5 text-ink-soft">
                  Bulk or custom items are included in this estimate. Our team will confirm the final amount and adjust the difference before delivery.
                </p>
              )}

              {error && (
                <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-900">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
                </p>
              )}

              <button type="button" onClick={payNow} disabled={paying} className={`${primaryButton} mt-5 w-full`}>
                {paying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Processing payment…
                  </>
                ) : (
                  <>
                    <CreditCard size={18} aria-hidden="true" /> Pay {inr(booking?.estimatedAmount ?? advanceTotal)} now
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-soft">
                <LockKeyhole size={13} aria-hidden="true" /> Secured by Razorpay · UPI, cards, netbanking & wallets
              </p>
              <button type="button" onClick={() => { setStep(2); scrollTop(); }} disabled={paying} className="mt-3 w-full text-xs font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4">
                Back to booking details
              </button>
            </div>
          </section>

          <p className="mt-4 flex items-start gap-2 rounded-xl bg-sage/30 p-3 text-[11px] leading-5 text-ink-soft">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-sage-ink" aria-hidden="true" />
            Payment is verified with Razorpay before your booking is confirmed. If the gateway is interrupted, your booking is saved and you can retry.
          </p>

          {supportHref && (
            <a href={supportHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4">
              <MessageCircle size={14} aria-hidden="true" /> Need help? Message us on WhatsApp
            </a>
          )}
        </div>
      )}
    </main>
  );
}
