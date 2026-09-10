import { NextRequest } from "next/server";
import { FlowerModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { productPatchSchema } from "@/lib/validation";

const crud = makeCrud(FlowerModel);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.get(id));
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(productPatchSchema, await readJson(req));
    if (parsed.slug && parsed.slug !== id) {
      // rekey: keep _id in sync with a slug change
      await crud.upsert(parsed.slug, parsed as Record<string, unknown>);
      await crud.remove(id);
      return jsonOk({ ok: true, id: parsed.slug });
    }
    return jsonOk(await crud.patch(id, parsed as Record<string, unknown>));
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.remove(id));
  });
}