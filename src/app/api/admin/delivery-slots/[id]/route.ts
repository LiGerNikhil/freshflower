import { NextRequest } from "next/server";
import { DeliverySlotModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { slotConfigPatchSchema } from "@/lib/validation";

const crud = makeCrud(DeliverySlotModel);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(slotConfigPatchSchema, await readJson(req));
    return jsonOk(await crud.patch(id, parsed as Record<string, unknown>));
  });
}

export async function DELETE() {
  return jsonOk({ error: "Delivery slots are managed via their config." }, 405);
}