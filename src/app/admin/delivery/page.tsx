import type { Metadata } from "next";
import { DeliveryManager } from "@/components/admin/DeliveryManager";

export const metadata: Metadata = {
  title: "Delivery",
  robots: { index: false, follow: false },
};

export default function AdminDeliveryPage() {
  return <DeliveryManager />;
}