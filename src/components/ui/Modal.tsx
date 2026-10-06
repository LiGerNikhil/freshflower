"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** "sheet" docks the dialog to the bottom on phones (bottom sheet), centered on larger screens. */
  position?: "center" | "sheet";
}

export function Modal({
  open,
  onClose,
  children,
  className,
  position = "center",
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex",
            position === "sheet"
              ? "items-end p-0 sm:items-center sm:justify-center sm:p-4"
              : "items-center justify-center p-4",
          )}
        >
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "glass-deep relative w-full overflow-y-auto p-6",
              position === "sheet"
                ? "max-h-[92vh] rounded-t-2xl sm:max-h-[88vh] sm:rounded-lg"
                : "max-h-[88vh] max-w-lg rounded-lg",
              className,
            )}
            initial={
              position === "sheet"
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              position === "sheet"
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full bg-ivory/80 p-2 text-ink shadow-sm backdrop-blur-sm transition hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:right-4 sm:top-4"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
