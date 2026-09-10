import { NextRequest } from "next/server";
import { CategoryModel } from "@/lib/db/models";
import { getCategories } from "@/lib/db/repositories";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { categoryPatchSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const crud = makeCrud(CategoryModel);

export async function GET() {
  return safe(async () => jsonOk(await getCategories()));
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(categoryPatchSchema, await readJson(req));
    const id = `cat-${slugify(parsed.name)}`;
    await crud.upsert(id, { ...parsed, id });
    return jsonOk({ ok: true, id }, 201);
  });
}