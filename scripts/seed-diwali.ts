/**
 * Diwali advance-booking campaign seed.
 *
 * Read-only report: npx tsx scripts/seed-diwali.ts
 * Create the campaign if it does not exist: npx tsx scripts/seed-diwali.ts --apply
 *
 * The campaign is created once and never overwritten. After creation every
 * field (dates, products, areas, copy, banner) is edited in
 * /admin/diwali — this script is only the initial configuration.
 *
 * Dates, delivery windows and product selections below are seed values, not
 * application logic. Set DIWALI_SEED_YEAR to seed a different festival year.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { FestivalCollectionModel, FlowerModel } from "@/lib/db/models";
import { festivalCollectionUpsertSchema } from "@/lib/validation";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });
mongoose.set("autoIndex", false);
mongoose.set("autoCreate", false);

const CAMPAIGN_ID = "festival-diwali";
const CAMPAIGN_SLUG = "diwali";
const BANNER_IMAGE =
  "https://res.cloudinary.com/z4n91g1t/image/upload/v1792584627/freshflower/file_w9hd1x.jpg";

const PRODUCT_SEEDS = [
  {
    productId: "fl-orange-marigold-strings",
    displayLabel: "Orange Marigold Strings · 20 mala",
    promotionalDescription: "The festive staple for doorways, mandaps and garlands.",
    featured: true,
    bulkOrderEligible: true,
    maxQuantity: 50,
  },
  {
    productId: "fl-yellow-marigold-strings",
    displayLabel: "Yellow Marigold Strings · 20 mala",
    promotionalDescription: "Warm golden marigold strings for pooja and decor.",
    featured: true,
    bulkOrderEligible: true,
    maxQuantity: 50,
  },
  {
    productId: "fl-orange-marigold-loose",
    displayLabel: "Orange Marigold Loose · per kg",
    promotionalDescription: "Loose marigold for rangoli, torans and bulk decor.",
    featured: false,
    bulkOrderEligible: true,
    maxQuantity: 100,
  },
  {
    productId: "fl-yellow-marigold-loose",
    displayLabel: "Yellow Marigold Loose · per kg",
    promotionalDescription: "Fresh yellow marigold for festive arrangements.",
    featured: false,
    bulkOrderEligible: true,
    maxQuantity: 100,
  },
  {
    productId: "fl-fresh-mogra-loose",
    displayLabel: "Fresh Mogra Loose · 100 gm",
    promotionalDescription: "Fragrant jasmine buds for pooja and gajras.",
    featured: true,
    bulkOrderEligible: true,
    maxQuantity: 50,
  },
  {
    productId: "fl-mogra-mala",
    displayLabel: "Mogra Mala · 5 mala",
    promotionalDescription: "Hand-strung mogra malas for the pooja room.",
    featured: true,
    bulkOrderEligible: true,
    maxQuantity: 50,
  },
  {
    productId: "fl-kanner-mala",
    displayLabel: "Kanner Mala · 5 mala",
    promotionalDescription: "Traditional kanner malas for Lakshmi pooja.",
    featured: false,
    bulkOrderEligible: true,
    maxQuantity: 50,
  },
  {
    productId: "fl-pink-lotus",
    displayLabel: "Pink Lotus · per pc",
    promotionalDescription: "Fresh lotus blooms for pooja and festive styling.",
    featured: true,
    bulkOrderEligible: false,
    maxQuantity: 50,
  },
  {
    productId: "fl-rajnigandha-strings-5-5-feet",
    displayLabel: "Rajnigandha Strings · 5.5 feet",
    promotionalDescription: "Evening-fragrant tuberose strings for celebrations.",
    featured: false,
    bulkOrderEligible: true,
    maxQuantity: 50,
  },
  {
    productId: "fl-white-chrysanthemum",
    displayLabel: "White Chrysanthemum · per kg",
    promotionalDescription: "Bright white blooms for rangoli and decor.",
    featured: false,
    bulkOrderEligible: true,
    maxQuantity: 100,
  },
  {
    productId: "fl-fresh-rose-loose",
    displayLabel: "Fresh Rose Loose · per kg",
    promotionalDescription: "Loose roses for petals, pooja and arrangements.",
    featured: false,
    bulkOrderEligible: true,
    maxQuantity: 100,
  },
] as const;

function indiaYear(): number {
  return Number(new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
  }).format(new Date()));
}

function istInstant(year: number, month: number, day: number): string {
  // +05:30 is the only offset used by the admin editor for campaign schedule.
  return new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+05:30`).toISOString();
}

function seedDoc(year: number) {
  return {
    _id: CAMPAIGN_ID,
    title: "Hosting a Diwali Party? We’ve Got Your Flowers Covered!",
    slug: CAMPAIGN_SLUG,
    subtitle: "Diwali Special · Advance bookings open",
    description:
      "Fresh marigold, mogra, lotus and pooja flowers for Diwali. Choose your stems, tell us how much you need, and request your preferred delivery date.",
    bannerImage: BANNER_IMAGE,
    status: "published" as const,
    active: true,
    startsAt: istInstant(year, 10, 26),
    endsAt: istInstant(year, 11, 2),
    productIds: PRODUCT_SEEDS.map((product) => product.productId),
    categoryIds: [],
    sortOrder: 0,
    badgeText: "DIWALI SPECIAL · ADVANCE BOOKINGS OPEN",
    lastOrderByText: "Advance requests close before Diwali — share your delivery date and we’ll confirm availability.",
    poojaCollection: false,
    whatsappBulkOrderEnabled: true,
    keywords: ["diwali flowers", "diwali advance booking", "marigold delhi ncr"],
    advanceBooking: {
      description:
        "Beat the festive rush. Choose your flowers, tell us how much you need, and reserve your preferred delivery date with FreshFlower.zone.",
      announcement: "DIWALI SPECIAL · ADVANCE BOOKINGS OPEN",
      primaryCtaLabel: "Book Your Diwali Flowers",
      secondaryCtaLabel: "Explore Diwali Collection",
      deliveryDates: [`${year}-10-30`, `${year}-10-31`, `${year}-11-01`],
      deliveryTimePreferences: [
        "Early morning (5 AM – 8 AM)",
        "Morning (8 AM – 11 AM)",
        "Afternoon (12 PM – 4 PM)",
      ],
      deliveryAreaIds: [], // empty = every active delivery area (editable in admin)
      dailyBookingLimit: 0,
      earlyMorningDelivery: true,
      customRequirementsEnabled: true,
      productSettings: PRODUCT_SEEDS.map((product) => ({
        productId: product.productId,
        visible: true,
        featured: product.featured,
        displayLabel: product.displayLabel,
        promotionalDescription: product.promotionalDescription,
        minQuantity: 1,
        maxQuantity: product.maxQuantity,
        bulkOrderEligible: product.bulkOrderEligible,
        eligibleVariants: [], // these catalogue products have no colour variants
      })),
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--apply", "--dry-run"].includes(arg)) || (args.includes("--apply") && args.includes("--dry-run"))) {
    throw new Error("Use --dry-run (default) OR --apply.");
  }
  const apply = args.includes("--apply");
  await dbConnect();

  const [existingById, existingBySlug, catalogueProducts] = await Promise.all([
    FestivalCollectionModel.findById(CAMPAIGN_ID).lean(),
    FestivalCollectionModel.findOne({ slug: CAMPAIGN_SLUG }).lean(),
    FlowerModel.find({
      _id: { $in: PRODUCT_SEEDS.map((product) => product.productId) },
      active: { $ne: false },
      publicationStatus: { $ne: "draft" },
    }).select({ _id: 1, name: 1, colorVariants: 1 }).lean(),
  ]);

  if (existingById || existingBySlug) {
    console.log(JSON.stringify({
      status: "skipped",
      reason: existingById
        ? `Campaign ${CAMPAIGN_ID} already exists. Edit it in /admin/diwali.`
        : `Slug "${CAMPAIGN_SLUG}" is already used by ${String(existingBySlug?._id)}. Refusing to create a conflicting campaign.`,
    }, null, 2));
    return;
  }

  const foundIds = new Set(catalogueProducts.map((product) => String(product._id)));
  const missing = PRODUCT_SEEDS.map((product) => product.productId).filter((id) => !foundIds.has(id));
  if (missing.length) {
    throw new Error(`These catalog products are missing or unpublished: ${missing.join(", ")}. Fix the catalog before seeding.`);
  }
  const variantProducts = catalogueProducts.filter((product) => (product.colorVariants ?? []).length > 0);
  if (variantProducts.length) {
    throw new Error(
      `Products with colour variants need explicit eligible variants: ${variantProducts.map((product) => product.name).join(", ")}. Update PRODUCT_SEEDS.`,
    );
  }

  const seed = seedDoc(Number(process.env.DIWALI_SEED_YEAR) || indiaYear());
  const validated = festivalCollectionUpsertSchema.parse({
    ...seed,
    startsAt: seed.startsAt,
    endsAt: seed.endsAt,
  });

  console.log(JSON.stringify({
    status: apply ? "creating" : "dry-run",
    campaignId: CAMPAIGN_ID,
    startsAt: seed.startsAt,
    endsAt: seed.endsAt,
    deliveryDates: seed.advanceBooking.deliveryDates,
    productCount: seed.productIds.length,
    products: catalogueProducts.map((product) => product.name),
    note: apply ? undefined : "Re-run with --apply to create this campaign.",
  }, null, 2));

  if (!apply) return;

  const doc = await FestivalCollectionModel.create({
    ...validated,
    _id: CAMPAIGN_ID,
    slug: CAMPAIGN_SLUG,
  });
  console.log(`Created ${CAMPAIGN_ID} (${String(doc._id)}). Manage it at /admin/diwali.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
