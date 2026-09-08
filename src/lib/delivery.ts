import { deliveryAreas, deliverySlots, orders } from "@/lib/data";
import { OrderStatus, type DeliveryArea, type Order } from "@/lib/types";
import { DEFAULT_MAX_ORDERS } from "@/lib/admin/overrides";

export interface AvailabilityOptions {
  maxOrdersBySlot?: Record<string, number>;
  enabledSlotIds?: string[];
  ordersList?: Order[];
}

export function slotUsageBySlot(
  date: string,
  orderList: Order[] = orders,
): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const order of orderList) {
    if (
      order.deliveryDate === date &&
      order.status !== OrderStatus.Cancelled
    ) {
      usage[order.deliverySlotId] = (usage[order.deliverySlotId] ?? 0) + 1;
    }
  }
  return usage;
}

export function getSlotAvailability(
  date: string,
  options: AvailabilityOptions = {},
): Record<string, boolean> {
  const orderList = options.ordersList ?? orders;
  const usage = slotUsageBySlot(date, orderList);
  return Object.fromEntries(
    deliverySlots.map((slot) => {
      const enabled = options.enabledSlotIds
        ? options.enabledSlotIds.includes(slot.id)
        : true;
      const capacity = options.maxOrdersBySlot?.[slot.id] ?? DEFAULT_MAX_ORDERS;
      return [slot.id, enabled && (usage[slot.id] ?? 0) < capacity];
    }),
  );
}

export function isServiceablePincode(
  pincode: string,
  activeAreas?: DeliveryArea[],
): boolean {
  const areas = activeAreas ?? deliveryAreas;
  return (
    /^\d{6}$/.test(pincode) &&
    areas.some((area) => area.active && area.pincode.includes(pincode))
  );
}