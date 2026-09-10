import type { Metadata } from "next";
import { Analytics } from "@/components/admin/Analytics";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return <Analytics />;
}