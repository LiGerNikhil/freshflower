import type { Metadata } from "next";
import { BouquetsManager } from "@/components/admin/BouquetsManager";

export const metadata: Metadata = {
  title: "Bouquets",
  robots: { index: false, follow: false },
};

export default function AdminBouquetsPage() {
  return <BouquetsManager />;
}
