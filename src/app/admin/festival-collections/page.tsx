import type { Metadata } from "next";
import { FestivalCollectionsManager } from "@/components/admin/FestivalCollectionsManager";

export const metadata: Metadata = { title: "Collections", robots: { index: false, follow: false } };
export default function FestivalCollectionsPage() { return <FestivalCollectionsManager />; }
