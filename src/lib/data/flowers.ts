import type { ColorVariant, Flower } from "@/lib/types";

interface SeedProduct {
  name: string;
  price: number;
  quantity: number | null;
  unit?: string | null;
  quantityLabel?: string;
  categoryId: string;
  variants?: { color: string; price: number; image?: string; compareAtPrice?: number }[];
}

const products: SeedProduct[] = [
  {
    name: "Gerbera",
    price: 149,
    quantity: 10,
    unit: "pcs",
    categoryId: "cat-gerbera",
    variants: [
      { color: "Yellow", price: 149, image: "gradient-gold", compareAtPrice: 199 },
      { color: "Pink", price: 159, image: "gradient-blush" },
      { color: "White", price: 169, image: "gradient-ivory" },
      { color: "Red", price: 179, image: "gradient-blush", compareAtPrice: 229 },
    ],
  },
  { name: "Mogra", price: 149, quantity: 200, unit: "gm", categoryId: "cat-mogra" },
  {
    name: "Bangalore Rose",
    price: 349,
    quantity: 20,
    unit: "pcs",
    categoryId: "cat-roses",
    variants: [
      { color: "Red", price: 349, image: "gradient-blush", compareAtPrice: 449 },
      { color: "Pink", price: 369, image: "gradient-blush" },
      { color: "Yellow", price: 359, image: "gradient-gold" },
      { color: "White", price: 379, image: "gradient-ivory" },
      { color: "Orange", price: 389, image: "gradient-gold", compareAtPrice: 499 },
    ],
  },
  { name: "Rajnigandha", price: 449, quantity: 24, unit: "sticks", categoryId: "cat-rajnigandha" },
  { name: "Sunflower", price: 249, quantity: 5, unit: "pcs", categoryId: "cat-sunflower" },
  {
    name: "Daisy",
    price: 449,
    quantity: null,
    unit: "Bundle",
    categoryId: "cat-gerbera",
    variants: [
      { color: "White", price: 449, image: "gradient-ivory", compareAtPrice: 549 },
      { color: "Pink", price: 469, image: "gradient-blush" },
      { color: "Purple", price: 479, image: "gradient-lavender" },
    ],
  },
  { name: "Baby's Breath", price: 399, quantity: null, unit: "Bundle", categoryId: "cat-babys-breath" },
  {
    name: "Carnations",
    price: 299,
    quantity: 20,
    unit: "pcs",
    categoryId: "cat-carnations",
    variants: [
      { color: "Pink", price: 299, image: "gradient-blush", compareAtPrice: 399 },
      { color: "Red", price: 309, image: "gradient-blush" },
      { color: "White", price: 319, image: "gradient-ivory" },
      { color: "Yellow", price: 329, image: "gradient-gold" },
    ],
  },
  {
    name: "Orchid",
    price: 349,
    quantity: 10,
    unit: "sticks",
    categoryId: "cat-orchid",
    variants: [
      { color: "Purple", price: 349, image: "gradient-lavender", compareAtPrice: 449 },
      { color: "White", price: 369, image: "gradient-ivory" },
      { color: "Pink", price: 389, image: "gradient-blush" },
    ],
  },
  {
    name: "Asiatic Lily",
    price: 1399,
    quantityLabel: "10/30+",
    categoryId: "cat-lily",
    variants: [
      { color: "Pink", price: 1399, image: "gradient-blush", compareAtPrice: 1599 },
      { color: "White", price: 1449, image: "gradient-ivory" },
      { color: "Yellow", price: 1499, image: "gradient-gold" },
    ],
  },
  {
    name: "Oriental Lily",
    price: 799,
    quantityLabel: "10/30+",
    categoryId: "cat-lily",
    variants: [
      { color: "Pink", price: 799, image: "gradient-blush", compareAtPrice: 999 },
      { color: "White", price: 849, image: "gradient-ivory" },
      { color: "Red", price: 899, image: "gradient-blush", compareAtPrice: 1099 },
    ],
  },
];

function slugifyProduct(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const flowers: Flower[] = products.map((product, index) => {
  const slug = slugifyProduct(product.name);
  const quantity = "quantity" in product ? product.quantity : null;
  const quantityLabel = "quantityLabel" in product ? product.quantityLabel : undefined;
  const unit = "unit" in product ? (product.unit ?? "") : quantityLabel ?? "";
  const variants: ColorVariant[] = (product.variants ?? []).map((variant) => ({
    color: variant.color,
    price: variant.price,
    image: variant.image,
    compareAtPrice: variant.compareAtPrice,
  }));
  return {
    id: `fl-${slug}`,
    name: product.name,
    slug,
    categoryId: product.categoryId,
    occasionIds: [],
    description: `${product.name} available for FreshFlower.zone delivery. Add product photography from the admin editor when ready.`,
    shortDescription: quantityLabel
      ? `${quantityLabel} ${product.name}`
      : quantity
        ? `${quantity} ${unit} ${product.name}`
        : `${unit} ${product.name}`,
    price: product.price,
    compareAtPrice: undefined,
    colorVariants: variants.length ? variants : undefined,
    stemCount: typeof quantity === "number" && unit === "pcs" ? quantity : undefined,
    colors: variants.length ? variants.map((variant) => variant.color) : ["mixed"],
    images: ["gradient-ivory"],
    videos: [],
    inStock: true,
    availableToday: true,
    featured: index < 4,
    rating: 0,
    reviewCount: 0,
    sku: `FF-${slug.toUpperCase().replace(/-/g, "").slice(0, 14)}`,
    quantity: quantity ?? undefined,
    unit,
    stock: 25,
    stockStatus: "in-stock",
    active: true,
    bestSeller: index < 4,
    newArrival: true,
    seoTitle: product.name,
    metaDescription: `${product.name} at ₹${product.price} from FreshFlower.zone.`,
    keywords: [product.name.toLowerCase()],
  };
});