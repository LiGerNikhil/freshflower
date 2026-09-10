import type { Metadata } from "next";
import { CouponForm } from "@/components/admin/CouponsManager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return { title: "Edit coupon", robots: { index: false, follow: false } };
}

export default async function AdminEditCouponPage({
  params,
}: PageProps) {
  return <CouponForm />;
}