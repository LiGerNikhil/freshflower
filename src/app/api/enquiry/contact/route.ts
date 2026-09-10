import { NextRequest } from "next/server";
import crypto from "crypto";
import { ContactEnquiryModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { contactEnquirySchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(contactEnquirySchema, await readJson(req));
    await dbConnect();
    const id = `cnt-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
    await ContactEnquiryModel.create({
      _id: id,
      ...parsed,
      createdAt: new Date(),
      status: "new",
    });
    return jsonOk({ ok: true, id }, 201);
  });
}