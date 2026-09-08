"use client";

import { Clock3 } from "lucide-react";
import { deliverySlots } from "@/lib/data";

interface DeliverySlotSelectorProps {
  selectedSlotId: string;
  onChange: (slotId: string) => void;
  availability?: Record<string, boolean>;
  hiddenSlotIds?: string[];
}

export function DeliverySlotSelector({
  selectedSlotId,
  onChange,
  availability,
  hiddenSlotIds,
}: DeliverySlotSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {deliverySlots
        .filter((slot) => !hiddenSlotIds?.includes(slot.id))
        .map((slot) =>
        (() => {
          const isAvailable = availability?.[slot.id] ?? true;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onChange(slot.id)}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${selectedSlotId === slot.id ? "border-ink bg-ink text-ivory" : "border-ink/10 bg-white/60 text-ink hover:border-ink/30"}`}
            >
              <Clock3
                size={16}
                className={
                  selectedSlotId === slot.id ? "text-gold-soft" : "text-gold"
                }
              />
              <span>
                <span className="block font-semibold">{slot.label}</span>
                {slot.isMorningExpress && (
                  <span
                    className={`text-xs ${selectedSlotId === slot.id ? "text-ivory/60" : "text-ink-soft"}`}
                  >
                    Morning express
                  </span>
                )}
                <span
                  className={`text-xs ${selectedSlotId === slot.id ? "text-ivory/60" : "text-ink-soft"}`}
                >
                  {isAvailable ? "Available" : "Full"}
                </span>
              </span>
            </button>
          );
        })(),
      )}
    </div>
  );
}
