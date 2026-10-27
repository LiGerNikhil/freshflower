import type { FestivalCollection, Flower, HomepageConfig, HomepageSectionId } from "@/lib/types";

export const FESTIVAL_TIME_ZONE = "Asia/Kolkata";
export const FESTIVAL_BADGES = ["festival-special", "limited-stock", "best-seller"] as const;

/** Flat Porter delivery charge added to every Diwali advance booking. */
export const DIWALI_PORTER_DELIVERY_FEE = 299;
export const HOMEPAGE_SECTION_IDS = [
  "categories", "festival-specials", "pooja-essentials", "on-sale",
  "best-sellers", "new-arrivals", "offers", "fresh-today", "occasions",
  "colours", "wholesale", "reviews", "trust", "cart-cta",
] as const satisfies readonly HomepageSectionId[];

/** Legacy products remain published unless explicitly hidden/drafted. */
export function isPublishedFlower(flower: Pick<Flower, "active" | "publicationStatus">): boolean {
  return flower.active !== false && flower.publicationStatus !== "draft";
}

/** Missing/invalid schedules fail closed. No festival calendar is hardcoded. */
export function isFestivalCollectionLive(
  collection: Pick<FestivalCollection, "status" | "active" | "startsAt" | "endsAt">,
  now = new Date(),
): boolean {
  const start = Date.parse(collection.startsAt ?? "");
  const end = Date.parse(collection.endsAt ?? "");
  return collection.status === "published" && collection.active === true &&
    Number.isFinite(start) && Number.isFinite(end) && start < end &&
    start <= now.getTime() && now.getTime() < end;
}

/**
 * Resolve a collection's public products. Explicit product IDs keep their
 * editorial order; category selections fill the remaining slots in catalogue
 * order without duplicating a product.
 */
export function resolveCollectionFlowers(
  flowers: Flower[],
  collection: Pick<FestivalCollection, "productIds" | "categoryIds">,
): Flower[] {
  const byId = new Map(flowers.map((flower) => [flower.id, flower]));
  const seen = new Set<string>();
  const resolved: Flower[] = [];

  for (const id of collection.productIds ?? []) {
    const flower = byId.get(id);
    if (!flower || seen.has(flower.id)) continue;
    seen.add(flower.id);
    resolved.push(flower);
  }

  const categoryIds = new Set(collection.categoryIds ?? []);
  for (const flower of flowers) {
    if (seen.has(flower.id) || !categoryIds.has(flower.categoryId)) continue;
    seen.add(flower.id);
    resolved.push(flower);
  }

  return resolved;
}

/** A switch alone cannot replace the legacy homepage with an empty layout. */
export function hasFestivalHomepageConfig(config: HomepageConfig): boolean {
  const sections = config.sections ?? [];
  return config.festivalHeroEnabled === true && sections.length > 0 &&
    new Set(sections.map((section) => section.id)).size === sections.length &&
    sections.every((section) => HOMEPAGE_SECTION_IDS.includes(section.id) &&
      Number.isInteger(section.sortOrder) && section.sortOrder >= 0) &&
    sections.some((section) => section.enabled);
}
