import { Check, Circle } from "lucide-react";
import { OrderStatus } from "@/lib/types";

const steps: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.Received, label: "Received" },
  { status: OrderStatus.Confirmed, label: "Confirmed" },
  { status: OrderStatus.Preparing, label: "Preparing" },
  { status: OrderStatus.Ready, label: "Ready" },
  { status: OrderStatus.OutForDelivery, label: "Out for delivery" },
  { status: OrderStatus.Delivered, label: "Delivered" },
];
export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const current = steps.findIndex((step) => step.status === status);
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      {steps.map((step, index) => (
        <div
          key={step.status}
          className="flex items-center gap-2 sm:block sm:text-center"
        >
          <div
            className={`mx-0 flex h-9 w-9 items-center justify-center rounded-full sm:mx-auto ${index <= current ? "bg-sage text-sage-ink" : "bg-ink/10 text-ink-soft"}`}
          >
            {index < current ? (
              <Check size={16} />
            ) : index === current ? (
              <Circle size={13} fill="currentColor" />
            ) : (
              <span className="text-xs">{index + 1}</span>
            )}
          </div>
          <p
            className={`text-xs sm:mt-2 ${index <= current ? "font-semibold text-ink" : "text-ink-soft"}`}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}
