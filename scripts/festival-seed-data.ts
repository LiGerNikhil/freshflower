/** Client-approved rates. Never used to replace an existing catalogue record. */
export const festivalCategories = [
  { slug: "garlands-malas", name: "Garlands & Strings", aliases: ["garlands", "garlands-and-malas", "garlands-and-strings", "mala", "malas"] },
  { slug: "loose-flowers-petals", name: "Loose Flowers & Petals", aliases: ["loose-flowers", "loose-flowers-and-petals"] },
  { slug: "exotic-cut-flowers", name: "Exotic & Cut Flowers", aliases: ["exotic-flowers", "cut-flowers"] },
] as const;

interface FestivalSeedProduct {
  name: string;
  slug: string;
  aliases: string[];
  price: number;
  quantity: number;
  unit: string;
  unitLabel: string;
  categorySlugs: string[];
  pooja: boolean;
}

export const festivalProducts: FestivalSeedProduct[] = [
  { name: "Orange Marigold Strings", slug: "orange-marigold-strings", aliases: [], price: 899, quantity: 20, unit: "Mala", unitLabel: "20 Mala", categorySlugs: ["garlands-malas"], pooja: true },
  { name: "Yellow Marigold Strings", slug: "yellow-marigold-strings", aliases: [], price: 999, quantity: 20, unit: "Mala", unitLabel: "20 Mala", categorySlugs: ["garlands-malas"], pooja: true },
  { name: "Ashok Green Strings", slug: "ashok-green-strings", aliases: [], price: 399, quantity: 24, unit: "Pcs", unitLabel: "24 Pcs", categorySlugs: ["garlands-malas"], pooja: true },
  { name: "Rajnigandha Strings (5.5 Feet)", slug: "rajnigandha-strings-5-5-feet", aliases: ["rajnigandha-strings"], price: 1199, quantity: 50, unit: "Pcs", unitLabel: "50 Pcs · 5.5 Feet each", categorySlugs: ["garlands-malas"], pooja: true },
  { name: "Mogra Mala", slug: "mogra-mala", aliases: [], price: 1799, quantity: 5, unit: "Mala", unitLabel: "5 Mala", categorySlugs: ["garlands-malas"], pooja: true },
  { name: "Kanner Mala", slug: "kanner-mala", aliases: ["kaner-mala"], price: 1299, quantity: 5, unit: "Mala", unitLabel: "5 Mala", categorySlugs: ["garlands-malas"], pooja: true },
  { name: "Orange Marigold Loose", slug: "orange-marigold-loose", aliases: [], price: 249, quantity: 1, unit: "kg", unitLabel: "per kg", categorySlugs: ["loose-flowers-petals"], pooja: true },
  { name: "Yellow Marigold Loose", slug: "yellow-marigold-loose", aliases: [], price: 299, quantity: 1, unit: "kg", unitLabel: "per kg", categorySlugs: ["loose-flowers-petals"], pooja: true },
  { name: "Fresh Rose Loose", slug: "fresh-rose-loose", aliases: ["rose-loose", "loose-rose"], price: 449, quantity: 1, unit: "kg", unitLabel: "per kg", categorySlugs: ["loose-flowers-petals"], pooja: true },
  { name: "White Chrysanthemum", slug: "white-chrysanthemum", aliases: [], price: 499, quantity: 1, unit: "kg", unitLabel: "per kg", categorySlugs: ["loose-flowers-petals"], pooja: true },
  { name: "Fresh Mogra Loose", slug: "fresh-mogra-loose-100-gm", aliases: ["fresh-mogra-loose", "mogra-loose-100-gm", "mogra"], price: 299, quantity: 100, unit: "gm", unitLabel: "100 gm packet", categorySlugs: ["loose-flowers-petals"], pooja: true },
  { name: "Pink Lotus", slug: "pink-lotus", aliases: [], price: 59, quantity: 1, unit: "pc", unitLabel: "1 pc", categorySlugs: ["exotic-cut-flowers"], pooja: true },
  { name: "Blue Lotus", slug: "blue-lotus", aliases: [], price: 99, quantity: 1, unit: "pc", unitLabel: "1 pc", categorySlugs: ["exotic-cut-flowers"], pooja: true },
  { name: "Rajnigandha", slug: "rajnigandha", aliases: [], price: 649, quantity: 24, unit: "pcs", unitLabel: "24 pcs", categorySlugs: ["rajnigandha", "exotic-cut-flowers"], pooja: false },
  { name: "Bangalore Rose", slug: "bangalore-rose", aliases: [], price: 449, quantity: 20, unit: "pcs", unitLabel: "20 pcs", categorySlugs: ["roses", "exotic-cut-flowers"], pooja: false },
  { name: "Gerbera", slug: "gerbera", aliases: [], price: 249, quantity: 10, unit: "pcs", unitLabel: "10 pcs", categorySlugs: ["gerbera", "exotic-cut-flowers"], pooja: false },
  { name: "Sunflower", slug: "sunflower", aliases: [], price: 349, quantity: 5, unit: "pcs", unitLabel: "5 pcs", categorySlugs: ["sunflower", "exotic-cut-flowers"], pooja: false },
  { name: "Daisy Bundle", slug: "daisy", aliases: ["daisy-bundle"], price: 499, quantity: 1, unit: "Bundle", unitLabel: "1 bundle", categorySlugs: ["daisy", "gerbera", "exotic-cut-flowers"], pooja: false },
  { name: "Baby's Breath Bundle", slug: "baby-s-breath", aliases: ["babys-breath", "babys-breath-bundle", "baby-s-breath-bundle"], price: 349, quantity: 1, unit: "Bundle", unitLabel: "1 bundle", categorySlugs: ["babys-breath", "exotic-cut-flowers"], pooja: false },
  { name: "Carnations", slug: "carnations", aliases: ["carnation"], price: 399, quantity: 20, unit: "pcs", unitLabel: "20 pcs", categorySlugs: ["carnations", "exotic-cut-flowers"], pooja: false },
  { name: "Orchids", slug: "orchid", aliases: ["orchids"], price: 449, quantity: 10, unit: "sticks", unitLabel: "10 sticks", categorySlugs: ["orchid", "orchids", "exotic-cut-flowers"], pooja: false },
  { name: "Asiatic Lilies", slug: "asiatic-lily", aliases: ["asiatic-lilies"], price: 1299, quantity: 10, unit: "sticks", unitLabel: "10 sticks / 30+ buds", categorySlugs: ["lily", "lilies", "exotic-cut-flowers"], pooja: false },
  { name: "Oriental Lilies", slug: "oriental-lily", aliases: ["oriental-lilies"], price: 1999, quantity: 10, unit: "sticks", unitLabel: "10 sticks / 30+ buds", categorySlugs: ["lily", "lilies", "exotic-cut-flowers"], pooja: false },
  { name: "Lisianthus", slug: "lisianthus", aliases: [], price: 899, quantity: 10, unit: "sticks", unitLabel: "10 sticks", categorySlugs: ["lisianthus", "exotic-cut-flowers"], pooja: false },
  { name: "Hydrangea", slug: "hydrangea", aliases: [], price: 799, quantity: 1, unit: "pc", unitLabel: "1 pc", categorySlugs: ["hydrangea", "exotic-cut-flowers"], pooja: false },
  { name: "Gladiolus", slug: "gladiolus", aliases: [], price: 499, quantity: 1, unit: "Bundle", unitLabel: "1 bundle", categorySlugs: ["gladiolus", "exotic-cut-flowers"], pooja: false },
];

