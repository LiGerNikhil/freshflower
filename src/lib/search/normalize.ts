/**
 * Search query/text normalisation.
 *
 * Shared by the server search API and the client catalogue so a query behaves
 * identically everywhere. Keep this module free of server-only imports.
 */

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "by",
  "delivery",
  "for",
  "from",
  "in",
  "is",
  "me",
  "near",
  "of",
  "on",
  "online",
  "or",
  "the",
  "to",
  "with",
]);

/**
 * Common Indian-florist terms mapped onto the English catalogue vocabulary.
 * Keys and values are normalised again at lookup time, so write them naturally.
 */
const SYNONYMS: Record<string, string[]> = {
  gulab: ["rose"],
  gulaab: ["rose"],
  genda: ["marigold"],
  gainda: ["marigold"],
  jasmine: ["mogra"],
  juhi: ["mogra"],
  tuberose: ["rajnigandha"],
  gajra: ["mala", "garland", "mogra"],
  gajara: ["mala", "garland", "mogra"],
  garland: ["mala", "string"],
  haar: ["mala", "garland"],
  mala: ["garland", "string"],
  puja: ["pooja", "temple", "mala"],
  pooja: ["puja", "temple", "mala"],
  kaner: ["kanner"],
  kanner: ["kaner"],
  gypsophila: ["babys breath"],
  "babys breath": ["gypsophila"],
  babysbreath: ["babys breath", "gypsophila"],
  chrysanthemum: ["chrysanthemum", "guldaudi"],
  guldaudi: ["chrysanthemum"],
  sevanti: ["chrysanthemum"],
  rajnigandha: ["tuberose"],
  mogra: ["jasmine"],
  rose: ["gulab"],
  roses: ["rose", "gulab"],
  marigold: ["genda"],
  sunflower: ["surajmukhi"],
  surajmukhi: ["sunflower"],
  lotus: ["kamal"],
  kamal: ["lotus"],
  orchid: ["orchids"],
  orchids: ["orchid"],
  lily: ["lilies"],
  lilies: ["lily"],
  carnation: ["carnations"],
  carnations: ["carnation"],
  gerbera: ["gerberas", "daisy"],
  daisy: ["gerbera"],
  bouquet: ["bunch", "arrangement"],
  bunch: ["bouquet"],
  string: ["mala", "garland"],
  loose: ["kg", "kilo", "weight"],
  kg: ["loose", "kilo"],
  red: ["scarlet"],
  white: ["ivory"],
  yellow: ["gold"],
  pink: ["blush"],
};

const WORD_SPLIT = /\s+/;
const DIACRITICS = /[\u0300-\u036f]/g;
const POSSESSIVE = /['’]s\b/gi;
const APOSTROPHES = /['’]/g;
const NON_ALNUM = /[^a-z0-9]+/g;

/** Lowercase, strip accents/punctuation and collapse whitespace. */
export function normalizeText(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .replace(POSSESSIVE, "")
    .replace(APOSTROPHES, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " and ")
    .replace(NON_ALNUM, " ")
    .trim()
    .replace(WORD_SPLIT, " ");
}

/**
 * Light English plural handling. Deliberately conservative: this is a florist
 * catalogue, not a linguistics engine.
 */
export function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (/(ches|shes|xes|zes|sses)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("ss") || word.endsWith("us") || word.endsWith("is")) {
    return word;
  }
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

/** Every normalised word, useful for indexing product text. */
export function fieldWords(input: string | undefined | null): string[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  return normalized.split(WORD_SPLIT).map(singularize).filter(Boolean);
}

/** Query tokens: stopwords removed and plurals folded. */
export function queryTokens(input: string | undefined | null): string[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  return normalized
    .split(WORD_SPLIT)
    .filter((word) => word && !STOPWORDS.has(word))
    .map(singularize)
    .filter(Boolean);
}

/**
 * Alternatives for one query token, including synonyms. Multi-word synonyms
 * are split into single-word alternatives; the original phrase still receives
 * a phrase bonus during scoring.
 */
export function tokenAlternatives(token: string): string[] {
  const alternatives = new Set<string>([token]);
  for (const synonym of SYNONYMS[token] ?? []) {
    for (const word of queryTokens(synonym)) alternatives.add(word);
  }
  return [...alternatives];
}

/** Simple Levenshtein distance with an early exit for obviously distant words. */
export function editDistance(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}
