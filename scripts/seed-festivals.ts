/**
 * Read-only report: npx tsx scripts/seed-festivals.ts
 * Insert missing drafts: npx tsx scripts/seed-festivals.ts --apply
 * Existing documents are NEVER updated, including timestamps and merchandising.
 * Public catalogue reads exclude drafts. Review a dry run before applying.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { festivalCollectionUpsertSchema, productUpsertSchema } from "@/lib/validation";
import { festivalCategories, festivalCollectionSeeds, festivalProducts } from "./festival-seed-data";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });
// A dry run must not create collections/indexes as a side effect of model init.
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

type CatalogDoc = {
  _id: string;
  slug: string;
  name: string;
  price?: number;
  quantity?: number;
  stemCount?: number;
  unit?: string;
  unitLabel?: string;
  colorVariants?: { color: string; price: number }[];
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--apply", "--dry-run"].includes(arg)) || (args.includes("--apply") && args.includes("--dry-run"))) {
    throw new Error("Use --dry-run (default) OR --apply.");
  }
  const apply = args.includes("--apply");
  const { CategoryModel, FlowerModel, FestivalCollectionModel } = await import("@/lib/db/models");
  await dbConnect();
  const [categories, products, collections] = await Promise.all([
    CategoryModel.find().lean<CatalogDoc[]>(),
    FlowerModel.find().lean<CatalogDoc[]>(),
    FestivalCollectionModel.find().lean<Array<{ _id: string; slug: string }>>(),
  ]);
  const categoryDocuments: Record<string, unknown>[] = [];
  const productDocuments: Record<string, unknown>[] = [];
  const collectionDocuments: Record<string, unknown>[] = [];
  const categoryIds = new Map(categories.map((category) => [category.slug, String(category._id)]));
  const productIds = new Map<string, string>();
  const report: Record<string, unknown>[] = [];
  const conflicts: string[] = [];

  for (const [index, spec] of festivalCategories.entries()) {
    const aliases: string[] = [spec.slug, ...spec.aliases, normalize(spec.name)];
    const matches = categories.filter((category) => aliases.includes(category.slug) || aliases.includes(normalize(category.name)));
    if (matches.length > 1) conflicts.push(`Ambiguous category: ${spec.name}`);
    const match = matches[0];
    const id = match ? String(match._id) : `cat-${spec.slug}`;
    if (!match && categories.some((category) => String(category._id) === id)) conflicts.push(`Category ID collision: ${id}`);
    categoryIds.set(spec.slug, id);
    if (!match) categoryDocuments.push({
      _id: id, name: spec.name, slug: spec.slug, description: spec.name,
      heroImage: "gradient-ivory", active: false, sortOrder: 100 + index,
      seoTitle: spec.name, metaDescription: `${spec.name} for Delhi NCR.`, keywords: [],
    });
  }

  for (const spec of festivalProducts) {
    const aliases = [spec.slug, ...spec.aliases, normalize(spec.name)];
    const matches = products.filter((product) => aliases.includes(product.slug) || aliases.includes(normalize(product.name)));
    if (matches.length > 1) conflicts.push(`Ambiguous product: ${spec.name} (${matches.map((item) => item.slug).join(", ")})`);
    const match = matches[0];
    if (match) {
      productIds.set(spec.slug, String(match._id));
      const variants = match.colorVariants ?? [];
      const storedQuantity = match.quantity ?? match.stemCount;
      const packageReview = storedQuantity !== spec.quantity || normalize(match.unit ?? "") !== normalize(spec.unit);
      report.push({
        product: spec.name, slug: match.slug, action: "preserve-existing",
        storedPrice: match.price, sheetPrice: spec.price, priceMismatch: match.price !== spec.price,
        variants: variants.map(({ color, price }) => ({ color, price })),
        variantPriceMismatch: variants.some((variant) => variant.price !== spec.price),
        storedPackage: match.unitLabel ?? `${storedQuantity ?? "unknown"} ${match.unit ?? "unknown"}`,
        sheetPackage: spec.unitLabel, packageReview,
      });
      // A name match with different/unknown packaging is held for human review,
      // not silently duplicated or repriced (especially Mogra 100 gm vs 200 gm).
      continue;
    }
    const id = `fl-${spec.slug}`;
    if (products.some((product) => String(product._id) === id)) conflicts.push(`Product ID collision: ${id}`);
    const categoryId = spec.categorySlugs.map((slug) => categoryIds.get(slug)).find(Boolean);
    if (!categoryId) throw new Error(`No category mapping for ${spec.name}`);
    productIds.set(spec.slug, id);
    const doc = {
      _id: id, name: spec.name, slug: spec.slug, categoryId,
      description: `${spec.name}, sold strictly as ${spec.unitLabel}. 100% advance payment. Porter delivery charge is separate.`,
      shortDescription: spec.unitLabel, price: spec.price, quantity: spec.quantity,
      unit: spec.unit, unitLabel: spec.unitLabel, minQuantity: 1, quantityStep: 1,
      images: [], videos: [], colorVariants: [], occasionIds: [], colors: [],
      stock: 0, stockStatus: "sold-out", inStock: false, availableToday: false,
      active: false, publicationStatus: "draft", featured: false, bestSeller: false, newArrival: false,
      festivalTags: ["diwali-season"], badges: ["festival-special"],
      poojaEligible: spec.pooja, requiresAdvancePayment: true,
      deliveryPolicy: spec.pooja ? "pooja-morning" : "standard",
      seoTitle: spec.name, metaDescription: `${spec.name} · ${spec.unitLabel} · Delhi NCR flower delivery.`,
      createdAt: new Date(), updatedAt: new Date(),
    };
    productUpsertSchema.parse(doc);
    await new FlowerModel(doc).validate();
    productDocuments.push(doc);
    report.push({ product: spec.name, slug: spec.slug, action: "insert-draft", sheetPrice: spec.price, sheetPackage: spec.unitLabel });
  }

  for (const [index, spec] of festivalCollectionSeeds.entries()) {
    if (collections.some((collection) => collection.slug === spec.slug)) continue;
    const id = `festival-${spec.slug}`;
    if (collections.some((collection) => String(collection._id) === id)) conflicts.push(`Collection ID collision: ${id}`);
    const doc = {
      _id: id, ...spec, status: "draft", active: false, sortOrder: index,
      subtitle: "Fresh festival flowers for Delhi NCR",
      productIds: festivalProducts.filter((product) => !spec.poojaCollection || product.pooja)
        .map((product) => productIds.get(product.slug)).filter((value): value is string => Boolean(value)),
      categoryIds: [], badgeText: "Festival Special", whatsappBulkOrderEnabled: false,
      createdAt: new Date(), updatedAt: new Date(),
    };
    festivalCollectionUpsertSchema.parse(doc);
    await new FestivalCollectionModel(doc).validate();
    collectionDocuments.push(doc);
  }
  for (const doc of categoryDocuments) await new CategoryModel(doc).validate();

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run", categoriesToCreate: categoryDocuments.map((doc) => doc.slug),
    summary: { newProducts: productDocuments.length, existingProducts: report.length - productDocuments.length,
      newCategories: categoryDocuments.length, newCollections: collectionDocuments.length },
    collectionsToCreate: collectionDocuments.map((doc) => doc.slug),
    products: report, conflicts,
    note: "All existing documents are preserved. Package mismatches require review. No dates or images are fabricated. Homepage config is untouched.",
  }, null, 2));
  if (conflicts.length) throw new Error("Resolve ambiguous matches/ID collisions before applying. No seed writes performed.");
  if (!apply) return;

  // Explicitly ensure slug uniqueness before applying. No index sync/drop.
  for (const model of [CategoryModel, FlowerModel, FestivalCollectionModel]) {
    await model.collection.createIndex({ slug: 1 }, { unique: true });
  }
  let inserted = 0;
  let existingDocumentsModified = 0;
  for (const [model, docs] of [
    [CategoryModel, categoryDocuments], [FlowerModel, productDocuments],
    [FestivalCollectionModel, collectionDocuments],
  ] as const) {
    for (const doc of docs) {
      const result = await model.updateOne({ slug: doc.slug }, { $setOnInsert: doc }, {
        upsert: true, timestamps: false, setDefaultsOnInsert: false, runValidators: true,
      });
      inserted += result.upsertedCount;
      existingDocumentsModified += result.modifiedCount;
    }
  }
  console.log(JSON.stringify({ inserted, existingDocumentsModified }));
}

main().catch((error: unknown) => {
  // Connection errors can contain credentials/hosts; don't print raw errors.
  console.error(error instanceof Error && !/mongo|connect|auth|ENOTFOUND|ECONN/i.test(error.message)
    ? error.message : "Festival seed failed. Check database configuration/connectivity; credentials are not logged.");
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
