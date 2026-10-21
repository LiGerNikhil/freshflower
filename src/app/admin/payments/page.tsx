import type { Metadata } from "next";
import { PaymentsTabs } from "@/components/admin/PaymentsTabs";
import { RazorpayPaymentsManager } from "@/components/admin/RazorpayPaymentsManager";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return (
    <div>
      <PaymentsTabs active="razorpay" />
      <RazorpayPaymentsManager />
    </div>
  );
}
