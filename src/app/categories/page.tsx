import type { Metadata } from "next";
import { CategoryDirectory } from "@/components/sections/DirectoryGrid";
import { categories, flowers } from "@/lib/data";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Flower varieties | FreshFlower.zone",
  description:
    "Shop fresh flowers by type — roses, lilies, gerberas, orchids, tulips and more for delivery across Delhi NCR.",
  alternates: { canonical: canonical("/categories") },
};

export default function CategoriesPage() {
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.id,
      flowers.filter((flower) => flower.categoryId === category.id).length,
    ]),
  );
  return <CategoryDirectory categories={categories} counts={counts} />;
}
