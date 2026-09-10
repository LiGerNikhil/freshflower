import { ReviewModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe } from "@/lib/api/helpers";

const crud = makeCrud(ReviewModel);

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}