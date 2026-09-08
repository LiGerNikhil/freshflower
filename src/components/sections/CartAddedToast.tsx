"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CartItem } from "@/lib/types";

export function CartAddedToast({
  notification,
}: {
  notification: { item: CartItem; token: number } | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) return;
    // Show the auto-dismissing toast whenever an item is added.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <AnimatePresence>
      {notification && visible && (
        <motion.div
          key={notification.token}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-lg bg-ink px-4 py-3.5 text-ivory shadow-xl">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-soft text-ink">
              <Check size={14} strokeWidth={3} />
            </span>
            <p className="min-w-0 text-sm leading-snug">
              <span className="font-semibold">{notification.item.name}</span>
              <span className="text-ivory/75">
                {" "}
                ×{notification.item.quantity} added to cart
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}