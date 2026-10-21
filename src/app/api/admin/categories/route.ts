import { NextRequest } from "next/server";
import { CategoryModel } from "@/lib/db/models";
import { getCategories, serialize } from "@/lib/db/repositories";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { categoryPatchSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { requireAdminRole, CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from "@/lib/admin/authorization";

export async function GET(req: NextRequest) {
  return safe(async () => { await requireAdminRole(req, CATALOG_READ_ROLES); return jsonOk(await getCategories(true)); });
}
export async function POST(req: NextRequest) {
  return safe(async () => {
    await requireAdminRole(req, CATALOG_WRITE_ROLES);
    const raw = await readJson(req);
    const parsed = parseOrThrow(categoryPatchSchema, { ...raw, slug: raw.slug || slugify(String(raw.name ?? "")) });
    const id = `cat-${parsed.slug}`;
    const doc = await CategoryModel.create({ ...parsed, _id: id, active: parsed.active ?? false, heroImage: parsed.heroImage ?? "gradient-ivory" });
    return jsonOk({ ok: true, id, category: serialize(doc.toObject()) }, 201);
  });
}
