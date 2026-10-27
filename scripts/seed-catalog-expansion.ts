import "dotenv/config";
import path from "node:path";
import dns from "node:dns";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const { getServers, setServers } = dns;
if (getServers().length === 1 && ["127.0.0.1", "::1"].includes(getServers()[0])) {
  setServers(["1.1.1.1", "8.8.8.8"]);
}

import mongoose from "mongoose";
import { MONGODB_URI } from "@/lib/env";
import { CategoryModel, FlowerModel } from "@/lib/db/models";
import { catalogExpansionFlowers } from "@/lib/data/flowers";

async function main() {
  await mongoose.connect(MONGODB_URI(), {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    const categoryIds = [...new Set(catalogExpansionFlowers.map((flower) => flower.categoryId))];
    const existingCategoryIds = await CategoryModel.distinct("_id", {
      _id: { $in: categoryIds },
      active: { $ne: false },
    });
    const missingCategoryIds = categoryIds.filter((id) => !existingCategoryIds.includes(id));
    if (missingCategoryIds.length) {
      throw new Error(`Required active categories are missing: ${missingCategoryIds.join(", ")}`);
    }

    const now = new Date();
    const result = await FlowerModel.bulkWrite(
      catalogExpansionFlowers.map((flower) => {
        const { id, images, colorVariants, ...fields } = flower;
        const set = Object.fromEntries(
          Object.entries(fields).filter(([, value]) => value !== undefined),
        );
        set.colorVariants = colorVariants ?? [];
        set.updatedAt = now;

        const unset = Object.fromEntries(
          ["quantity", "stemCount", "compareAtPrice"]
            .filter((key) => fields[key as keyof typeof fields] === undefined)
            .map((key) => [key, 1]),
        );
        return {
          updateOne: {
            filter: { _id: id },
            update: {
              $set: set,
              $setOnInsert: { images },
              ...(Object.keys(unset).length ? { $unset: unset } : {}),
            },
            upsert: true,
          },
        };
      }),
      { ordered: true },
    );

    const productIds = catalogExpansionFlowers.map((flower) => flower.id);
    const savedProducts = await FlowerModel.find({ _id: { $in: productIds } })
      .select({ _id: 1, name: 1, price: 1, categoryId: 1, active: 1, images: 1 })
      .lean();
    const savedById = new Map(savedProducts.map((flower) => [String(flower._id), flower]));
    const invalidProducts = catalogExpansionFlowers.filter((expected) => {
      const saved = savedById.get(expected.id);
      return !saved
        || saved.name !== expected.name
        || saved.price !== expected.price
        || saved.categoryId !== expected.categoryId
        || saved.active !== true
        || !Array.isArray(saved.images)
        || saved.images.length === 0;
    });
    if (invalidProducts.length) {
      throw new Error(`Database verification failed for: ${invalidProducts.map((flower) => flower.name).join(", ")}`);
    }

    console.log(
      `Catalog expansion applied and verified: ${catalogExpansionFlowers.length} products (${result.upsertedCount} added, ${result.modifiedCount} updated). Existing product images were preserved.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Catalog expansion failed:", error);
  process.exitCode = 1;
});
