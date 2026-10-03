import dotenv from "dotenv";
import { dbConnect } from "../src/lib/db/connect";
import { FlowerModel } from "../src/lib/db/models";
import { flowers } from "../src/lib/data/flowers";

dotenv.config({ path: ".env.local" });

async function main() {
  await dbConnect();

  const variantBySlug = new Map(
    flowers
      .filter((flower) => flower.colorVariants?.length)
      .map((flower) => [flower.slug, flower.colorVariants ?? []]),
  );

  const targetSlugs = [...variantBySlug.keys()];
  const docs = (await FlowerModel.find({ slug: { $in: targetSlugs } }).lean()) as Array<{
    _id: string;
    slug: string;
    colorVariants?: unknown[];
  }>;

  let updated = 0;
  for (const doc of docs) {
    const variants = variantBySlug.get(doc.slug) ?? [];
    if (!variants.length) continue;
    await FlowerModel.updateOne(
      { _id: doc._id },
      {
        $set: {
          colorVariants: variants,
          colors: variants.map((variant) => variant.color),
        },
      },
    ).lean();
    updated += 1;
    console.log(`backfilled ${doc.slug} -> ${variants.length} colour variants`);
  }

  const inserted = [];
  for (const slug of targetSlugs) {
    const exists = docs.some((doc) => doc.slug === slug);
    if (!exists) inserted.push(slug);
  }
  console.log(`updated ${updated} products; ${inserted.length ? `not found in DB: ${inserted.join(", ")}` : "all multi-colour products present"}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});