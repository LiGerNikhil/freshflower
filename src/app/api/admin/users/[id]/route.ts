import { NextRequest } from "next/server";
import { AdminCredentialModel, AdminUserModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { adminUserSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(adminUserSchema.partial(), await readJson(req));
    const { password, ...user } = parsed;
    await dbConnect();
    const updated = await AdminUserModel.findByIdAndUpdate(id, { $set: user }, { new: true }).lean();
    if (!updated) throw new Error("Not found");
    if (password && user.email) {
      await AdminCredentialModel.updateOne(
        { _id: String(user.email).toLowerCase() },
        { $set: { email: String(user.email).toLowerCase(), password } },
        { upsert: true },
      ).lean();
    }
    return jsonOk({ ok: true });
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const removed = await AdminUserModel.findByIdAndDelete(id).lean();
    if (!removed) throw new Error("Not found");
    return jsonOk({ ok: true });
  });
}