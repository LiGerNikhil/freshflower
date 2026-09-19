/**
 * Seed the shared FreshFlower.zone MongoDB database with the full preview
 * dataset. Idempotent — every write upserts by the document's natural `_id`
 * (the same string ids the TS types use), so re-running never duplicates.
 *
 * Run: npm run seed
 */
import "dotenv/config";
import path from "node:path";
import dns from "node:dns";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Same dev-machine DNS workaround as src/lib/db/connect.ts.
const { getServers, setServers } = dns;
if (getServers().length === 1 && ["127.0.0.1", "::1"].includes(getServers()[0])) {
  setServers(["1.1.1.1", "8.8.8.8"]);
}

import mongoose from "mongoose";
import { MONGODB_URI } from "@/lib/env";
import {
  AdminCredentialModel,
  AdminUserModel,
  BlogPostModel,
  BouquetModel,
  BusinessSettingsModel,
  CategoryModel,
  ContactEnquiryModel,
  CouponModel,
  CustomerModel,
  DeliveryAreaModel,
  DeliverySlotModel,
  FlowerModel,
  HomepageConfigModel,
  OccasionModel,
  OrderModel,
  ReviewModel,
  WeddingEnquiryModel,
  WholesaleEnquiryModel,
} from "@/lib/db/models";
import {
  DEFAULT_HOMEPAGE,
  DEFAULT_SETTINGS,
  adminPasswords,
  adminUsers,
  blogs,
  bouquets,
  categories,
  contactEnquiries,
  coupons,
  customers,
  deliveryAreas,
  deliverySlots,
  flowers,
  occasions,
  orders,
  reviews,
  weddingEnquiries,
  wholesaleEnquiries,
} from "@/lib/data";
import { OrderStatus, type AdminUser, type BlogPost, type Coupon, type Customer, type Order, type Review, type WeddingEnquiry, type WholesaleEnquiry } from "@/lib/types";

type Rec = Record<string, unknown>;

/** Strip the type-level `id` and emit a document keyed on the natural `_id`. */
function toDoc<T extends { id: string }>(entity: T): Rec {
  const { id, ...rest } = entity as T & Rec;
  return { ...rest, _id: id };
}

function toDate(value: unknown): Date | undefined {
  if (value == null) return undefined;
  return new Date(value as string);
}

const byDate = <T extends { id: string }>(entity: T, fields: (keyof T)[]): Rec => {
  const doc = toDoc(entity);
  for (const field of fields) {
    const value = doc[field as string];
    if (value != null) doc[field as string] = toDate(value);
  }
  return doc;
};

async function upsertAll(model: mongoose.Model<any>, docs: Rec[]) {
  if (docs.length === 0) return 0;
  const result = await model.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true,
      },
    })),
  );
  return result.upsertedCount + result.modifiedCount;
}

async function main() {
  const uri = MONGODB_URI();
  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  console.log("Connected. Starting seed…\n");

  await upsertAll(
    CategoryModel,
    categories.map((category, index) => ({
      ...toDoc(category),
      sortOrder: index,
    })),
  );
  await upsertAll(OccasionModel, occasions.map(toDoc));
  await FlowerModel.deleteMany({ _id: { $nin: flowers.map((flower) => flower.id) } });
  await upsertAll(FlowerModel, flowers.map(toDoc));
  await upsertAll(BouquetModel, bouquets.map(toDoc));
  await upsertAll(
    OrderModel,
    orders.map((o: Order) => byDate(o, ["deliveryDate", "createdAt", "updatedAt"])),
  );
  await upsertAll(DeliverySlotModel, deliverySlots.map(toDoc));
  await upsertAll(DeliveryAreaModel, deliveryAreas.map(toDoc));
  await upsertAll(
    CustomerModel,
    customers.map((c: Customer) => byDate(c, ["createdAt"])),
  );
  await upsertAll(
    ReviewModel,
    reviews.map((r: Review) => byDate(r, ["createdAt"])),
  );
  await upsertAll(
    BlogPostModel,
    blogs.map((b: BlogPost) => byDate(b, ["publishedAt"])),
  );
  await upsertAll(
    CouponModel,
    coupons.map((c: Coupon) => byDate(c, ["validFrom", "validUntil"])),
  );
  await upsertAll(
    WholesaleEnquiryModel,
    wholesaleEnquiries.map((e: WholesaleEnquiry) => byDate(e, ["createdAt"])),
  );
  await upsertAll(
    WeddingEnquiryModel,
    weddingEnquiries.map((e: WeddingEnquiry) => byDate(e, ["createdAt", "eventDate"])),
  );
  await upsertAll(
    ContactEnquiryModel,
    contactEnquiries.map((e: any) => byDate(e, ["createdAt"])),
  );
  await upsertAll(
    AdminUserModel,
    adminUsers.map((u: AdminUser) => byDate(u, ["createdAt"])),
  );
  await upsertAll(
    AdminCredentialModel,
    Object.entries(adminPasswords).map(([email, password]) => ({
      _id: email.toLowerCase(),
      password,
    })),
  );

  // Phase 16 single-document configs.
  await HomepageConfigModel.updateOne(
    { _id: "homepage" },
    { $set: toDoc(DEFAULT_HOMEPAGE) },
    { upsert: true },
  );
  await BusinessSettingsModel.updateOne(
    { _id: "settings" },
    { $set: toDoc(DEFAULT_SETTINGS) },
    { upsert: true },
  );

  // Ensure indexes (unique on slug / orderNumber / code / email …).
  await Promise.all([
    FlowerModel.createIndexes(),
    CategoryModel.createIndexes(),
    OccasionModel.createIndexes(),
    BouquetModel.createIndexes(),
    OrderModel.createIndexes(),
    CustomerModel.createIndexes(),
    BlogPostModel.createIndexes(),
    CouponModel.createIndexes(),
    AdminUserModel.createIndexes(),
  ]);

  console.log("Seeded collections (bulk upsert by _id). Final document counts:");
  const countCheck = await Promise.all(
    [
      [CategoryModel, categories.length],
      [OccasionModel, occasions.length],
      [FlowerModel, flowers.length],
      [BouquetModel, bouquets.length],
      [OrderModel, orders.length],
      [DeliverySlotModel, deliverySlots.length],
      [DeliveryAreaModel, deliveryAreas.length],
      [CustomerModel, customers.length],
      [ReviewModel, reviews.length],
      [BlogPostModel, blogs.length],
      [CouponModel, coupons.length],
      [WholesaleEnquiryModel, wholesaleEnquiries.length],
      [WeddingEnquiryModel, weddingEnquiries.length],
      [ContactEnquiryModel, contactEnquiries.length],
      [AdminUserModel, adminUsers.length],
    ].map(async ([model, expected]) => [
      model.collection.name,
      await model.countDocuments(),
      `(expected ${expected})`,
    ]),
  );
  for (const [name, count, expected] of countCheck) {
    console.log(`  ${String(name).padEnd(20)} ${count} ${expected}`);
  }

  const [flowerCount, orderCount] = await Promise.all([
    FlowerModel.countDocuments(),
    OrderModel.countDocuments(),
  ]);
  console.log(`\nTotals — flowers: ${flowerCount}, orders: ${orderCount}. Seed complete.`);

  await mongoose.disconnect();
  console.log("Disconnected.");
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
