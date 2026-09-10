import type { Metadata } from "next";
import { CustomerDetail } from "@/components/admin/CustomerDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return { title: "Customer details", robots: { index: false, follow: false } };
}

export default async function AdminCustomerDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  return <CustomerDetail customerId={id} />;
}