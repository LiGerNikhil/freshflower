import { NextRequest } from "next/server";
import { CustomerModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe } from "@/lib/api/helpers";

const crud = makeCrud(CustomerModel);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.get(id));
  });
}