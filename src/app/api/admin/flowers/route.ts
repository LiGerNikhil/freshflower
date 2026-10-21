import { NextRequest } from "next/server";
import { FlowerModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { productUpsertSchema } from "@/lib/validation";
import { requireAdminRole, CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from "@/lib/admin/authorization";
import { validateProductWrite } from "@/lib/admin/catalog-writes";
import { serialize } from "@/lib/db/repositories";

const crud = makeCrud(FlowerModel);
export async function GET(req: NextRequest) {
  return safe(async () => { await requireAdminRole(req, CATALOG_READ_ROLES); return jsonOk(await crud.list()); });
}
export async function POST(req: NextRequest) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_WRITE_ROLES);
    const raw = await readJson(req);
    const parsed = parseOrThrow(productUpsertSchema, { ...raw, active: raw.active ?? false });
    const patch = await validateProductWrite(null, parsed);
    const id = `fl-${parsed.slug}`;
    const doc = await FlowerModel.create({ ...patch, _id: id });
    return jsonOk({ ok: true, id, product: serialize(doc.toObject()) }, 201);
  });
}
