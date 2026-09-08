import type { Metadata } from "next";
import CheckoutClient from "@/components/sections/CheckoutClient";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout | FreshFlower.zone",
  description: "Book your flower delivery across Delhi NCR.",
  robots: { index: false, follow: false },
  alternates: { canonical: canonical("/checkout") },
};
export default function CheckoutPage() {
  return <CheckoutClient />;
}
