import assert from "node:assert/strict";
import { test } from "node:test";
import {
  festivalCollectionPatchSchema, festivalCollectionUpsertSchema,
  homepageUpsertSchema, productUpsertSchema,
} from "@/lib/validation";
import {
  hasFestivalHomepageConfig,
  isFestivalCollectionLive,
  isPublishedFlower,
  resolveCollectionFlowers,
} from "@/lib/festivals";
import { DEFAULT_HOMEPAGE, mergeHomepageConfig } from "@/lib/data";
import { CategoryModel, FestivalCollectionModel, FlowerModel } from "@/lib/db/models";
import type { Flower } from "@/lib/types";
import {
  catalogCollectionSeeds,
  festivalCategories,
  festivalProducts,
} from "./festival-seed-data";

const published = {
  title: "Test festival", slug: "test-festival", status: "published" as const, active: true,
  startsAt: "2026-10-20T06:00:00+05:30", endsAt: "2026-10-21T11:00:00+05:30",
  bannerImage: "https://res.cloudinary.com/test/image/upload/banner.jpg", productIds: ["fl-test"],
};

test("legacy products remain visible; explicit drafts/inactive products do not", () => {
  assert.equal(isPublishedFlower({}), true);
  assert.equal(isPublishedFlower({ active: false }), false);
  assert.equal(isPublishedFlower({ publicationStatus: "draft" }), false);
});

test("festival schedule uses exact instants, inclusive start and exclusive end", () => {
  assert.equal(isFestivalCollectionLive(published, new Date("2026-10-20T00:29:59Z")), false);
  assert.equal(isFestivalCollectionLive(published, new Date("2026-10-20T00:30:00Z")), true);
  assert.equal(isFestivalCollectionLive(published, new Date("2026-10-21T05:30:00Z")), false);
  assert.equal(isFestivalCollectionLive({ ...published, startsAt: undefined }), false);
  assert.equal(isFestivalCollectionLive({ ...published, active: false }), false);
  assert.equal(isFestivalCollectionLive({ ...published, status: "draft" }), false);
});

test("collection products keep editorial order and category fills do not duplicate", () => {
  const flowers = [
    { id: "rose-1", categoryId: "cat-rose" },
    { id: "rose-2", categoryId: "cat-rose" },
    { id: "lily-1", categoryId: "cat-lily" },
    { id: "mogra-1", categoryId: "cat-mogra" },
  ] as Flower[];
  const resolved = resolveCollectionFlowers(flowers, {
    productIds: ["mogra-1", "rose-2", "missing"],
    categoryIds: ["cat-rose", "cat-lily"],
  });
  assert.deepEqual(resolved.map((flower) => flower.id), [
    "mogra-1",
    "rose-2",
    "rose-1",
    "lily-1",
  ]);
});

test("publishing needs ordered dates, an uploaded banner and selections", () => {
  assert.equal(festivalCollectionUpsertSchema.safeParse(published).success, true);
  for (const patch of [
    { endsAt: published.startsAt }, { endsAt: undefined }, { bannerImage: "" },
    { bannerImage: "https://example.com/banner.jpg" }, { productIds: [] },
    { productIds: ["fl-test", "fl-test"] },
  ]) assert.equal(festivalCollectionUpsertSchema.safeParse({ ...published, ...patch }).success, false);
  const draft = festivalCollectionUpsertSchema.parse({ title: "Draft", slug: "draft" });
  assert.equal(draft.active, false);
  assert.equal(draft.status, "draft");
  assert.equal(draft.startsAt, undefined);
});

test("partial collection updates never reset arrays, status or toggles", () => {
  assert.deepEqual(festivalCollectionPatchSchema.parse({}), {});
  assert.deepEqual(festivalCollectionPatchSchema.parse({ title: "Updated" }), { title: "Updated" });
});

test("legacy homepage parses without new fields; empty/duplicate config falls back", () => {
  const legacy = homepageUpsertSchema.parse(DEFAULT_HOMEPAGE);
  assert.equal(hasFestivalHomepageConfig(legacy), false);
  assert.equal(hasFestivalHomepageConfig({ ...legacy, festivalHeroEnabled: true, sections: [] }), false);
  const section = { id: "categories" as const, enabled: true, sortOrder: 0 };
  assert.equal(hasFestivalHomepageConfig({ ...legacy, festivalHeroEnabled: true, sections: [section] }), true);
  assert.equal(homepageUpsertSchema.safeParse({ ...legacy, sections: [section, section] }).success, false);
});

test("persisted partial homepage configs preserve safe legacy defaults", () => {
  const merged = mergeHomepageConfig({
    sections: [],
    festivalHeroEnabled: true,
    showsFreshToday: false,
  });
  assert.deepEqual(merged.hero, DEFAULT_HOMEPAGE.hero);
  assert.deepEqual(merged.featuredFlowerIds, DEFAULT_HOMEPAGE.featuredFlowerIds);
  assert.deepEqual(merged.sections, []);
  assert.equal(merged.showsFreshToday, false);
});

test("all 26 rate-list entries validate as whole sellable packages", async () => {
  assert.equal(festivalProducts.length, 26);
  assert.equal(new Set(festivalProducts.map((product) => product.slug)).size, 26);
  for (const spec of festivalProducts) {
    const input = {
      name: spec.name, slug: spec.slug, categoryId: "cat-test", price: spec.price,
      quantity: spec.quantity, unit: spec.unit, unitLabel: spec.unitLabel,
      minQuantity: 1, quantityStep: 1, active: false, publicationStatus: "draft",
      stock: 0, images: [],
    };
    const parsed = productUpsertSchema.parse(input);
    assert.equal(parsed.quantity, spec.quantity);
    assert.equal(parsed.minQuantity, 1);
    await new FlowerModel({ _id: `fl-${spec.slug}`, ...parsed }).validate();
    assert.equal(productUpsertSchema.safeParse({ ...input, quantityStep: 0.5 }).success, false);
    assert.equal(productUpsertSchema.safeParse({ ...input, minQuantity: 0 }).success, false);
  }
});

test("storefront collections cover all 26 approved products without duplicates", () => {
  const productSlugs = new Set(festivalProducts.map((product) => product.slug));
  const referenced = catalogCollectionSeeds.flatMap((collection) => collection.productSlugs);
  assert.equal(referenced.length, 26);
  assert.equal(new Set(referenced).size, 26);
  for (const slug of referenced) assert.equal(productSlugs.has(slug), true, `Unknown product: ${slug}`);
  for (const collection of catalogCollectionSeeds) {
    assert.equal(
      festivalCategories.some((category) => category.slug === collection.categorySlug),
      true,
      `Unknown category: ${collection.categorySlug}`,
    );
  }
});

test("Mongoose new defaults are backward compatible and collections fail closed", async () => {
  const flower = new FlowerModel({ _id: "fl-test", name: "Test", slug: "test", categoryId: "cat-test", price: 10 });
  await flower.validate();
  assert.equal(flower.active, true);
  assert.equal(flower.publicationStatus, "published");
  assert.equal(flower.minQuantity, 1);
  assert.equal(flower.quantityStep, 1);
  const category = new CategoryModel({ _id: "cat-test", name: "Test", slug: "test" });
  assert.equal(category.active, true);
  const collection = new FestivalCollectionModel({ _id: "festival-test", title: "Test", slug: "test" });
  await collection.validate();
  assert.equal(collection.active, false);
  assert.equal(collection.status, "draft");
  assert.equal(collection.startsAt, undefined);
});
