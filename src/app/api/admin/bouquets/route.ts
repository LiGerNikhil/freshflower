import { NextRequest } from "next/server";
import { BouquetModel, FlowerModel } from "@/lib/db/models";
import { requireAdminRole, CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from "@/lib/admin/authorization";
import { ApiError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { serialize, serializeList } from "@/lib/db/repositories";
import { bouquetUpsertSchema } from "@/lib/validation";
import type { Bouquet } from "@/lib/types";

const isCloudinaryImage = (url: string) =>
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url);

export async function GET(request: NextRequest) {
  return safe(async () => {
    await requireAdminRole(request, CATALOG_READ_ROLES);
    const bouquets = await BouquetModel.find().sort({ name: 1, _id: 1 }).lean();
    return jsonOk(serializeList<Bouquet>(bouquets));
  });
}

export async function POST(request: NextRequest) {
  return safe(async () => {
    await requireAdminRole(request, CATALOG_WRITE_ROLES);
    const bouquet = parseOrThrow(bouquetUpsertSchema, await readJson(request));
    if (!bouquet.images.some(isCloudinaryImage)) {
      throw new ApiError("Upload at least one image to Cloudinary before creating a bouquet.");
    }
    if (await BouquetModel.exists({ slug: bouquet.slug })) {
      throw new ApiError("This bouquet slug is already in use.", 409);
    }
    if (bouquet.items.length) {
      const flowerIds = [...new Set(bouquet.items.map((item) => item.flowerId))];
      const existingFlowers = await FlowerModel.countDocuments({ _id: { $in: flowerIds } });
      if (existingFlowers !== flowerIds.length) {
        throw new ApiError("One or more selected flowers no longer exist. Refresh and try again.");
      }
    }
    const id = `bq-${bouquet.slug}`;
    const doc = await BouquetModel.create({ ...bouquet, _id: id });
    return jsonOk({ ok: true, bouquet: serialize<Bouquet>(doc.toObject()) }, 201);
  });
}
