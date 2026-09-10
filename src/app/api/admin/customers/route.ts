import { CustomerModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe } from "@/lib/api/helpers";

const crud = makeCrud(CustomerModel);

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}

export async function POST() {
  return jsonOk({ error: "Customers are created through checkout." }, 405);
}