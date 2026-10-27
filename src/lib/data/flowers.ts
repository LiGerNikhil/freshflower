import type { ColorVariant, Flower } from "@/lib/types";

interface SeedProduct {
  name: string;
  price: number;
  quantity: number | null;
  unit?: string | null;
  quantityLabel?: string;
  categoryId: string;
  catalogExpansion?: boolean;
  variants?: { color: string; price: number; image?: string; compareAtPrice?: number }[];
}

const products: SeedProduct[] = [
  {
    name: "Gerbera",
    price: 249,
    quantity: 10,
    unit: "pcs",
    categoryId: "cat-gerbera",
    catalogExpansion: true,
  },
  { name: "Mogra", price: 149, quantity: 200, unit: "gm", categoryId: "cat-mogra" },
  {
    name: "Bangalore Rose",
    price: 449,
    quantity: 20,
    unit: "pcs",
    categoryId: "cat-roses",
    catalogExpansion: true,
  },
  { name: "Rajnigandha", price: 649, quantity: 24, unit: "pcs", categoryId: "cat-rajnigandha", catalogExpansion: true },
  { name: "Sunflower", price: 349, quantity: 5, unit: "pcs", categoryId: "cat-sunflower", catalogExpansion: true },
  {
    name: "Daisy Bundle",
    price: 499,
    quantity: null,
    unit: "Bundle",
    categoryId: "cat-gerbera",
    catalogExpansion: true,
  },
  { name: "Baby's Breath", price: 349, quantity: null, unit: "Bundle", categoryId: "cat-babys-breath", catalogExpansion: true },
  {
    name: "Carnations",
    price: 399,
    quantity: 20,
    unit: "pcs",
    categoryId: "cat-carnations",
    catalogExpansion: true,
  },
  {
    name: "Orchids",
    price: 449,
    quantity: 10,
    unit: "sticks",
    categoryId: "cat-orchid",
    catalogExpansion: true,
  },
  {
    name: "Asiatic Lily",
    price: 1299,
    quantity: 10,
    unit: "sticks / 30+ buds",
    categoryId: "cat-lily",
    catalogExpansion: true,
  },
  {
    name: "Oriental Lily",
    price: 1999,
    quantity: 10,
    unit: "sticks / 30+ buds",
    categoryId: "cat-lily",
    catalogExpansion: true,
  },
  { name: "Orange Marigold Strings", price: 899, quantity: 20, unit: "Mala", categoryId: "cat-strings", catalogExpansion: true },
  { name: "Yellow Marigold Strings", price: 999, quantity: 20, unit: "Mala", categoryId: "cat-strings", catalogExpansion: true },
  { name: "Ashok Green Strings", price: 399, quantity: 24, unit: "Pcs", categoryId: "cat-strings", catalogExpansion: true },
  { name: "Rajnigandha Strings (5.5 Feet)", price: 1199, quantity: 50, unit: "Pcs", categoryId: "cat-strings", catalogExpansion: true },
  { name: "Mogra Mala", price: 1799, quantity: 5, unit: "Mala", categoryId: "cat-strings", catalogExpansion: true },
  { name: "Kanner Mala", price: 1299, quantity: 5, unit: "Mala", categoryId: "cat-strings", catalogExpansion: true },
  { name: "Orange Marigold Loose", price: 249, quantity: 1, unit: "kg", categoryId: "cat-fresh-loose-flowers", catalogExpansion: true },
  { name: "Yellow Marigold Loose", price: 299, quantity: 1, unit: "kg", categoryId: "cat-fresh-loose-flowers", catalogExpansion: true },
  { name: "Fresh Rose Loose", price: 449, quantity: 1, unit: "kg", categoryId: "cat-fresh-loose-flowers", catalogExpansion: true },
  { name: "White Chrysanthemum", price: 499, quantity: 1, unit: "kg", categoryId: "cat-fresh-loose-flowers", catalogExpansion: true },
  { name: "Fresh Mogra Loose", price: 299, quantity: 100, unit: "gm", categoryId: "cat-fresh-loose-flowers", catalogExpansion: true },
  { name: "Pink Lotus", price: 59, quantity: 1, unit: "pc", categoryId: "cat-exotic-premium-flowers", catalogExpansion: true },
  { name: "Blue Lotus", price: 99, quantity: 1, unit: "pc", categoryId: "cat-exotic-premium-flowers", catalogExpansion: true },
  { name: "Lisianthus", price: 899, quantity: 10, unit: "sticks", categoryId: "cat-exotic-premium-flowers", catalogExpansion: true },
  { name: "Hydrangea", price: 799, quantity: 1, unit: "pc", categoryId: "cat-exotic-premium-flowers", catalogExpansion: true },
  { name: "Gladiolus", price: 499, quantity: null, unit: "Bundle", categoryId: "cat-exotic-premium-flowers", catalogExpansion: true },
  { name: "Leatherleaf Farm", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Asparagus Fern", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Areca Palm", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Murraya leaves", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Patera (Elephant leaves)", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Solidago (Goldenrod)", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Limonium sinuatum (Statice)", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Eucalyptus Leaves", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Boxwood leaves", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Cordyline Leaves", price: 299, quantity: 1, unit: "Bundle", categoryId: "cat-leaves-farm-grasses" },
  { name: "Delphinium", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Alstroemeria", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Pincushion Protea", price: 699, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Astilbe", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Scabiosa", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Hypericum Berries", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Waxflower", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Snapdragon", price: 499, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
  { name: "Anthurium", price: 699, quantity: 10, unit: "stems", categoryId: "cat-exotic-premium-flowers" },
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

export const catalogExpansionFlowers = flowers.filter(
  (_, index) => products[index].catalogExpansion,
);