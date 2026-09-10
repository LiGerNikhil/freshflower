import { NextRequest } from "next/server";
import crypto from "crypto";
import { WholesaleEnquiryModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { wholesaleEnquirySchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(wholesaleEnquirySchema, await readJson(req));
    await dbConnect();
    const id = `wse-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
    await WholesaleEnquiryModel.create({
      _id: id,
      ...parsed,
      createdAt: new Date(),
      status: "new",
    });
    return jsonOk({ ok: true, id }, 201);
  });
}