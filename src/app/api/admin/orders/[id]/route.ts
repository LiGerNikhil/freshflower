import { NextRequest } from "next/server";
import { OrderModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { orderStatusPatchSchema } from "@/lib/validation";

const crud = makeCrud(OrderModel);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.get(id));
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(orderStatusPatchSchema, await readJson(req));
    return jsonOk(await crud.patch(id, parsed as Record<string, unknown>));
  });
}