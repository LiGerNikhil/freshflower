import type { Metadata } from "next";
import { BouquetForm } from "@/components/admin/BouquetForm";

export const metadata: Metadata = {
  title: "Edit bouquet",
  robots: { index: false, follow: false },
};

export default async function AdminEditBouquetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BouquetForm bouquetId={id} />;
}
