import type { Metadata } from "next";
import { CouponsManager } from "@/components/admin/CouponsManager";
import { TieredDiscountManager } from "@/components/admin/TieredDiscountManager";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

export default function AdminCouponsPage() {
  return (
    <div>
      <TieredDiscountManager />
      <CouponsManager />
    </div>
  );
}