export const festivalCollectionSeeds = [
  { title: "Diwali Pooja Special", slug: "diwali-pooja-special", poojaCollection: true },
  { title: "Dussehra", slug: "dussehra", poojaCollection: true },
  { title: "Karwa Chauth", slug: "karwa-chauth", poojaCollection: true },
  { title: "Dhanteras", slug: "dhanteras", poojaCollection: true },
  { title: "Govardhan Puja", slug: "govardhan-puja", poojaCollection: true },
  { title: "Bhai Dooj", slug: "bhai-dooj", poojaCollection: false },
];

/** The three permanent shop-by-collection groups requested for the storefront. */
export const catalogCollectionSeeds = [
  {
    title: "Garlands & Strings Mala",
    slug: "garlands-strings-mala",
    subtitle: "Hand-strung marigold, mogra and seasonal malas for pooja, welcome and celebration.",
    badgeText: "Hand-strung fresh",
    categorySlug: "garlands-malas",
    bannerSourceSlug: "mogra-mala",
    productSlugs: [
      "orange-marigold-strings", "yellow-marigold-strings", "ashok-green-strings",
      "rajnigandha-strings-5-5-feet", "mogra-mala", "kanner-mala",
    ],
    poojaCollection: true,
    whatsappBulkOrderEnabled: true,
    seoTitle: "Garlands & Strings Mala | FreshFlower.zone",
    metaDescription: "Order fresh marigold strings, mogra mala and pooja garlands in Delhi NCR with same-day delivery.",
    keywords: ["marigold strings", "mogra mala", "pooja garland", "flower mala delhi"],
  },
  {
    title: "Loose Flowers & Petals",
    slug: "loose-flowers-petals",
    subtitle: "Fresh marigold, rose, mogra and chrysanthemum by the kilo or packet for puja and decoration.",
    badgeText: "Sold by weight",
    categorySlug: "loose-flowers-petals",
    bannerSourceSlug: "fresh-rose-loose",
    productSlugs: [
      "orange-marigold-loose", "yellow-marigold-loose", "fresh-rose-loose",
      "white-chrysanthemum", "fresh-mogra-loose-100-gm",
    ],
    poojaCollection: true,
    whatsappBulkOrderEnabled: true,
    seoTitle: "Loose Flowers & Petals | FreshFlower.zone",
    metaDescription: "Buy fresh loose marigold, rose petals, mogra and chrysanthemum by weight in Delhi NCR.",
    keywords: ["loose flowers delhi", "marigold by kg", "rose petals", "fresh mogra 100 gm"],
  },
  {
    title: "Exotic & Cut Flowers",
    slug: "exotic-cut-flowers",
    subtitle: "Lotus, lilies, orchids, gerbera and premium cut stems selected for standout arrangements.",
    badgeText: "Premium stems",
    categorySlug: "exotic-cut-flowers",
    bannerSourceSlug: "orchid",
    productSlugs: [
      "pink-lotus", "blue-lotus", "rajnigandha", "bangalore-rose", "gerbera",
      "sunflower", "daisy", "baby-s-breath", "carnations", "orchid", "asiatic-lily",
      "oriental-lily", "lisianthus", "hydrangea", "gladiolus",
    ],
    poojaCollection: false,
    whatsappBulkOrderEnabled: true,
    seoTitle: "Exotic & Cut Flowers | FreshFlower.zone",
    metaDescription: "Shop exotic cut flowers, lotus, lilies, orchids, gerbera and premium stems with Delhi NCR delivery.",
    keywords: ["exotic flowers delhi", "cut flowers", "lotus delivery", "lilies orchids"],
  },
] as const;

/**
 * New catalogue products can safely reuse an existing, relevant Cloudinary
 * photograph. Products without a match keep a gradient placeholder until the
 * admin uploads their own photography.
 */
export const catalogImageSourceSlugs: Record<string, string> = {
  "rajnigandha-strings-5-5-feet": "rajnigandha",
  "mogra-mala": "mogra",
  "fresh-rose-loose": "bangalore-rose",
};
