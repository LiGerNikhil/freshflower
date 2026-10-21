import type { Metadata } from "next";
import { PaymentsTabs } from "@/components/admin/PaymentsTabs";
import { PaymentAccountsManager } from "@/components/admin/PaymentAccountsManager";

export const metadata: Metadata = {
  title: "UPI accounts",
  robots: { index: false, follow: false },
};

export default function AdminUpiAccountsPage() {
  return (
    <div>
      <PaymentsTabs active="upi" />
      <PaymentAccountsManager />
    </div>
  );
}
