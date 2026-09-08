"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { DeliverySlotSelector } from "@/components/ui/DeliverySlotSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { deliveryAreas, deliverySlots } from "@/lib/data";
import { DELIVERY_NOTE } from "@/lib/cart";
import { getSlotAvailability, isServiceablePincode } from "@/lib/delivery";
import {
  DEFAULT_MAX_ORDERS,
  loadDeliveryConfig,
  type DeliveryConfig,
} from "@/lib/admin/overrides";
import type { DeliveryArea } from "@/lib/types";

const today = new Date().toISOString().slice(0, 10);
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
  date: "",
  slotId: "",
  payment: "online",
};

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, itemCount } = useCart();
  const [step, setStep] = useState(1);
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [error, setError] = useState("");
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig | null>(
    null,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeliveryConfig(loadDeliveryConfig());
  }, []);

  const slotAvailability = useMemo(() => {
    if (!deliveryConfig) return form.date ? getSlotAvailability(form.date) : {};
    const maxOrdersBySlot = Object.fromEntries(
      deliverySlots.map((slot) => [
        slot.id,
        deliveryConfig.slots[slot.id]?.maxOrders ?? DEFAULT_MAX_ORDERS,
      ]),
    );
    const enabledSlotIds = deliverySlots
      .map((slot) => slot.id)
      .filter((id) => deliveryConfig.slots[id]?.enabled ?? true);
    return form.date
      ? getSlotAvailability(form.date, { maxOrdersBySlot, enabledSlotIds })
      : {};
  }, [form.date, deliveryConfig]);

  const hiddenSlotIds = useMemo(
    () =>
      deliveryConfig
        ? deliverySlots
            .map((slot) => slot.id)
            .filter((id) => deliveryConfig.slots[id]?.enabled === false)
        : [],
    [deliveryConfig],
  );

  const effectiveAreas = useMemo(() => {
    if (!deliveryConfig) return deliveryAreas;
    const stored = deliveryConfig.areas;
    const merged = deliveryAreas
      .filter((area) => stored[area.id] !== "deleted")
      .map((area) =>
        stored[area.id] && stored[area.id] !== "deleted"
          ? (stored[area.id] as DeliveryArea)
          : area,
      );
    for (const [id, entry] of Object.entries(stored)) {
      if (
        entry !== "deleted" &&
        !deliveryAreas.some((candidate) => candidate.id === id)
      ) {
        merged.push(entry as DeliveryArea);
      }
    }
    return merged;
  }, [deliveryConfig]);
  const selectedArea =
    effectiveAreas.find((area) => area.id === form.areaId) ??
    deliveryAreas.find((area) => area.id === form.areaId);
  const pincodeChecked = form.pincode.length === 6;
  const pincodeServiceable =
    pincodeChecked && isServiceablePincode(form.pincode, effectiveAreas);
  const availableSlots = deliverySlots.filter(
    (slot) => slotAvailability[slot.id] !== false,
  );
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
    form.city.trim().length > 1 &&
    pincodeServiceable &&
    Boolean(form.date) &&
    form.date >= today &&
    Boolean(form.slotId) &&
    availableSlots.some((slot) => slot.id === form.slotId);
  const next = () => {
    setError("");
    if (step === 1 && !customerValid)
      return setError(
        "Please enter a valid name, 10-digit mobile number, and email.",
      );
    if (step === 2 && !deliveryValid)
      return setError(
        !pincodeServiceable
          ? "Please enter a serviceable Delhi NCR pincode before continuing."
          : "Please complete the address, date, and an available delivery slot.",
      );
    setStep(Math.min(3, step + 1));
  };
  const placeOrder = () => {
    if (!items.length)
      return setError(
        "Your cart is empty. Add flowers before placing an order.",
      );
    const orderId = `FF-${Date.now().toString(36).toUpperCase()}`;
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
        date: form.date,
        slotId: form.slotId,
        slotLabel: deliverySlots.find((slot) => slot.id === form.slotId)?.label,
      },
      payment: form.payment,
      subtotal,
      deliveryFee: 0,
      total: subtotal,
      deliveryNote: DELIVERY_NOTE,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(
      `freshflower-order-${orderId}`,
      JSON.stringify(order),
    ); // TODO Phase 8: replace temporary sessionStorage save with POST /api/orders backed by MongoDB.
    router.push(`/order-confirmation/${orderId}`);
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
                        {effectiveAreas
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
                    <label className="text-sm font-semibold">
                      Pincode
                      <input
                        value={form.pincode}
                        onChange={(event) =>
                          update(
                            "pincode",
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        inputMode="numeric"
                        maxLength={6}
                        className="mt-2 w-full rounded-md border border-ink/10 bg-white/60 p-3 text-sm outline-none focus:border-gold"
                      />
                      {pincodeChecked && (
                        <span
                          className={`mt-2 block text-xs font-semibold ${pincodeServiceable ? "text-sage-ink" : "text-red-700"}`}
                        >
                          {pincodeServiceable
                            ? "✅ We deliver to your location"
                            : "❌ Currently unavailable in your area. Try WhatsApp for help."}
                        </span>
                      )}
                    </label>
                    <Field
                      label="Landmark"
                      value={form.landmark}
                      onChange={(value) => update("landmark", value)}
                    />
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Delivery date
                      <input
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={(event) => {
                          update("date", event.target.value);
                          update("slotId", "");
                        }}
                        className="mt-2 w-full rounded-md border border-ink/10 bg-white/60 p-3 text-sm"
                      />
                    </label>
                    <div className="text-sm font-semibold">
                      Delivery slots
                      <p className="mb-2 mt-2 text-xs font-normal text-ink-soft">
                        Availability is simulated by date.
                      </p>
<DeliverySlotSelector
                        selectedSlotId={form.slotId}
                        onChange={(slotId) => update("slotId", slotId)}
                        availability={slotAvailability}
                        hiddenSlotIds={hiddenSlotIds}
                      />
                    </div>
                  </div>
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
                      {form.address}, {form.city} {form.pincode}
                    </p>
                    <p className="mt-2 text-ink-soft">
                      {form.date} ·{" "}
                      {
                        deliverySlots.find((slot) => slot.id === form.slotId)
                          ?.label
                      }
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
                      <Badge tone="sage">Preview</Badge>
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
                    <div className="mt-3 flex justify-between text-lg font-bold">
                      <span>Total today</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
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
                <Button size="lg" variant="gold" onClick={placeOrder}>
                  Place Order <Check size={17} />
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
              <p className="text-xs leading-5 text-ink-soft">{DELIVERY_NOTE}</p>
              <div className="flex justify-between border-t border-ink/10 pt-3 font-bold">
                <span>Payable now</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-ink-soft">
              <ShieldCheck size={15} className="text-sage-ink" /> Secure preview
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
        <div
          key={item.productId}
          className="flex justify-between gap-4 py-3 text-sm"
        >
          <span>
            {item.name} <span className="text-ink-soft">× {item.quantity}</span>
          </span>
          <span className="font-semibold">
            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}
