import { effectiveCompareAtPrice, lowestPrice } from "@/lib/pricing";
import type {
  Bouquet,
  Category,
  FestivalCollection,
  Flower,
  Occasion,
} from "@/lib/types";
import {
  editDistance,
  fieldWords,
  normalizeText,
  queryTokens,
  tokenAlternatives,
} from "@/lib/search/normalize";
import type { SearchDoc, SearchHit } from "@/lib/search/types";

const FIELD_WEIGHT = {
  name: 110,
  keyword: 58,
  category: 38,
  occasion: 28,
  color: 22,
  unit: 18,
  shortDescription: 15,
  description: 8,
  sku: 48,
  tag: 14,
} as const;

interface IndexedDoc {
  doc: SearchDoc;
  name: string;
  nameWords: string[];
  keywords: string;
  keywordWords: string[];
  category: string;
  categoryWords: string[];
  occasions: string;
  occasionWords: string[];
  colors: string;
  colorWords: string[];
  unit: string;
  unitWords: string[];
  shortDescription: string;
  shortDescriptionWords: string[];
  description: string;
  descriptionWords: string[];
  sku: string;
  skuWords: string[];
  tags: string;
  tagWords: string[];
}

const indexedCache = new WeakMap<SearchDoc, IndexedDoc>();

function indexDoc(doc: SearchDoc): IndexedDoc {
  const cached = indexedCache.get(doc);
  if (cached) return cached;

  const keywords = (doc.keywords ?? []).join(" ");
  const category = doc.categoryName ?? "";
  const occasions = (doc.occasionNames ?? []).join(" ");
  const colors = (doc.colors ?? []).join(" ");
  const unit = doc.unit ?? "";
  const tags = (doc.tags ?? []).join(" ");
  const shortDescription = doc.subtitle ?? "";
  const sku = doc.sku ?? "";

  const indexed: IndexedDoc = {
    doc,
    name: normalizeText(doc.title),
    nameWords: fieldWords(doc.title),
    keywords,
    keywordWords: fieldWords(keywords),
    category,
    categoryWords: fieldWords(category),
    occasions,
    occasionWords: fieldWords(occasions),
    colors,
    colorWords: fieldWords(colors),
    unit,
    unitWords: fieldWords(unit),
    shortDescription: normalizeText(shortDescription),
    shortDescriptionWords: fieldWords(shortDescription),
    description: normalizeText(doc.description),
    descriptionWords: fieldWords(doc.description),
    sku: normalizeText(sku),
    skuWords: fieldWords(sku),
    tags,
    tagWords: fieldWords(tags),
  };

  indexedCache.set(doc, indexed);
  return indexed;
}

export function buildFlowerDocs(
  flowers: Flower[],
  categories: Category[],
  occasions: Occasion[],
): SearchDoc[] {
  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
  const occasionNames = new Map(occasions.map((item) => [item.id, item.name]));

  return flowers.map((flower) => {
    const categoryName = categoryNames.get(flower.categoryId);
    const flowerOccasions = (flower.occasionIds ?? [])
      .map((id) => occasionNames.get(id))
      .filter((name): name is string => Boolean(name));

    return {
      id: flower.id,
      entity: "flower",
      title: flower.name,
      href: `/flowers/${flower.slug}`,
      subtitle: [categoryName, flower.unitLabel ?? flower.unit]
        .filter(Boolean)
        .join(" · "),
      description: [flower.shortDescription, flower.description]
        .filter(Boolean)
        .join(" "),
      keywords: [
        ...(flower.keywords ?? []),
        ...(flower.colors ?? []),
        flower.unitLabel ?? "",
        flower.unit ?? "",
        ...(flower.festivalTags ?? []),
        ...(flower.badges ?? []),
      ].filter(Boolean),
      categoryName,
      occasionNames: flowerOccasions,
      colors: flower.colors,
      unit: flower.unitLabel ?? flower.unit,
      sku: flower.sku,
      tags: flower.festivalTags,
      price: lowestPrice(flower),
      compareAtPrice: effectiveCompareAtPrice(flower),
      image: flower.images?.[0],
      stockStatus:
        flower.stockStatus ?? (flower.inStock ? "in-stock" : "sold-out"),
      availableToday: flower.availableToday,
      bestSeller: flower.bestSeller,
      featured: flower.featured,
      rating: flower.rating,
    };
  });
}

