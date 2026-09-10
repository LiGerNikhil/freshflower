import { NextRequest } from "next/server";
import { ReviewModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { reviewStatusSchema } from "@/lib/validation";

const crud = makeCrud(ReviewModel);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(reviewStatusSchema, await readJson(req));
    return jsonOk(await crud.patch(id, parsed as Record<string, unknown>));
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.remove(id));
  });
}