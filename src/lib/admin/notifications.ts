import { customers } from "@/lib/data/customers";
import { OrderStatus, type Order } from "@/lib/types";

// ---------------------------------------------------------------------------
// Simulated notification feed.
//
// Real WhatsApp / SMS / email isn't wired in this preview phase. Instead, the
// admin Notifications feed is DERIVED from each order's lifecycle: for every
// stage an order has reached, we render the notification a customer would
// have received. The feed is read-only and recomputes as order statuses are
// changed from /admin/orders, so it stays a believable preview without any
// messaging provider.
// ---------------------------------------------------------------------------

export type NotificationChannel = "whatsapp" | "sms" | "email";

export interface NotificationEvent {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  channel: NotificationChannel;
  stage: string;
  subject: string;
  body: string;
  sentAt: string;
}

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

const STAGE_ORDER: { stage: OrderStatus; key: string; label: string }[] = [
  { stage: OrderStatus.Received, key: "received", label: "Order received" },
  { stage: OrderStatus.Confirmed, key: "confirmed", label: "Order confirmed" },
  { stage: OrderStatus.Preparing, key: "preparing", label: "Preparing your flowers" },
  { stage: OrderStatus.Ready, key: "ready", label: "Ready for delivery" },
  { stage: OrderStatus.OutForDelivery, key: "out_for_delivery", label: "Out for delivery" },
  { stage: OrderStatus.Delivered, key: "delivered", label: "Delivered" },
];

const stageIndex = (status: OrderStatus): number => {
  const found = STAGE_ORDER.findIndex((entry) => entry.stage === status);
  return found === -1 ? 0 : found;
};

const customerName = (order: Order): string =>
  customers.find((customer) => customer.id === order.customerId)?.name ?? "Customer";

const itemSummary = (order: Order): string => {
  const first = order.items[0];
  const rest = order.items.length - 1;
  return rest > 0
    ? `${first.name} + ${rest} more`
    : first?.name ?? "your order";
};

export function buildNotificationFeed(orders: Order[]): NotificationEvent[] {
  const events: NotificationEvent[] = [];

  for (const order of orders) {
    const name = customerName(order);
    const summary = itemSummary(order);
    const base = new Date(order.createdAt).getTime();

    if (order.status === "cancelled") {
      events.push({
        id: `${order.id}-cancelled`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: name,
        channel: "whatsapp",
        stage: "Cancelled",
        subject: `Your order ${order.orderNumber} was cancelled`,
        body: `Hi ${name}, your FreshFlower order ${summary} was cancelled. No charge was made. Reach us anytime for a fresh one.`,
        sentAt: new Date(base + 3 * 60_000).toISOString(),
      });
      continue;
    }

    const reached = STAGE_ORDER.slice(0, stageIndex(order.status) + 1);

    reached.forEach((entry, index) => {
      const channel: NotificationChannel =
        entry.key === "out_for_delivery"
          ? "whatsapp"
          : entry.key === "delivered"
            ? "whatsapp"
            : index === 0
              ? "sms"
              : "email";

      const subject = `${entry.label} — ${order.orderNumber}`;
      const body =
        entry.key === "received"
          ? `Hi ${name}, we've got your order (${order.orderNumber}) for ${summary}. We'll confirm the moment it's in our pickup queue.`
          : entry.key === "confirmed"
            ? `Hi ${name}, order ${order.orderNumber} confirmed — ${summary} goes out for the slot you chose. Fresh stems picked at dawn.`
            : entry.key === "preparing"
              ? `Hi ${name}, your ${summary} is being prepared by our florist right now.`
              : entry.key === "ready"
                ? `Hi ${name}, ${summary} is ready and waiting for the delivery window. We'll ping you when the rider sets out.`
                : entry.key === "out_for_delivery"
                  ? `Hi ${name}, your rider is on the way with ${summary}. Please keep your phone handy — porter will call on arrival.`
                  : `Hi ${name}, your ${summary} has been delivered. Enjoy! Tell us how it went.`;

      events.push({
        id: `${order.id}-${entry.key}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: name,
        channel,
        stage: entry.label,
        subject,
        body,
        sentAt: new Date(base + (index + 1) * 12 * 60_000).toISOString(),
      });
    });
  }

  return events.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}

/** CHANNEL icon hint-classes helper for UI filtering. */
export function notificationsForChannel(
  events: NotificationEvent[],
  channel: NotificationChannel | "all",
): NotificationEvent[] {
  return channel === "all" ? events : events.filter((event) => event.channel === channel);
}