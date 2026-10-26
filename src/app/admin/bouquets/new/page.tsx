import type { Metadata } from "next";
import { BouquetForm } from "@/components/admin/BouquetForm";

export const metadata: Metadata = {
  title: "New bouquet",
  robots: { index: false, follow: false },
};

export default function AdminNewBouquetPage() {
  return <BouquetForm />;
}