export function buildBouquetDocs(
  bouquets: Bouquet[],
  flowers: Flower[],
  occasions: Occasion[],
): SearchDoc[] {
  const flowersById = new Map(flowers.map((flower) => [flower.id, flower]));
  const occasionNames = new Map(occasions.map((item) => [item.id, item.name]));

  return bouquets.map((bouquet) => {
    const bouquetOccasions = (bouquet.occasionIds ?? [])
      .map((id) => occasionNames.get(id))
      .filter((name): name is string => Boolean(name));
    const includedFlowers = (bouquet.items ?? [])
      .map((item) => flowersById.get(item.flowerId)?.name)
      .filter((name): name is string => Boolean(name));

    return {
      id: bouquet.id,
      entity: "bouquet",
      title: bouquet.name,
      href: `/bouquets/${bouquet.slug}`,
      subtitle: "Hand-tied bouquet",
      description: bouquet.description,
      keywords: [
        ...bouquetOccasions,
        ...includedFlowers,
        ...(bouquet.colors ?? []),
        "bouquet",
        "bunch",
      ],
      occasionNames: bouquetOccasions,
      colors: bouquet.colors,
      price: bouquet.price,
      image: bouquet.images?.[0],
      stockStatus: "in-stock",
      availableToday: true,
      bestSeller: bouquet.featured,
      featured: bouquet.featured,
    };
  });
}

export function buildCategoryDocs(categories: Category[]): SearchDoc[] {
  return categories.map((category) => ({
    id: category.id,
    entity: "category",
    title: category.name,
    href: `/categories/${category.slug}`,
    subtitle: category.description,
    description: category.description,
    keywords: [
      ...(category.keywords ?? []),
      "category",
      "flower type",
      "flowers",
    ],
  }));
}

export function buildCollectionDocs(
  collections: FestivalCollection[],
): SearchDoc[] {
  return collections.map((collection) => ({
    id: collection.id,
    entity: "collection",
    title: collection.title,
    href: `/collections/${collection.slug}`,
    subtitle: collection.subtitle,
    description: [collection.subtitle, collection.description]
      .filter(Boolean)
      .join(" "),
    keywords: [
      ...(collection.keywords ?? []),
      collection.badgeText ?? "",
      collection.poojaCollection ? "pooja puja festival" : "",
      "collection",
    ].filter(Boolean),
    tags: collection.badgeText ? [collection.badgeText] : undefined,
  }));
}

function tokenScore(
  token: string,
  words: string[],
  fullText: string,
  weight: number,
): number {
  if (!words.length) return 0;

  let best = 0;
  if (words.includes(token)) {
    best = weight;
  } else {
    for (const word of words) {
      if (word.startsWith(token)) {
        best = Math.max(best, weight * 0.82);
      } else if (token.length >= 3 && word.includes(token)) {
        best = Math.max(best, weight * 0.58);
      } else if (token.length >= 4 && fullText.includes(token)) {
        best = Math.max(best, weight * 0.5);
      }
    }
  }
  return best;
}

function fuzzyTokenScore(
  token: string,
  words: string[],
  weight: number,
): number {
  if (token.length < 4) return 0;
  for (const word of words) {
    if (word.length < 4) continue;
    if (Math.abs(word.length - token.length) > 1) continue;
    if (editDistance(token, word, 1) <= 1) return weight * 0.4;
  }
  return 0;
}

