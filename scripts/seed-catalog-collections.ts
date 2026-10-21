/**
 * Read-only report: npx tsx scripts/seed-catalog-collections.ts
 * Apply: npx tsx scripts/seed-catalog-collections.ts --apply
 *
 * Inserts missing catalogue records, aligns the 26 approved products to their
 * published sellable packages, and creates the three storefront collections.
 * Existing product photography, descriptions and merchandising flags are kept.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { CategoryModel, FestivalCollectionModel, FlowerModel } from "@/lib/db/models";
import { productUpsertSchema } from "@/lib/validation";
import {
  catalogCollectionSeeds,
  catalogImageSourceSlugs,
  festivalCategories,
  festivalProducts,
} from "./festival-seed-data";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

type ProductDoc = {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  images?: string[];
  colorVariants?: { color: string; price: number; image?: string; compareAtPrice?: number }[];
  stock?: number;
};

type CategoryDoc = { _id: string; name: string; slug: string };

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SEED_START = new Date("2024-01-01T00:00:00+05:30");
const SEED_END = new Date("2035-12-31T23:59:59+05:30");
const SEED_GRADIENTS: Record<string, string> = {
  "garlands-malas": "gradient-gold",
  "loose-flowers-petals": "gradient-blush",
  "exotic-cut-flowers": "gradient-lavender",
};
const CATEGORY_IMAGE_SOURCES: Record<string, string> = {
  "garlands-malas": "mogra",
  "loose-flowers-petals": "bangalore-rose",
  "exotic-cut-flowers": "orchid",
};

function aliasesFor(name: string, slug: string, aliases: readonly string[]) {
  return [...new Set([slug, ...aliases, normalize(name)])];
}

function matchProduct(products: ProductDoc[], name: string, slug: string, aliases: readonly string[]) {
  const expected = aliasesFor(name, slug, aliases);
  return products.find(
    (product) => expected.includes(product.slug) || expected.includes(normalize(product.name)),
  );
}

function imageForNewProduct(slug: string, categorySlug: string, products: ProductDoc[]) {
  const sourceSlug = catalogImageSourceSlugs[slug];
  if (sourceSlug) {
    const product = matchProduct(products, sourceSlug, sourceSlug, []);
    const image = product?.images?.find((value) => /^https:\/\/res\.cloudinary\.com\//.test(value));
    if (image) return image;
  }
  return SEED_GRADIENTS[categorySlug] ?? "gradient-ivory";
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--apply", "--dry-run"].includes(arg)) || (args.includes("--apply") && args.includes("--dry-run"))) {
    throw new Error("Use --dry-run (default) OR --apply.");
  }
  const apply = args.includes("--apply");
  await dbConnect();

  const [categoryDocs, productDocs, collectionDocs] = await Promise.all([
    CategoryModel.find().lean<CategoryDoc[]>(),
    FlowerModel.find().lean<ProductDoc[]>(),
    FestivalCollectionModel.find().lean<Array<{ _id: string; slug: string }>>(),
  ]);

  const conflicts: string[] = [];
  const categoryIds = new Map<string, string>();
  const newCategoryDocs: Record<string, unknown>[] = [];

  for (const [index, spec] of festivalCategories.entries()) {
    const matches = categoryDocs.filter((category) => {
      const expected = aliasesFor(spec.name, spec.slug, spec.aliases);
      return expected.includes(category.slug) || expected.includes(normalize(category.name));
    });
    if (matches.length > 1) conflicts.push(`Ambiguous category: ${spec.name}`);
    const match = matches[0];
    const id = match ? String(match._id) : `cat-${spec.slug}`;
    if (!match && categoryDocs.some((category) => String(category._id) === id)) {
      conflicts.push(`Category ID collision: ${id}`);
    }
    categoryIds.set(spec.slug, id);
    if (!match) {
      const imageSource = productDocs.find(
        (product) => product.slug === CATEGORY_IMAGE_SOURCES[spec.slug],
      );
      const imageUrl = imageSource?.images?.find((value) =>
        /^https:\/\/res\.cloudinary\.com\//.test(value),
      );
      newCategoryDocs.push({
        _id: id,
        name: spec.name,
        slug: spec.slug,
        description: `Fresh ${spec.name.toLowerCase()} delivered across Delhi NCR.`,
        heroImage: SEED_GRADIENTS[spec.slug] ?? "gradient-ivory",
        ...(imageUrl ? { imageUrl } : {}),
        active: true,
        sortOrder: index,
        seoTitle: `${spec.name} | FreshFlower.zone`,
        metaDescription: `Shop fresh ${spec.name.toLowerCase()} with same-day delivery across Delhi NCR.`,
        keywords: [spec.name.toLowerCase(), "fresh flowers delhi"],
      });
    }
  }

  const productIds = new Map<string, string>();
  const productImages = new Map<string, string>();
  const newProductDocs: Record<string, unknown>[] = [];
  const productUpdates: Array<{ id: string; patch: Record<string, unknown>; action: string }> = [];
  const productReport: Record<string, unknown>[] = [];

  for (const spec of festivalProducts) {
    const match = matchProduct(productDocs, spec.name, spec.slug, spec.aliases);

    if (match) {
      const id = String(match._id);
      productIds.set(spec.slug, id);
      const existingImage = match.images?.find((value) => /^https?:\/\//i.test(value));
      if (existingImage) productImages.set(spec.slug, existingImage);
      const variants = (match.colorVariants ?? []).map((variant) => ({
        ...variant,
        price: spec.price,
      }));
      const patch = {
        name: spec.name,
        price: spec.price,
        quantity: spec.quantity,
        unit: spec.unit,
        unitLabel: spec.unitLabel,
        minQuantity: 1,
        quantityStep: 1,
        stock: Math.max(match.stock ?? 0, 25),
        stockStatus: "in-stock",
        inStock: true,
        availableToday: true,
        active: true,
        publicationStatus: "published",
        colorVariants: variants,
        colors: variants.length ? variants.map((variant) => variant.color) : ["mixed"],
        poojaEligible: spec.pooja,
        requiresAdvancePayment: true,
        deliveryPolicy: spec.pooja ? "pooja-morning" : "standard",
        shortDescription: spec.unitLabel,
        seoTitle: spec.name,
        metaDescription: `${spec.name} — ${spec.unitLabel} — fresh flower delivery across Delhi NCR.`,
      };
      productUpdates.push({ id, patch, action: "update-existing" });
      productReport.push({
        product: spec.name,
        slug: match.slug,
        action: "update-existing",
        price: spec.price,
        package: spec.unitLabel,
      });
      continue;
    }

    const categorySlug =
      spec.categorySlugs.find((slug) => categoryIds.has(slug)) ??
      spec.categorySlugs.at(-1) ??
      "exotic-cut-flowers";
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`No category mapping for ${spec.name}`);
    const id = `fl-${spec.slug}`;
    if (productDocs.some((product) => String(product._id) === id)) {
      conflicts.push(`Product ID collision: ${id}`);
    }
    const image = imageForNewProduct(spec.slug, categorySlug, productDocs);
    productImages.set(spec.slug, image);
    productIds.set(spec.slug, id);
    const doc = {
      _id: id,
      name: spec.name,
      slug: spec.slug,
      categoryId,
      description: `${spec.name}, sold strictly as ${spec.unitLabel}. Freshly prepared to order and delivered across Delhi NCR.`,
      shortDescription: spec.unitLabel,
      price: spec.price,
      quantity: spec.quantity,
      unit: spec.unit,
      unitLabel: spec.unitLabel,
      minQuantity: 1,
      quantityStep: 1,
      images: [image],
      videos: [],
      colorVariants: [],
      colors: ["mixed"],
      occasionIds: [],
      stock: 50,
      stockStatus: "in-stock",
      inStock: true,
      availableToday: true,
      active: true,
      publicationStatus: "published",
      featured: false,
      bestSeller: false,
      newArrival: true,
      festivalTags: [],
      badges: [],
      poojaEligible: spec.pooja,
      requiresAdvancePayment: true,
      deliveryPolicy: spec.pooja ? "pooja-morning" : "standard",
      seoTitle: spec.name,
      metaDescription: `${spec.name} — ${spec.unitLabel} — fresh flower delivery across Delhi NCR.`,
      keywords: [spec.name.toLowerCase(), spec.unit.toLowerCase(), "delhi ncr"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    productUpsertSchema.parse({ ...doc, images: [image] });
    await new FlowerModel(doc).validate();
    newProductDocs.push(doc);
    productReport.push({
      product: spec.name,
      slug: spec.slug,
      action: "insert-published",
      price: spec.price,
      package: spec.unitLabel,
    });
  }

  const fallbackImage = (collection: (typeof catalogCollectionSeeds)[number]) => {
    for (const slug of collection.productSlugs) {
      const image = productImages.get(slug);
      if (image && /^https:\/\/res\.cloudinary\.com\//.test(image)) return image;
    }
    return "";
  };

  const newCollectionDocs: Record<string, unknown>[] = [];
  for (const [index, spec] of catalogCollectionSeeds.entries()) {
    const categoryId = categoryIds.get(spec.categorySlug);
    const productIdsForCollection = spec.productSlugs
      .map((slug) => productIds.get(slug))
      .filter((value): value is string => Boolean(value));
    if (!categoryId || productIdsForCollection.length !== spec.productSlugs.length) {
      conflicts.push(`Collection references could not be resolved: ${spec.title}`);
      continue;
    }
    const sourceBanner = productImages.get(spec.bannerSourceSlug);
    const bannerImage =
      sourceBanner && /^https:\/\/res\.cloudinary\.com\//.test(sourceBanner)
        ? sourceBanner
        : fallbackImage(spec);
    if (!bannerImage) conflicts.push(`No Cloudinary banner source for ${spec.title}`);
    if (collectionDocs.some((collection) => collection.slug === spec.slug)) continue;
    const id = `collection-${spec.slug}`;
    if (collectionDocs.some((collection) => String(collection._id) === id)) {
      conflicts.push(`Collection ID collision: ${id}`);
    }
    newCollectionDocs.push({
      _id: id,
      title: spec.title,
      slug: spec.slug,
      subtitle: spec.subtitle,
      bannerImage,
      status: "published",
      active: true,
      startsAt: SEED_START,
      endsAt: SEED_END,
      productIds: productIdsForCollection,
      categoryIds: [categoryId],
      sortOrder: index,
      badgeText: spec.badgeText,
      poojaCollection: spec.poojaCollection,
      whatsappBulkOrderEnabled: spec.whatsappBulkOrderEnabled,
      seoTitle: spec.seoTitle,
      metaDescription: spec.metaDescription,
      keywords: [...spec.keywords],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    summary: {
      newCategories: newCategoryDocs.length,
      newProducts: newProductDocs.length,
      updatedProducts: productUpdates.length,
      newCollections: newCollectionDocs.length,
    },
    categories: newCategoryDocs.map((doc) => doc.slug),
    collections: newCollectionDocs.map((doc) => doc.slug),
    products: productReport,
    conflicts,
    note: "Existing product images, descriptions and merchandising flags are preserved. The 26 approved names, prices and sellable packages are aligned and published.",
  }, null, 2));

  if (conflicts.length) throw new Error("Resolve conflicts before applying. No writes performed.");
  if (!apply) return;

  for (const doc of newCategoryDocs) {
    await CategoryModel.updateOne(
      { slug: doc.slug },
      { $setOnInsert: doc },
      { upsert: true, timestamps: false, setDefaultsOnInsert: false, runValidators: true },
    );
  }
  for (const update of productUpdates) {
    await FlowerModel.updateOne(
      { _id: update.id },
      { $set: update.patch },
      { runValidators: true },
    );
  }
  for (const doc of newProductDocs) {
    await FlowerModel.updateOne(
      { slug: doc.slug },
      { $setOnInsert: doc },
      { upsert: true, timestamps: false, setDefaultsOnInsert: false, runValidators: true },
    );
  }
  for (const doc of newCollectionDocs) {
    await FestivalCollectionModel.updateOne(
      { slug: doc.slug },
      { $setOnInsert: doc },
      { upsert: true, timestamps: false, setDefaultsOnInsert: false, runValidators: true },
    );
  }

  console.log(JSON.stringify({ applied: true }));
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error && !/mongo|connect|auth|ENOTFOUND|ECONN/i.test(error.message)
      ? error.message
      : "Catalog seed failed. Check database configuration/connectivity; credentials are not logged.");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
