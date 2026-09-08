import type { Metadata } from "next";
import { InventoryManager } from "@/components/admin/InventoryManager";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false, follow: false },
};

export default function AdminInventoryPage() {
  return <InventoryManager />;
}