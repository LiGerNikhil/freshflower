import { NextRequest } from "next/server";
import { FestivalCollectionModel, HomepageConfigModel } from "@/lib/db/models";
import { serialize } from "@/lib/db/repositories";
import { jsonOk, safe, readJson, parseOrThrow, ApiError } from "@/lib/api/helpers";
import { festivalCollectionPatchSchema, festivalCollectionUpsertSchema } from "@/lib/validation";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { validateCollectionReferences } from "@/lib/admin/festival-writes";
import type { FestivalCollection } from "@/lib/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CONTENT_WRITE_ROLES);
    const doc = await FestivalCollectionModel.findById((await params).id).lean();
    if (!doc) throw new ApiError("Collection not found.", 404);
    return jsonOk(serialize<FestivalCollection>(doc));
  });
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CONTENT_WRITE_ROLES);
    const { id } = await params;
    const existing = serialize<FestivalCollection>(await FestivalCollectionModel.findById(id).lean());
    if (!existing) throw new ApiError("Collection not found.", 404);
    const raw = await readJson(req);
    const patch = parseOrThrow(festivalCollectionPatchSchema, raw);
    const merged = parseOrThrow(festivalCollectionUpsertSchema, { ...existing, ...patch });
    await validateCollectionReferences(merged);
    const unset: Record<string, 1> = {};
    for (const key of ["startsAt", "endsAt"] as const) if (raw[key] === null) unset[key] = 1;
    const set = Object.fromEntries(Object.entries(merged).filter(([key, value]) => value !== undefined && !unset[key]));
    const doc = await FestivalCollectionModel.findByIdAndUpdate(id, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { new: true, runValidators: true }).lean();
    return jsonOk({ ok: true, collection: serialize<FestivalCollection>(doc) });
  });
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CONTENT_WRITE_ROLES);
    const { id } = await params;
    if (await HomepageConfigModel.exists({ festivalCollectionIds: id })) {
      throw new ApiError("Remove this collection from homepage selections before deleting it, or deactivate it.", 409);
    }
    const result = await FestivalCollectionModel.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError("Collection not found.", 404);
    return jsonOk({ ok: true });
  });
}
