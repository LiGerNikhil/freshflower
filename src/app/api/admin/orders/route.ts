import { NextRequest } from "next/server";
import { OrderModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe } from "@/lib/api/helpers";

const crud = makeCrud(OrderModel);

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}

export async function POST() {
  // Orders are created only through the public /api/checkout flow.
  return jsonOk({ error: "Use /api/checkout to create orders." }, 405);
}

export async function PATCH(_req: NextRequest) {
  return jsonOk({ error: "Patch individual orders via /api/admin/orders/[id]." }, 405);
}