import { NextRequest } from "next/server";
import { FlowerModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { productPatchSchema } from "@/lib/validation";

const crud = makeCrud(FlowerModel);

function idForSlug(slug: string): string {
  return slug.startsWith("fl-") ? slug : `fl-${slug}`;
}

async function resolveFlowerId(input: string): Promise<string | null> {
  if (await crud.get(input)) return input;
  const prefixed = idForSlug(input);
  if (prefixed !== input && (await crud.get(prefixed))) return prefixed;
  const bySlug = await FlowerModel.findOne({ slug: input }).select({ _id: 1 }).lean<{ _id: string }>();
  return bySlug?._id ? String(bySlug._id) : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const resolvedId = await resolveFlowerId(id);
    if (!resolvedId) throw new Error("Not found");
    return jsonOk(await crud.get(resolvedId));
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(productPatchSchema, await readJson(req));
    const resolvedId = await resolveFlowerId(id);
    if (!resolvedId) throw new Error("Not found");
    const existing = await crud.get(resolvedId);
    if (!existing) throw new Error("Not found");
    if (parsed.slug && parsed.slug !== existing.slug) {
      // rekey: keep _id in sync with a slug change
      await crud.upsert(idForSlug(parsed.slug), parsed as Record<string, unknown>);
      await crud.remove(resolvedId);
      return jsonOk({ ok: true, id: idForSlug(parsed.slug) });
    }
    return jsonOk(await crud.patch(resolvedId, parsed as Record<string, unknown>));
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const resolvedId = await resolveFlowerId(id);
    if (!resolvedId) throw new Error("Not found");
    return jsonOk(await crud.remove(resolvedId));
  });
}
