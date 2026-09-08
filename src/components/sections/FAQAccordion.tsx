"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/lib/data/faqs";

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="border-b border-ink/10 py-5">
          <button
            type="button"
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className="flex w-full items-center justify-between gap-4 text-left font-display text-xl text-ink"
          >
            {item.question}
            <ChevronDown
              size={18}
              className={`shrink-0 transition-transform ${open === item.id ? "rotate-180" : ""}`}
            />
          </button>
          {open === item.id && (
            <p className="pt-3 text-sm leading-7 text-ink-soft">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
