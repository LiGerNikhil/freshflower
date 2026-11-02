/**
 * Seed only the requested florist products without changing existing records.
 *
 * Preview: npx tsx scripts/seed-requested-florist-products.ts
 * Apply:   npx tsx scripts/seed-requested-florist-products.ts --apply
 *
 * This is intentionally separate from seed.ts and seed-catalog-expansion.ts.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { CategoryModel, FlowerModel } from "@/lib/db/models";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

const CATEGORY_ID = "cat-exotic-premium-flowers";

const requestedProducts = [
  {
    name: "Hypericum Berries",
    price: 399,
    colors: ["Red", "Pink", "Green", "White"],
  },
  {
    name: "Creaspedia Ball",
    price: 499,
    colors: [],
  },
  {
    name: "Pincushion Red",
    price: 499,
    colors: ["Orange", "Yellow", "Peach"],
  },
  {
    name: "Cymbidium",
    price: 2999,
    colors: ["Pink", "White", "Red", "Orange", "Yellow", "Peach"],
  },
  {
    name: "Wax Flower",
    price: 399,
    colors: ["White", "Pink"],
  },
  {
    name: "The Iris Blue",
    price: 399,
    colors: ["Blue"],
  },
  {
    name: "Tulip",
    price: 299,
    colors: ["Red", "White", "Orange", "Purple", "Maroon"],
  },
] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namePattern(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s-]*");
}

function productDocument(product: (typeof requestedProducts)[number]) {
  const slug = slugify(product.name);
  const colorVariants = product.colors.map((color) => ({
    color,
    price: product.price,
  }));
  const colorDescription = product.colors.length
    ? ` Available in ${product.colors.join(", ")}.`
    : "";

  return {
    _id: `fl-${slug}`,
    name: product.name,
    slug,
    categoryId: CATEGORY_ID,
    occasionIds: [],
    description: `${product.name} stems for bouquets and floral arrangements.${colorDescription}`,
    shortDescription: product.colors.length
      ? `${product.name} · ${product.colors.join(", ")}`
      : `${product.name} stems`,
    price: product.price,
    colorVariants,
    colors: product.colors.length ? [...product.colors] : ["mixed"],
    images: ["gradient-ivory"],
    videos: [],
    inStock: true,
    availableToday: true,
    featured: false,
    rating: 0,
    reviewCount: 0,
    sku: `FF-${slug.toUpperCase().replace(/-/g, "").slice(0, 14)}`,
    quantity: 1,
    unit: "stems/pcs",
    unitLabel: "1 stem / pc",
    stock: 25,
    stockStatus: "in-stock",
    active: true,
    publicationStatus: "published",
    minQuantity: 1,
    quantityStep: 1,
    festivalTags: [],
    badges: [],
    poojaEligible: false,
    requiresAdvancePayment: false,
    deliveryPolicy: "standard",
    bestSeller: false,
    newArrival: true,
    seoTitle: product.name,
    metaDescription: `${product.name} at ₹${product.price} per stem from FreshFlower.zone.`,
    keywords: [product.name.toLowerCase()],
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply") || args.length > 1) {
    throw new Error("Usage: npx tsx scripts/seed-requested-florist-products.ts [--apply]");
  }
  const apply = args.includes("--apply");

  await dbConnect();
  try {
    const category = await CategoryModel.findOne({
      _id: CATEGORY_ID,
      active: { $ne: false },
    }).select({ _id: 1 }).lean();
    if (!category) {
      throw new Error(`Required active category is missing: ${CATEGORY_ID}`);
    }

    const existingProducts = await FlowerModel.find({
      $or: requestedProducts.flatMap((product) => {
        const slug = slugify(product.name);
        return [
          { _id: `fl-${slug}` },
          { slug },
          { name: { $regex: namePattern(product.name), $options: "i" } },
        ];
      }),
    }).select({ _id: 1, name: 1, slug: 1 }).lean();

    const existingNames = new Set(existingProducts.map((product) => normalizeName(product.name)));
    const existingIds = new Set(existingProducts.map((product) => String(product._id)));
    const existingSlugs = new Set(existingProducts.map((product) => product.slug));
    const toInsert = [];
    const skipped = [];

    for (const product of requestedProducts) {
      const id = `fl-${slugify(product.name)}`;
      const slug = slugify(product.name);
      if (existingNames.has(normalizeName(product.name))) {
        skipped.push({ name: product.name, reason: "already listed" });
        continue;
      }
      if (existingIds.has(id) || existingSlugs.has(slug)) {
        throw new Error(`Product ID or slug is already in use for "${product.name}". No products were seeded.`);
      }
      toInsert.push(product);
    }

    console.log(JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      willAdd: toInsert.map((product) => ({
        name: product.name,
        price: product.price,
        colors: product.colors,
      })),
      skipped,
    }, null, 2));

    if (!apply || toInsert.length === 0) return;

    const operations = toInsert.map((product) => {
      const document = productDocument(product);
      return {
        updateOne: {
          filter: { _id: document._id },
          update: { $setOnInsert: document },
          upsert: true,
        },
      };
    });

    await FlowerModel.bulkWrite(operations, { ordered: true });

    const seededIds = toInsert.map((product) => `fl-${slugify(product.name)}`);
    const savedProducts = await FlowerModel.find({ _id: { $in: seededIds } })
      .select({ _id: 1, name: 1, price: 1, colorVariants: 1, categoryId: 1, active: 1 })
      .lean();
    const savedById = new Map(savedProducts.map((product) => [String(product._id), product]));
    const invalidProducts = toInsert.filter((product) => {
      const saved = savedById.get(`fl-${slugify(product.name)}`);
      const savedColors = saved?.colorVariants?.map((variant: { color: string }) => variant.color) ?? [];
      return !saved
        || saved.name !== product.name
        || saved.price !== product.price
        || saved.categoryId !== CATEGORY_ID
        || saved.active !== true
        || JSON.stringify(savedColors) !== JSON.stringify(product.colors);
    });
    if (invalidProducts.length) {
      throw new Error(`Database verification failed for: ${invalidProducts.map((product) => product.name).join(", ")}`);
    }

    console.log(`Seeded and verified ${toInsert.length} requested products. Existing products were left unchanged.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Requested florist product seed failed:", error);
  process.exitCode = 1;
});
