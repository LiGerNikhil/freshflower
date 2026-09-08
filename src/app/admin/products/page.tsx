import type { Metadata } from "next";
import { ProductsManager } from "@/components/admin/ProductsManager";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <ProductsManager />;
}