import type { Metadata } from "next";
import { CategoryDirectory } from "@/components/sections/DirectoryGrid";
import { getCategories, getFlowers } from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Flower varieties | FreshFlower.zone",
  description:
    "Shop fresh flowers by type — roses, lilies, gerberas, orchids, tulips and more for delivery across Delhi NCR.",
  alternates: { canonical: canonical("/categories") },
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const flowers = await getFlowers();
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.id,
      flowers.filter((flower) => flower.categoryId === category.id).length,
    ]),
  );
  return <CategoryDirectory categories={categories} counts={counts} />;
}
