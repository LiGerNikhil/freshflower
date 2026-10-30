import type { Metadata } from "next";
import FlowersCatalogue from "@/components/sections/FlowersCatalogue";
import { MAX_PRICE, parseList, type CatalogState } from "@/lib/catalog";
import {
  getActiveCategories,
  getActiveFlowers,
  getOccasions,
} from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface FlowersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const sortValues = [
  "relevance",
  "popular",
  "price-asc",
  "price-desc",
  "new",
] as const;

export async function generateMetadata({
  searchParams,
}: FlowersPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const title = query
    ? `Search results for “${query}”`
    : "All flowers";
  const description = query
    ? `Fresh flowers matching “${query}” with morning and same-day delivery across Delhi NCR.`
    : "Browse fresh roses, lilies, gerberas, tulips and more for delivery in Delhi NCR, with same-day and morning slots available.";

  return {
    title,
    description,
    alternates: { canonical: canonical("/flowers") },
    robots: query ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${title} | FreshFlower.zone`,
      description,
      url: canonical("/flowers"),
      type: "website",
    },
  };
}

export default async function FlowersPage({ searchParams }: FlowersPageProps) {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const requestedSort = first(params.sort);
  const parsedSort = sortValues.includes(
    requestedSort as (typeof sortValues)[number],
  )
    ? (requestedSort as CatalogState["sort"])
    : undefined;
  const sort =
    parsedSort && (parsedSort !== "relevance" || query)
      ? parsedSort
      : query
        ? "relevance"
        : "popular";
  const minPrice = Math.max(0, Number(first(params.min)) || 0);
  const maxPrice = Math.min(MAX_PRICE, Number(first(params.max)) || MAX_PRICE);
  const page = Math.max(1, Number(first(params.page)) || 1);

  const initialState: CatalogState = {
    query,
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

  const [flowers, categories, occasions] = await Promise.all([
    getActiveFlowers(),
    getActiveCategories(),
    getOccasions(),
  ]);

  return (
    <FlowersCatalogue
      key={JSON.stringify(initialState)}
      flowers={flowers}
      initialState={initialState}
      categories={categories}
      occasions={occasions}
    />
  );
}
