import type { Metadata } from "next";
import FlowersCatalogue from "@/components/sections/FlowersCatalogue";
import { MAX_PRICE, parseList, type CatalogState } from "@/lib/catalog";
import { getActiveFlowers } from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All flowers | FreshFlower.zone",
  description:
    "Browse fresh roses, lilies, gerberas, tulips and more for delivery in Delhi NCR. Filter by occasion, price, and availability for same-day or morning delivery.",
  alternates: { canonical: canonical("/flowers") },
  openGraph: {
    title: "All flowers | FreshFlower.zone",
    description:
      "Browse fresh roses, lilies, gerberas, tulips and more for delivery in Delhi NCR.",
    url: canonical("/flowers"),
    type: "website",
  },
};

interface FlowersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const sortValues = ["popular", "price-asc", "price-desc", "new"] as const;

export default async function FlowersPage({ searchParams }: FlowersPageProps) {
  const params = await searchParams;
  const requestedSort = first(params.sort);
  const sort = sortValues.includes(requestedSort as (typeof sortValues)[number])
    ? (requestedSort as CatalogState["sort"])
    : "popular";
  const minPrice = Math.max(0, Number(first(params.min)) || 0);
  const maxPrice = Math.min(MAX_PRICE, Number(first(params.max)) || MAX_PRICE);
  const page = Math.max(1, Number(first(params.page)) || 1);

  const initialState: CatalogState = {
    query: first(params.q) ?? "",
    categoryIds: parseList(params.category),
    sort,
    availability: parseList(
      params.availability,
    ) as CatalogState["availability"],
    occasionIds: parseList(params.occasion),
    minPrice: Math.min(minPrice, maxPrice - 50),
    maxPrice: Math.max(maxPrice, minPrice + 50),
    units: parseList(params.unit) as CatalogState["units"],
    page,
  };

  const flowers = await getActiveFlowers();

  return <FlowersCatalogue flowers={flowers} initialState={initialState} />;
}
