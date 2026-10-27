import type { Metadata } from "next";
import { DiwaliCampaignManager } from "@/components/admin/DiwaliCampaignManager";

export const metadata: Metadata = { title: "Diwali Campaign", robots: { index: false, follow: false } };

export default function DiwaliAdminPage() {
  return <DiwaliCampaignManager />;
}
