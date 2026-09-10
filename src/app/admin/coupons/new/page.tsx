import type { Metadata } from "next";
import { CouponForm } from "@/components/admin/CouponsManager";

export const metadata: Metadata = {
  title: "New coupon",
  robots: { index: false, follow: false },
};

export default function AdminNewCouponPage() {
  return <CouponForm />;
}