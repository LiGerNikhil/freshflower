import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}