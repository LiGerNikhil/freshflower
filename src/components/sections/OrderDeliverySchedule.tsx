import { CalendarDays, Clock3, MapPin, Truck } from "lucide-react";
import { formatAppDate } from "@/lib/utils";

interface OrderDeliveryScheduleProps {
  deliveryDate: string;
  slotLabel?: string;
  areaName?: string;
}

export function OrderDeliverySchedule({
  deliveryDate,
  slotLabel,
  areaName,
}: OrderDeliveryScheduleProps) {
  return (
    <section
      aria-label="Scheduled delivery"
      className="relative overflow-hidden rounded-2xl border border-sage-ink/15 bg-gradient-to-br from-sage/75 via-white/90 to-ivory-deep/80 p-5 shadow-sm md:p-6"
    >
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl"
      />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/80 text-sage-ink shadow-sm">
          <CalendarDays size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sage-ink">
            Your selected delivery date
          </p>
          <p className="mt-1 font-display text-2xl leading-tight text-ink">
            {formatAppDate(
              deliveryDate,
              { weekday: "long", day: "numeric", month: "long", year: "numeric" },
              "Delivery date pending",
            )}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            We&apos;ll prepare your flowers for delivery on this date.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink-soft">
            {slotLabel && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} className="text-gold" />
                {slotLabel}
              </span>
            )}
            {areaName && (
              <span className="inline-flex items-center gap-1.5">
                {slotLabel ? (
                  <MapPin size={14} className="text-gold" />
                ) : (
                  <Truck size={14} className="text-gold" />
                )}
                {areaName}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
