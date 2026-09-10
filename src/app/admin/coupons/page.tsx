import type { Metadata } from "next";
import { CouponsManager } from "@/components/admin/CouponsManager";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

export default function AdminCouponsPage() {
  return <CouponsManager />;
}