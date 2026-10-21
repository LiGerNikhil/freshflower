"use client";

import Link from "next/link";
import { CreditCard, QrCode } from "lucide-react";

const TABS = [
  { href: "/admin/payments", label: "Razorpay payments", icon: CreditCard },
  { href: "/admin/payments/upi", label: "UPI accounts", icon: QrCode },
];

export function PaymentsTabs({ active }: { active: "razorpay" | "upi" }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
      {TABS.map((tab) => {
        const isActive = (active === "razorpay" && tab.href === "/admin/payments") || (active === "upi" && tab.href === "/admin/payments/upi");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-ink text-ivory"
                : "border border-ink/10 bg-white/70 text-ink hover:border-gold"
            }`}
          >
            <Icon size={15} /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
