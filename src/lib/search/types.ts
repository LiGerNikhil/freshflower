/** Shared search contracts used by the API, the nav dialog and the catalogue. */

export type SearchEntity =
  | "flower"
  | "bouquet"
  | "category"
  | "collection"
  | "page";

export interface SearchDoc {
  id: string;
  entity: SearchEntity;
  title: string;
  href: string;
  subtitle?: string;
  description?: string;
  keywords?: string[];
  categoryName?: string;
  occasionNames?: string[];
  colors?: string[];
  unit?: string;
  sku?: string;
  tags?: string[];
  price?: number;
  compareAtPrice?: number;
  image?: string;
  stockStatus?: string;
  availableToday?: boolean;
  bestSeller?: boolean;
  featured?: boolean;
  rating?: number;
}

export interface SearchHit extends SearchDoc {
  score: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  counts: {
    flowers: number;
    bouquets: number;
    categories: number;
    collections: number;
    pages: number;
  };
  flowers: SearchHit[];
  bouquets: SearchHit[];
  categories: SearchHit[];
  collections: SearchHit[];
  pages: SearchHit[];
  didYouMean?: string;
}
