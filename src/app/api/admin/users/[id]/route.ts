import { NextRequest } from "next/server";
import { AdminCredentialModel, AdminUserModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { adminUserSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/admin/passwords";
import { ADMIN_EMAIL } from "@/lib/admin/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(adminUserSchema.partial(), await readJson(req));
    const { password, ...user } = parsed;
    if (id !== "admin-6" && user.email?.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Not found");
    }
    await dbConnect();
    await AdminUserModel.updateOne(
      { _id: "admin-6" },
      { $set: { name: "Ayush Parmar", email: ADMIN_EMAIL, role: "super_admin", active: true } },
      { upsert: true },
    ).lean();
    if (password) {
      await AdminCredentialModel.updateOne(
        { _id: ADMIN_EMAIL },
        { $set: { password: await hashPassword(password) } },
        { upsert: true },
      ).lean();
    }
    return jsonOk({ ok: true });
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await params;
  return jsonOk({ error: "The only admin account cannot be deleted." }, 405);
}
