import type { DeliverySlot } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
export const deliverySlots: DeliverySlot[] = [
  { id: "slot-5-6", label: "5:00 AM – 6:00 AM", startTime: "05:00", endTime: "06:00", isMorningExpress: true },
  { id: "slot-6-7", label: "6:00 AM – 7:00 AM", startTime: "06:00", endTime: "07:00", isMorningExpress: true },
  { id: "slot-7-8", label: "7:00 AM – 8:00 AM", startTime: "07:00", endTime: "08:00", isMorningExpress: true },
  { id: "slot-8-9", label: "8:00 AM – 9:00 AM", startTime: "08:00", endTime: "09:00", isMorningExpress: false },
  { id: "slot-9-10", label: "9:00 AM – 10:00 AM", startTime: "09:00", endTime: "10:00", isMorningExpress: false },
  { id: "slot-10-11", label: "10:00 AM – 11:00 AM", startTime: "10:00", endTime: "11:00", isMorningExpress: false },
  { id: "slot-11-12", label: "11:00 AM – 12:00 PM", startTime: "11:00", endTime: "12:00", isMorningExpress: false },
];
