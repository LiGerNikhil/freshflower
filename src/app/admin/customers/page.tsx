import type { Metadata } from "next";
import { CustomersManager } from "@/components/admin/CustomersManager";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return <CustomersManager />;
}