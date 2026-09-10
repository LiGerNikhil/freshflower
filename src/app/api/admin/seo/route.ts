import { NextRequest } from "next/server";
import { SeoRouteOverrideModel } from "@/lib/db/models";
import { getSeoOverrides } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { seoOverrideSchema } from "@/lib/validation";

export async function GET() {
  return safe(async () => jsonOk(await getSeoOverrides()));
}

export async function PUT(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(seoOverrideSchema, await readJson(req));
    await dbConnect();
    await SeoRouteOverrideModel.updateOne(
      { _id: parsed.path },
      { $set: parsed },
      { upsert: true },
    ).lean();
    return jsonOk({ ok: true });
  });
}

export async function DELETE(_req: NextRequest) {
  return jsonOk({ error: "Delete a single override via /api/admin/seo/[path]." }, 405);
}