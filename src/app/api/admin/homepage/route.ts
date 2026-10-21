import { NextRequest } from "next/server";
import { HomepageConfigModel, FlowerModel, CategoryModel, FestivalCollectionModel } from "@/lib/db/models";
import { getHomepageConfig } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow, ApiError } from "@/lib/api/helpers";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { homepageUpsertSchema } from "@/lib/validation";

const CONFIG_ID = "homepage";

export async function GET() {
  return safe(async () => jsonOk(await getHomepageConfig()));
}

export async function PUT(req: NextRequest) {
  return safe(async () => {
    await requireAdminRole(req, CONTENT_WRITE_ROLES);
    const parsed = parseOrThrow(homepageUpsertSchema, await readJson(req));
    await dbConnect();
    for (const [model, ids] of [[FlowerModel, parsed.featuredFlowerIds], [CategoryModel, parsed.categoryIds ?? []], [FestivalCollectionModel, parsed.festivalCollectionIds ?? []]] as const) {
      if (await model.countDocuments({ _id: { $in: ids } }) !== new Set(ids).size) {
        throw new ApiError("A selected homepage product, category or collection no longer exists.");
      }
    }
    await HomepageConfigModel.updateOne(
      { _id: CONFIG_ID },
      { $set: parsed },
      { upsert: true },
    ).lean();
    return jsonOk({ ok: true, homepage: await getHomepageConfig() });
  });
}
