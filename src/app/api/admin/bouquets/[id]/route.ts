import { NextRequest } from "next/server";
import { BouquetModel, CustomerModel, FlowerModel, FestivalCollectionModel, OrderModel } from "@/lib/db/models";
import { requireAdminRole, CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from "@/lib/admin/authorization";
import { ApiError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { serialize } from "@/lib/db/repositories";
import { bouquetPatchSchema, bouquetUpsertSchema, explicitPatch } from "@/lib/validation";
import type { Bouquet } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

async function findBouquet(id: string): Promise<Bouquet> {
  const doc = await BouquetModel.findOne({
    $or: [{ _id: id }, { _id: `bq-${id}` }, { slug: id }],
  }).lean();
  const bouquet = serialize<Bouquet>(doc);
  if (!bouquet) throw new ApiError("Bouquet not found.", 404);
  return bouquet;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    await requireAdminRole(request, CATALOG_READ_ROLES);
    return jsonOk(await findBouquet((await params).id));
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    await requireAdminRole(request, CATALOG_WRITE_ROLES);
    const existing = await findBouquet((await params).id);
    const raw = await readJson(request);
    const patch = explicitPatch(parseOrThrow(bouquetPatchSchema, raw), raw);
    const merged = parseOrThrow(bouquetUpsertSchema, { ...existing, ...patch });
    if (!merged.images.some((url) => /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url))) {
      throw new ApiError("Upload at least one image to Cloudinary before saving.");
    }
    if (patch.slug && await BouquetModel.exists({ slug: patch.slug, _id: { $ne: existing.id } })) {
      throw new ApiError("This bouquet slug is already in use.", 409);
    }
    if (merged.items.length) {
      const flowerIds = [...new Set(merged.items.map((item) => item.flowerId))];
      const existingFlowers = await FlowerModel.countDocuments({ _id: { $in: flowerIds } });
      if (existingFlowers !== flowerIds.length) {
        throw new ApiError("One or more selected flowers no longer exist. Refresh and try again.");
      }
    }
    const updated = await BouquetModel.findByIdAndUpdate(
      existing.id,
      { $set: merged },
      { new: true, runValidators: true },
    ).lean();
    return jsonOk({ ok: true, bouquet: serialize<Bouquet>(updated) });
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    await requireAdminRole(request, CATALOG_WRITE_ROLES);
    const bouquet = await findBouquet((await params).id);
    const [order, wishlist, collection] = await Promise.all([
      OrderModel.exists({ "items.productId": bouquet.id }),
      CustomerModel.exists({ wishlist: { $elemMatch: { productId: bouquet.id, productType: "bouquet" } } }),
      FestivalCollectionModel.exists({ productIds: bouquet.id }),
    ]);
    if (order || wishlist || collection) {
      throw new ApiError("This bouquet is referenced by an order, wishlist, or collection and cannot be deleted.", 409);
    }
    await BouquetModel.deleteOne({ _id: bouquet.id });
    return jsonOk({ ok: true });
  });
}
