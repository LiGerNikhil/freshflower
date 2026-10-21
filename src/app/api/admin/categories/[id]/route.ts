import { NextRequest } from "next/server";
import { CategoryModel, FlowerModel, FestivalCollectionModel } from "@/lib/db/models";
import { jsonOk, safe, readJson, parseOrThrow, ApiError } from "@/lib/api/helpers";
import { categoryPatchSchema, explicitPatch } from "@/lib/validation";
import { serialize } from "@/lib/db/repositories";
import { requireAdminRole, CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from "@/lib/admin/authorization";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_READ_ROLES);
    const doc = await CategoryModel.findById((await params).id).lean();
    if (!doc) throw new ApiError("Category not found.", 404);
    return jsonOk(serialize(doc));
  });
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_WRITE_ROLES);
    const { id } = await params;
    const raw = await readJson(req);
    const patch = explicitPatch(parseOrThrow(categoryPatchSchema.partial(), raw), raw);
    const doc = await CategoryModel.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true }).lean();
    if (!doc) throw new ApiError("Category not found.", 404);
    return jsonOk({ ok: true, category: serialize(doc) });
  });
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_WRITE_ROLES);
    const { id } = await params;
    if (await FlowerModel.exists({ categoryId: id }) || await FestivalCollectionModel.exists({ categoryIds: id })) {
      throw new ApiError("This category contains products or is referenced by a collection. Deactivate it instead.", 409);
    }
    const result = await CategoryModel.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError("Category not found.", 404);
    return jsonOk({ ok: true });
  });
}
