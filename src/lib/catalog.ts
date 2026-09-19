export const MAX_PRICE = 10000;

export type SortValue = "popular" | "price-asc" | "price-desc" | "new";
export type Availability = "today" | "limited" | "preorder" | "soldout";
export type UnitValue = "stems-6" | "stems-10" | "stems-12" | "plant";

export interface CatalogState {
  query: string;
  categoryIds: string[];
  sort: SortValue;
  availability: Availability[];
  occasionIds: string[];
  minPrice: number;
  maxPrice: number;
  units: UnitValue[];
  page: number;
}

export function parseList(value: string | string[] | undefined) {
  const joined = Array.isArray(value) ? value.join(",") : value;
  return joined ? joined.split(",").filter(Boolean) : [];
}

export function baseCatalogState(
  overrides: Partial<CatalogState> = {},
): CatalogState {
  return {
    query: "",
    categoryIds: [],
    sort: "popular",
    availability: [],
    occasionIds: [],
    minPrice: 0,
    maxPrice: MAX_PRICE,
    units: [],
    page: 1,
    ...overrides,
  };
}

export function pickFlowersOrdered<T extends { id: string }>(items: T[], ids: string[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((item): item is T => Boolean(item));
}
