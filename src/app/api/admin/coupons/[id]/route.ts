import { NextRequest } from "next/server";
import { CouponModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { couponPatchSchema } from "@/lib/validation";

const crud = makeCrud(CouponModel);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(couponPatchSchema, await readJson(req));
    const { id: _ignored, ...patch } = parsed;
    return jsonOk(await crud.patch(id, patch as Record<string, unknown>));
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.remove(id));
  });
}