"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import { DeliverySlotSelector } from "@/components/ui/DeliverySlotSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { deliveryAreas } from "@/lib/data";
import { DELIVERY_CHARGE, DELIVERY_NOTE } from "@/lib/cart";

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);
const defaultDeliverySlotId = "slot-10-11";
const estimatedDeliveryLabel = "Estimated delivery by Tomorrow 11:00 AM";
type PaymentMethod = "online" | "cod";
interface CheckoutForm {
  name: string;
  mobile: string;
  email: string;
  whatsapp: string;
  address: string;
  areaId: string;
  city: string;
  pincode: string;
  landmark: string;
  instructions: string;
  date: string;
  slotId: string;
  payment: PaymentMethod;
}
const emptyForm: CheckoutForm = {
  name: "",
  mobile: "",
  email: "",
  whatsapp: "",
  address: "",
  areaId: "",
  city: "Delhi NCR",
  pincode: "",
  landmark: "",
  instructions: "",
  date: tomorrow,
  slotId: defaultDeliverySlotId,
  payment: "online",
};

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const total = subtotal + DELIVERY_CHARGE;
  const [step, setStep] = useState(1);
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedArea =
    deliveryAreas.find((area) => area.id === form.areaId) ??
    deliveryAreas.find((area) => area.id === form.areaId);
  const update = (key: keyof CheckoutForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const customerValid =
    form.name.trim().length > 1 &&
    /^\d{10}$/.test(form.mobile) &&
    /\S+@\S+\.\S+/.test(form.email) &&
    (!sameWhatsapp ? /^\d{10}$/.test(form.whatsapp) : true);
  const deliveryValid =
    form.address.trim().length > 8 &&
    Boolean(form.areaId) &&
    form.city.trim().length > 1;
  const next = () => {
    setError("");
    if (step === 1 && !customerValid)
      return setError(
        "Please enter a valid name, 10-digit mobile number, and email.",
      );
    if (step === 2 && !deliveryValid)
      return setError(
        "Please complete the address and select a delivery area.",
      );
    setStep(Math.min(3, step + 1));
  };
  const placeOrder = async () => {
    if (!items.length)
      return setError(
        "Your cart is empty. Add flowers before placing an order.",
      );
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.mobile,
            email: form.email,
            address: {
              line: `${form.address}${form.landmark ? ` (${form.landmark})` : ""}`,
              city: form.city,
              areaId: form.areaId,
              pincode: form.pincode,
            },
            notes: form.instructions,
          },
          items: items.map((item) => ({
            productId: item.productId,
            productType: item.productType,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          deliverySlotId: defaultDeliverySlotId,
          deliveryDate: tomorrow,
          subtotal,
          discount: 0,
          deliveryFee: DELIVERY_CHARGE,
          total,
          paymentMethod: form.payment,
          agreedToTos: true,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Something went wrong, please try again.");
      const orderId: string = body.orderId;
      const paymentSuccess = await fetch("/api/payment/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const paymentSuccessBody = await paymentSuccess.json().catch(() => null);
      if (!paymentSuccess.ok) {
        throw new Error(paymentSuccessBody?.error ?? "Payment succeeded, but confirmation failed.");
      }
      // Keep the confirmation-page preview payload (its shape is unchanged).
      const order = {
        id: orderId,
        items,
        customer: {
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          whatsapp: sameWhatsapp ? form.mobile : form.whatsapp,
        },
        delivery: {
          address: form.address,
          areaId: form.areaId,
          areaName: selectedArea?.name,
          city: form.city,
          pincode: form.pincode,
          landmark: form.landmark,
          instructions: form.instructions,
          date: tomorrow,
          slotId: defaultDeliverySlotId,
          slotLabel: estimatedDeliveryLabel,
        },
        payment: form.payment,
        subtotal,
        deliveryFee: DELIVERY_CHARGE,
        total,
        deliveryNote: DELIVERY_NOTE,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem(
        `freshflower-order-${orderId}`,
        JSON.stringify(order),
      );
      clearCart();
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong, please try again.",
      );
      setSubmitting(false);
    }
  };
if (!items.length)
    return (
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          <h1 className="text-5xl">Your cart is empty.</h1>
          <p className="mt-4 text-sm text-ink-soft">
            Add some flowers before starting a booking.
          </p>
          <Link
            href="/flowers"
            className="mt-7 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-ivory"
          >
            Browse flowers
          </Link>
        </section>
      </main>
    );
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-ink-soft"
        >
          <ArrowLeft size={15} /> Back to cart
        </Link>
        <div className="mt-8 flex items-center justify-center gap-2 sm:gap-6">
          {["Details", "Delivery", "Review"].map((label, index) => (
            <div key={label} className="flex items-center gap-2 sm:gap-6">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${step > index + 1 ? "bg-sage text-sage-ink" : step === index + 1 ? "bg-ink text-ivory" : "bg-ink/10 text-ink-soft"}`}
              >
                {step > index + 1 ? <Check size={16} /> : index + 1}
              </div>
              <span
                className={`hidden text-sm font-semibold sm:block ${step === index + 1 ? "text-ink" : "text-ink-soft"}`}
              >
                {label}
              </span>
              {index < 2 && <div className="h-px w-8 bg-ink/15 sm:w-20" />}
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_330px]">
          <section className="min-w-0">
            {step === 1 && (
              <StepCard
                title="Customer details"
                copy="We'll use these details to confirm your order and delivery."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={form.name}
                    onChange={(value) => update("name", value)}
                    required
                  />
                  <Field
                    label="Mobile"
                    value={form.mobile}
                    onChange={(value) =>
                      update("mobile", value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                    placeholder="10-digit number"
                    type="tel"
                  />
                  <Field
                    label="Email"
                    value={form.email}
                    onChange={(value) => update("email", value)}
                    required
                    type="email"
                  />
                  <Field
                    label="WhatsApp number"
                    value={sameWhatsapp ? form.mobile : form.whatsapp}
                    onChange={(value) =>
                      update("whatsapp", value.replace(/\D/g, "").slice(0, 10))
                    }
                    disabled={sameWhatsapp}
                    placeholder="10-digit number"
                    type="tel"
                  />
                </div>
                <label className="mt-4 flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={sameWhatsapp}
                    onChange={(event) => setSameWhatsapp(event.target.checked)}
                    className="h-4 w-4 accent-ink"
                  />{" "}
                  WhatsApp number is same as mobile
                </label>
              </StepCard>
            )}
            {step === 2 && (
              <StepCard
                title="Delivery details"
                copy="Tell us where and when the flowers should arrive."
              >
                <div className="grid gap-4">
                  <label className="text-sm font-semibold">
                    Full address
                    <textarea
                      value={form.address}
                      onChange={(event) =>
                        update("address", event.target.value)
                      }
                      rows={3}
                      className="mt-2 w-full rounded-md border border-ink/10 bg-white/60 p-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Area
                      <select
                        value={form.areaId}
                        onChange={(event) =>
                          update("areaId", event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-ink/10 bg-white/60 p-3 text-sm"
                      >
                        <option value="">Select delivery area</option>
                        {deliveryAreas
                          .filter((area) => area.active)
                          .map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <Field
                      label="City"
                      value={form.city}
                      onChange={(value) => update("city", value)}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Landmark"
                      value={form.landmark}
                      onChange={(value) => update("landmark", value)}
                    />
                    <div className="rounded-lg border border-sage-ink/15 bg-sage/70 p-4 text-sm">
                      <div className="flex items-center gap-3 font-semibold text-sage-ink">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70">
                          <Bike size={19} />
                        </span>
                        <span>{estimatedDeliveryLabel}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-ink-soft">
                        Rider will be assigned on a bike after order confirmation.
                      </p>
                    </div>
                  </div>
                  <label className="text-sm font-semibold">
                    Delivery instructions
                    <textarea
                      value={form.instructions}
                      onChange={(event) =>
                        update("instructions", event.target.value)
                      }
                      rows={2}
                      placeholder="Gate code, floor, preferred handoff..."
                      className="mt-2 w-full rounded-md border border-ink/10 bg-white/60 p-3 text-sm"
                    />
                  </label>
                </div>
              </StepCard>
            )}
            {step === 3 && (
              <StepCard
                title="Review & payment"
                copy="One last look before we prepare your booking."
              >
                <div className="space-y-5">
                  <SummaryRows items={items} />
                  <div className="rounded-md bg-sage p-4 text-sm">
                    <p className="font-semibold">
                      Delivering to {selectedArea?.name}
                    </p>
                    <p className="mt-1 text-ink-soft">
                      {form.address}, {form.city}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sage-ink">
                      <Bike size={16} /> {estimatedDeliveryLabel}
                    </p>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-semibold">Payment method</p>
                    <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white/60 p-4 text-sm">
                      <input
                        type="radio"
                        checked={form.payment === "online"}
                        onChange={() => update("payment", "online")}
                      />{" "}
Online · UPI / Card / Netbanking{" "}
                       <Badge tone="sage">Coming soon</Badge>
                    </label>
                    <label className="mt-2 flex items-center gap-3 rounded-md border border-ink/10 bg-white/60 p-4 text-sm">
                      <input
                        type="radio"
                        checked={form.payment === "cod"}
                        onChange={() => update("payment", "cod")}
                      />{" "}
                      Cash / Pay on Delivery
                    </label>
                  </div>
                  <div className="border-t border-ink/10 pt-5 text-sm">
                    <div className="flex justify-between">
                      <span>Flowers total</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">
                      {DELIVERY_NOTE}
                    </p>
                    <div className="mt-3 flex justify-between">
                      <span>Delivery charge</span>
                      <span>₹{DELIVERY_CHARGE.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="mt-3 flex justify-between text-lg font-bold">
                      <span>Total today</span>
                      <span>₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </StepCard>
            )}
            {error && (
              <p className="mt-4 rounded-md bg-blush px-4 py-3 text-sm font-semibold text-red-800">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              {step < 3 ? (
                <Button size="lg" onClick={next}>
                  Continue <ArrowRight size={17} />
                </Button>
              ) : (
                <Button size="lg" variant="gold" onClick={() => void placeOrder()} disabled={submitting}>
                  {submitting ? "Placing order…" : "Place Order"} {!submitting && <Check size={17} />}
                </Button>
              )}
            </div>
          </section>
          <aside className="glass-deep h-fit rounded-xl p-6 lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Booking summary
            </p>
            <h2 className="mt-3 font-display text-3xl">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </h2>
            <div className="mt-5 space-y-3 border-t border-ink/10 pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Flowers total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Delivery charge</span>
                <span>₹{DELIVERY_CHARGE.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs leading-5 text-ink-soft">{DELIVERY_NOTE}</p>
              <div className="flex justify-between border-t border-ink/10 pt-3 font-bold">
                <span>Payable now</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-ink-soft">
              <ShieldCheck size={15} className="text-sage-ink" /> Secure
              booking
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StepCard({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/65 p-5 md:p-8">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-ink-soft">{copy}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        required={required}
        disabled={disabled}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-ink/10 bg-white/60 p-3 text-sm outline-none focus:border-gold disabled:opacity-60"
      />
    </label>
  );
}
function SummaryRows({
  items,
}: {
  items: ReturnType<typeof useCart>["items"];
}) {
  return (
    <div className="divide-y divide-ink/10">
      {items.map((item) => (
        <div key={item.productId} className="flex items-center gap-3 py-3 text-sm">
          <ProductItemImage image={item.image} name={item.name} className="h-14 w-14" />
          <span className="min-w-0 flex-1">
            <span className="block truncate">{item.name}</span>
            <span className="text-ink-soft">× {item.quantity}</span>
          </span>
          <span className="font-semibold">
            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}
