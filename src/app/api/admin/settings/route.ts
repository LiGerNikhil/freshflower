import { NextRequest } from "next/server";
import { BusinessSettingsModel } from "@/lib/db/models";
import { getBusinessSettings } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { settingsUpsertSchema } from "@/lib/validation";

const SETTINGS_ID = "settings";

export async function GET() {
  return safe(async () => jsonOk(await getBusinessSettings()));
}

export async function PUT(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(settingsUpsertSchema, await readJson(req));
    await dbConnect();
    await BusinessSettingsModel.updateOne(
      { _id: SETTINGS_ID },
      { $set: parsed },
      { upsert: true },
    ).lean();
    return jsonOk({ ok: true });
  });
}