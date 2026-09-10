import { NextRequest } from "next/server";
import { CouponModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { couponSchema } from "@/lib/validation";

const crud = makeCrud(CouponModel);

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(couponSchema, await readJson(req));
    await crud.upsert(parsed.id, parsed as Record<string, unknown>);
    return jsonOk({ ok: true, id: parsed.id }, 201);
  });
}