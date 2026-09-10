import { NextRequest } from "next/server";
import { AdminCredentialModel, AdminUserModel } from "@/lib/db/models";
import { serializeList } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { adminUserSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

async function setCredential(email: string, password: string): Promise<void> {
  await dbConnect();
  await AdminCredentialModel.updateOne(
    { _id: email.toLowerCase() },
    { $set: { email: email.toLowerCase(), password } },
    { upsert: true },
  ).lean();
}

export async function GET() {
  return safe(async () => {
    await dbConnect();
    const docs = await AdminUserModel.find().sort({ _id: 1 }).lean();
    return jsonOk(serializeList(docs));
  });
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = parseOrThrow(adminUserSchema, await readJson(req));
    const id = `admin-${slugify(parsed.name.replace(/\s+/g, "-").toLowerCase())}`;
    const { password, ...user } = parsed;
    await dbConnect();
    await AdminUserModel.updateOne({ _id: id }, { $set: user }, { upsert: true }).lean();
    if (password) await setCredential(parsed.email, password);
    return jsonOk({ ok: true, id }, 201);
  });
}

export async function DELETE() {
  return jsonOk({ error: "Delete users via /api/admin/users/[id]." }, 405);
}