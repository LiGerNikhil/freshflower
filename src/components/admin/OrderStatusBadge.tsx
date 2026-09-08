import { OrderStatus, type PaymentStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/admin/analytics";

const ORDER_TONES: Record<OrderStatus, string> = {
  [OrderStatus.Received]: "bg-gold/10 text-gold",
  [OrderStatus.Confirmed]: "bg-blush text-ink",
  [OrderStatus.Preparing]: "bg-lavender text-lavender-ink",
  [OrderStatus.Ready]: "bg-sage text-sage-ink",
  [OrderStatus.OutForDelivery]: "bg-sage text-sage-ink",
  [OrderStatus.Delivered]: "bg-sage text-sage-ink",
  [OrderStatus.Cancelled]: "bg-ink/10 text-ink-soft",
};

const PAYMENT_TONES: Record<PaymentStatus, string> = {
  paid: "bg-sage/60 text-sage-ink",
  pending: "bg-gold/10 text-gold",
  refunded: "bg-lavender/60 text-lavender-ink",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${ORDER_TONES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus | undefined;
}) {
  if (!status) return <span className="text-xs text-ink-soft">—</span>;
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_TONES[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}