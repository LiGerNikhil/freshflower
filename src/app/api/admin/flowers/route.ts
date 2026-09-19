import { NextRequest } from "next/server";
import { FlowerModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { productUpsertSchema } from "@/lib/validation";

const crud = makeCrud(FlowerModel);

function idForSlug(slug: string): string {
  return slug.startsWith("fl-") ? slug : `fl-${slug}`;
}

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(productUpsertSchema, await readJson(req));
    // New products are keyed by their slug (same convention the admin UI uses).
    const id = idForSlug(parsed.slug);
    await crud.upsert(id, parsed as Record<string, unknown>);
    return jsonOk({ ok: true, id }, 201);
  });
}
