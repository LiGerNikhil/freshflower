import { NextRequest } from "next/server";
import { DeliveryAreaModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { deliveryAreaPatchSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const crud = makeCrud(DeliveryAreaModel);

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(deliveryAreaPatchSchema, await readJson(req));
    const id = `area-${slugify(parsed.name)}`;
    await crud.upsert(id, { ...parsed, id });
    return jsonOk({ ok: true, id }, 201);
  });
}

export async function PATCH() {
  return jsonOk({ error: "Patch individual areas via /api/admin/delivery-areas/[id]." }, 405);
}

export async function DELETE() {
  return jsonOk({ error: "Delete individual areas via /api/admin/delivery-areas/[id]." }, 405);
}