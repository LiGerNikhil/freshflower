import { NextRequest } from "next/server";
import { FestivalCollectionModel } from "@/lib/db/models";
import { getFestivalCollections, serialize } from "@/lib/db/repositories";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { festivalCollectionUpsertSchema } from "@/lib/validation";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { validateCollectionReferences } from "@/lib/admin/festival-writes";

export async function GET(req: NextRequest) {
  return safe(async () => { await requireAdminRole(req, CONTENT_WRITE_ROLES); return jsonOk(await getFestivalCollections()); });
}
export async function POST(req: NextRequest) {
  return safe(async () => {
    await requireAdminRole(req, CONTENT_WRITE_ROLES);
    const parsed = parseOrThrow(festivalCollectionUpsertSchema, await readJson(req));
    await validateCollectionReferences(parsed);
    const doc = await FestivalCollectionModel.create({ ...parsed, _id: `festival-${parsed.slug}` });
    return jsonOk({ ok: true, collection: serialize(doc.toObject()) }, 201);
  });
}
