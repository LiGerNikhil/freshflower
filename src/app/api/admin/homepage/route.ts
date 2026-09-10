import { NextRequest } from "next/server";
import { HomepageConfigModel } from "@/lib/db/models";
import { getHomepageConfig } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { homepageUpsertSchema } from "@/lib/validation";

const CONFIG_ID = "homepage";

export async function GET() {
  return safe(async () => jsonOk(await getHomepageConfig()));
}

export async function PUT(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(homepageUpsertSchema, await readJson(req));
    await dbConnect();
    await HomepageConfigModel.updateOne(
      { _id: CONFIG_ID },
      { $set: parsed },
      { upsert: true },
    ).lean();
    return jsonOk({ ok: true });
  });
}