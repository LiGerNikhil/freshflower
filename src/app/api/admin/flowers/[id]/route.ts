import { NextRequest } from "next/server";
import { FlowerModel, OrderModel, FestivalCollectionModel } from "@/lib/db/models";
import { jsonOk, safe, readJson, parseOrThrow, ApiError } from "@/lib/api/helpers";
import { productPatchSchema, explicitPatch } from "@/lib/validation";
import { requireAdminRole, CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from "@/lib/admin/authorization";
import { validateProductWrite } from "@/lib/admin/catalog-writes";
import { serialize } from "@/lib/db/repositories";
import type { Flower } from "@/lib/types";

async function findProduct(id: string) {
  const doc = await FlowerModel.findOne({ $or: [{ _id: id }, { _id: `fl-${id}` }, { slug: id }] }).lean();
  const flower = serialize<Flower>(doc);
  if (!flower) throw new ApiError("Product not found.", 404);
  return flower;
}
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => { await requireAdminRole(req, CATALOG_READ_ROLES); return jsonOk(await findProduct((await params).id)); });
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_WRITE_ROLES);
    const existing = await findProduct((await params).id);
    const raw = await readJson(req);
    const patch = await validateProductWrite(existing, explicitPatch(parseOrThrow(productPatchSchema, raw), raw));
    // Slug edits keep the natural ID stable so orders/collections retain references.
    const updated = await FlowerModel.findByIdAndUpdate(existing.id, { $set: patch }, { new: true, runValidators: true }).lean();
    return jsonOk({ ok: true, id: existing.id, product: serialize<Flower>(updated) });
  });
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_WRITE_ROLES);
    const existing = await findProduct((await params).id);
    if (await OrderModel.exists({ "items.productId": existing.id }) || await FestivalCollectionModel.exists({ productIds: existing.id })) {
      throw new ApiError("This product is referenced by orders or collections. Deactivate it instead.", 409);
    }
    await FlowerModel.deleteOne({ _id: existing.id });
    return jsonOk({ ok: true });
  });
}
