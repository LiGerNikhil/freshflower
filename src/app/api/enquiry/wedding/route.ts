import { NextRequest } from "next/server";
import crypto from "crypto";
import { WeddingEnquiryModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { weddingEnquirySchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(weddingEnquirySchema, await readJson(req));
    await dbConnect();
    const id = `wde-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
    await WeddingEnquiryModel.create({
      _id: id,
      ...parsed,
      eventDate: new Date(parsed.eventDate || Date.now()),
      createdAt: new Date(),
      status: "new",
    });
    return jsonOk({ ok: true, id }, 201);
  });
}