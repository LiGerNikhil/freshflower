import type { Flower } from "@/lib/types";

const products = [
  { name: "Gerbera", price: 149, quantity: 10, unit: "pcs", categoryId: "cat-gerbera" },
  { name: "Mogra", price: 149, quantity: 200, unit: "gm", categoryId: "cat-mogra" },
  { name: "Bangalore Rose", price: 349, quantity: 20, unit: "pcs", categoryId: "cat-roses" },
  { name: "Rajnigandha", price: 449, quantity: 24, unit: "sticks", categoryId: "cat-rajnigandha" },
  { name: "Sunflower", price: 249, quantity: 5, unit: "pcs", categoryId: "cat-sunflower" },
  { name: "Daisy", price: 449, quantity: null, unit: "Bundle", categoryId: "cat-gerbera" },
  { name: "Baby's Breath", price: 399, quantity: null, unit: "Bundle", categoryId: "cat-babys-breath" },
  { name: "Carnations", price: 299, quantity: 20, unit: "pcs", categoryId: "cat-carnations" },
  { name: "Orchid", price: 349, quantity: 10, unit: "sticks", categoryId: "cat-orchid" },
  { name: "Asiatic Lily", price: 1399, quantityLabel: "10/30+", categoryId: "cat-lily" },
  { name: "Oriental Lily", price: 799, quantityLabel: "10/30+", categoryId: "cat-lily" },
] as const;

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
  const unit = "unit" in product ? product.unit : quantityLabel;
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
    stemCount: typeof quantity === "number" && unit === "pcs" ? quantity : undefined,
    colors: ["mixed"],
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
