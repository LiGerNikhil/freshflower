import {
  BadgeCheck,
  Check,
  Circle,
  CreditCard,
  Flower2,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/types";

interface OrderStatusStepperProps {
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export function OrderStatusStepper({
  status,
  paymentMethod,
  paymentStatus,
}: OrderStatusStepperProps) {
  if (status === OrderStatus.Cancelled) {
    return (
      <section
        aria-label="Order progress"
        className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-sm md:p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
          Your flower delivery
        </p>
        <h2 className="mt-1 font-display text-2xl">Order cancelled</h2>
        <p className="mt-2 text-sm text-ink-soft">
          This order will not move through delivery.
        </p>
      </section>
    );
  }

  const progress = [
    OrderStatus.Received,
    OrderStatus.Confirmed,
    OrderStatus.Preparing,
    OrderStatus.Ready,
    OrderStatus.OutForDelivery,
    OrderStatus.Delivered,
  ].indexOf(status);
  const requiresPayment = paymentMethod === "online" || paymentMethod === "upi";
  const paid = paymentStatus === "paid";
  const statusLabel = status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const stages = [
    {
      label: "Order placed",
      detail: "We have received your order.",
      Icon: ShoppingBag,
      state: "complete" as const,
    },
    ...(requiresPayment
      ? [
          {
            label: paid ? "Payment received" : "Payment pending",
            detail: paid
              ? "Your payment is confirmed."
              : "Complete payment to confirm your order.",
            Icon: CreditCard,
            state: paid ? ("complete" as const) : ("current" as const),
          },
        ]
      : []),
    {
      label: "Order confirmed",
      detail: "We are getting your flowers ready.",
      Icon: BadgeCheck,
      state:
        progress >= 1
          ? ("complete" as const)
          : progress === 0 && (!requiresPayment || paid)
            ? ("current" as const)
            : ("upcoming" as const),
    },
    {
      label: "Preparing flowers",
      detail: "Fresh flowers are being arranged.",
      Icon: Flower2,
      state:
        progress >= 2
          ? ("complete" as const)
          : progress === 1
            ? ("current" as const)
            : ("upcoming" as const),
    },
    {
      label: "Ready for delivery",
      detail: "Your order is packed with care.",
      Icon: Package,
      state:
        progress >= 3
          ? ("complete" as const)
          : progress === 2
            ? ("current" as const)
            : ("upcoming" as const),
    },
    {
      label: "Out for delivery",
      detail: "Your flowers are on their way.",
      Icon: Truck,
      state:
        progress >= 4
          ? ("complete" as const)
          : progress === 3
            ? ("current" as const)
            : ("upcoming" as const),
    },
    {
      label: "Delivered",
      detail: "Enjoy your fresh flowers.",
      Icon: Check,
      state:
        progress >= 5
          ? ("complete" as const)
          : progress === 4
            ? ("current" as const)
            : ("upcoming" as const),
    },
  ];

  return (
    <section
      aria-label="Order progress"
      className="rounded-2xl border border-ink/10 bg-white/75 p-5 shadow-sm md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sage-ink">
            Your flower delivery
          </p>
          <h2 className="mt-1 font-display text-2xl">Order progress</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-ink">
          <Circle size={8} fill="currentColor" />
          {statusLabel}
        </span>
      </div>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {stages.map(({ label, detail, Icon, state: stageState }, index) => (
          <li
            key={label}
            className="relative flex min-w-0 items-start gap-3 lg:flex-col lg:items-center lg:text-center"
          >
            {index < stages.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-9 right-[-1rem] top-[1.125rem] hidden h-px lg:block ${
                  stageState === "complete" ? "bg-gold/70" : "bg-ink/10"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                stageState === "complete"
                  ? "border-sage bg-sage text-sage-ink"
                  : stageState === "current"
                    ? "border-gold/60 bg-gold/15 text-ink shadow-[0_0_0_4px_rgba(201,162,75,0.08)]"
                    : "border-ink/10 bg-ivory text-ink-soft/60"
              }`}
            >
              {stageState === "complete" ? <Check size={16} /> : <Icon size={16} />}
            </span>
            <span className="min-w-0 pb-1 lg:pt-1">
              <span
                className={`block text-xs font-bold leading-5 ${
                  stageState === "upcoming" ? "text-ink-soft" : "text-ink"
                }`}
              >
                {label}
              </span>
              <span className="mt-0.5 block text-[10px] leading-4 text-ink-soft">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
