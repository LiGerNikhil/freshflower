import type { FlowerStockStatus } from "@/lib/types";
import { FLOWER_STATUS_LABELS } from "@/components/providers/CatalogContext";

const STATUS_TONES: Record<FlowerStockStatus, string> = {
  "in-stock": "bg-sage text-sage-ink",
  limited: "bg-gold/15 text-gold",
  "sold-out": "bg-ink/10 text-ink-soft",
  "pre-order": "bg-lavender text-lavender-ink",
};

export function StatusBadge({ status }: { status: FlowerStockStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONES[status]}`}
    >
      {FLOWER_STATUS_LABELS[status]}
    </span>
  );
}