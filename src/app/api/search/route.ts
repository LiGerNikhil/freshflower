import { NextRequest, NextResponse } from "next/server";
import { safe } from "@/lib/api/helpers";
import {
  getActiveCategories,
  getActiveFlowers,
  getBouquets,
  getLiveFestivalCollections,
  getOccasions,
} from "@/lib/db/repositories";
import {
  buildBouquetDocs,
  buildCategoryDocs,
  buildCollectionDocs,
  buildFlowerDocs,
  closestMatch,
  searchDocs,
} from "@/lib/search/engine";
import { buildPageDocs } from "@/lib/search/pages";
import type { SearchHit, SearchResponse } from "@/lib/search/types";

export const dynamic = "force-dynamic";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function groupByEntity(hits: SearchHit[]) {
  const groups = {
    flowers: [] as SearchHit[],
    bouquets: [] as SearchHit[],
    categories: [] as SearchHit[],
    collections: [] as SearchHit[],
    pages: [] as SearchHit[],
  };

  for (const hit of hits) {
    if (hit.entity === "flower") groups.flowers.push(hit);
    else if (hit.entity === "bouquet") groups.bouquets.push(hit);
    else if (hit.entity === "category") groups.categories.push(hit);
    else if (hit.entity === "collection") groups.collections.push(hit);
    else groups.pages.push(hit);
  }

  return groups;
}

export async function GET(request: NextRequest) {
  return safe(async () => {
    const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
    const query = rawQuery.trim().slice(0, 80);
    const limit = clamp(
      Number(request.nextUrl.searchParams.get("limit")) || 6,
      1,
      12,
    );

    if (query.length < 2) {
      const empty: SearchResponse = {
        query,
        total: 0,
        counts: {
          flowers: 0,
          bouquets: 0,
          categories: 0,
          collections: 0,
          pages: 0,
        },
        flowers: [],
        bouquets: [],
        categories: [],
        collections: [],
        pages: [],
      };
      return NextResponse.json(empty, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const [flowers, categories, occasions, bouquets, collections] =
      await Promise.all([
        getActiveFlowers(),
        getActiveCategories(),
        getOccasions(),
        getBouquets(),
        getLiveFestivalCollections(),
      ]);

    const docs = [
      ...buildFlowerDocs(flowers, categories, occasions),
      ...buildBouquetDocs(bouquets, flowers, occasions),
      ...buildCategoryDocs(categories),
      ...buildCollectionDocs(collections),
      ...buildPageDocs(),
    ];

    const hits = searchDocs(docs, query);
    const groups = groupByEntity(hits);
    const response: SearchResponse = {
      query,
      total: hits.length,
      counts: {
        flowers: groups.flowers.length,
        bouquets: groups.bouquets.length,
        categories: groups.categories.length,
        collections: groups.collections.length,
        pages: groups.pages.length,
      },
      flowers: groups.flowers.slice(0, limit),
      bouquets: groups.bouquets.slice(0, limit),
      categories: groups.categories.slice(0, Math.min(limit, 4)),
      collections: groups.collections.slice(0, Math.min(limit, 3)),
      pages: groups.pages.slice(0, Math.min(limit, 3)),
      didYouMean:
        hits.length === 0 ? closestMatch(docs, query) : undefined,
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  });
}
