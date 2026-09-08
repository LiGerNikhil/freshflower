import type { Metadata } from "next";
import CartPageClient from "@/components/sections/CartPageClient";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your cart | FreshFlower.zone",
  description:
    "Review your flowers and prepare your Delhi NCR delivery booking.",
  robots: { index: false, follow: false },
  alternates: { canonical: canonical("/cart") },
};
export default function CartPage() {
  return <CartPageClient />;
}