function scoreToken(token: string, indexed: IndexedDoc): number {
  for (const alternative of tokenAlternatives(token)) {
    const direct = Math.max(
      tokenScore(
        alternative,
        indexed.nameWords,
        indexed.name,
        FIELD_WEIGHT.name,
      ),
      tokenScore(
        alternative,
        indexed.keywordWords,
        indexed.keywords,
        FIELD_WEIGHT.keyword,
      ),
      tokenScore(
        alternative,
        indexed.categoryWords,
        indexed.category,
        FIELD_WEIGHT.category,
      ),
      tokenScore(
        alternative,
        indexed.occasionWords,
        indexed.occasions,
        FIELD_WEIGHT.occasion,
      ),
      tokenScore(
        alternative,
        indexed.colorWords,
        indexed.colors,
        FIELD_WEIGHT.color,
      ),
      tokenScore(
        alternative,
        indexed.unitWords,
        indexed.unit,
        FIELD_WEIGHT.unit,
      ),
      tokenScore(
        alternative,
        indexed.shortDescriptionWords,
        indexed.shortDescription,
        FIELD_WEIGHT.shortDescription,
      ),
      tokenScore(
        alternative,
        indexed.descriptionWords,
        indexed.description,
        FIELD_WEIGHT.description,
      ),
      tokenScore(
        alternative,
        indexed.skuWords,
        indexed.sku,
        FIELD_WEIGHT.sku,
      ),
      tokenScore(
        alternative,
        indexed.tagWords,
        indexed.tags,
        FIELD_WEIGHT.tag,
      ),
    );

    if (direct > 0) return direct;

    const fuzzy = Math.max(
      fuzzyTokenScore(alternative, indexed.nameWords, FIELD_WEIGHT.name),
      fuzzyTokenScore(alternative, indexed.keywordWords, FIELD_WEIGHT.keyword),
      fuzzyTokenScore(alternative, indexed.categoryWords, FIELD_WEIGHT.category),
      fuzzyTokenScore(alternative, indexed.occasionWords, FIELD_WEIGHT.occasion),
    );
    if (fuzzy > 0) return fuzzy;
  }

  return 0;
}

function stockBoost(status: string | undefined): number {
  switch (status) {
    case "sold-out":
      return -14;
    case "limited":
      return 5;
    case "pre-order":
      return 1;
    default:
      return 8;
  }
}

function scoreDoc(doc: SearchDoc, query: string, tokens: string[]): number {
  const indexed = indexDoc(doc);
  let score = 0;
  let matched = 0;

  for (const token of tokens) {
    const tokenTotal = scoreToken(token, indexed);
    if (tokenTotal <= 0) continue;
    score += tokenTotal;
    matched += 1;
  }

  if (matched === 0) return 0;
  // Require at least half the meaningful words. This keeps a single stray
  // adjective ("red" before colour data exists) from blanking the result set,
  // while still ranking documents that match every word above partial ones.
  if (tokens.length > 1 && matched < Math.ceil(tokens.length / 2)) return 0;
  if (matched < tokens.length) score *= matched / tokens.length;

  const normalizedQuery = normalizeText(query);
  if (indexed.name === normalizedQuery) score += 90;
  else if (indexed.name.startsWith(normalizedQuery)) score += 48;
  else if (indexed.name.includes(normalizedQuery)) score += 22;

  if (indexed.keywords.includes(normalizedQuery)) score += 18;
  if (indexed.category === normalizedQuery) score += 16;

  score += stockBoost(doc.stockStatus);
  if (doc.availableToday) score += 4;
  if (doc.bestSeller) score += 3;
  if (doc.featured) score += 2;
  if (doc.rating) score += Math.min(doc.rating, 5) * 0.6;

  return score;
}

/** Rank all docs for a query. An empty/short query returns no matches. */
export function searchDocs(docs: SearchDoc[], query: string): SearchHit[] {
  const tokens = queryTokens(query);
  if (!tokens.length) return [];

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    const score = scoreDoc(doc, query, tokens);
    if (score > 0) hits.push({ ...doc, score });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (Number(Boolean(b.availableToday)) !== Number(Boolean(a.availableToday))) {
      return Number(Boolean(b.availableToday)) - Number(Boolean(a.availableToday));
    }
    if (Number(Boolean(b.bestSeller)) !== Number(Boolean(a.bestSeller))) {
      return Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller));
    }
    if ((b.rating ?? 0) !== (a.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    return a.title.localeCompare(b.title);
  });

  return hits;
}

/** Best close product/page title for a zero-result query. */
export function closestMatch(docs: SearchDoc[], query: string): string | undefined {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 4) return undefined;

  let best: { title: string; distance: number } | undefined;
  for (const doc of docs) {
    const title = normalizeText(doc.title);
    if (!title) continue;
    const candidates = [title, ...title.split(/\s+/).filter((word) => word.length >= 4)];
    let docDistance = Infinity;
    for (const candidate of candidates) {
      const distance = editDistance(normalizedQuery, candidate, 3);
      if (distance < docDistance) docDistance = distance;
    }
    if (docDistance > 3) continue;
    if (!best || docDistance < best.distance) {
      best = { title: doc.title, distance: docDistance };
    }
  }

  return best?.title;
}
