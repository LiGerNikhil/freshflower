import type { Metadata } from "next";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

export default function AdminEnquiriesPage() {
  return <EnquiriesManager />;
}