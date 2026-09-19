import { NextRequest } from "next/server";
import { AdminCredentialModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { adminPasswords } from "@/lib/data/admin";
import { ADMIN_EMAIL, verifyAdminRequest } from "@/lib/admin/session";
import { hashPassword, verifyPassword } from "@/lib/admin/passwords";
import { jsonError, jsonOk } from "@/lib/api/helpers";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error("Database timeout")), ms);
    }),
  ]);
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) return jsonError("Unauthorized.", 401);

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: string;
    newPassword?: string;
  } | null;
  const currentPassword = body?.currentPassword ?? "";
  const newPassword = body?.newPassword ?? "";
  if (newPassword.length < 6) return jsonError("New password must be at least 6 characters.", 400);

  try {
    await withTimeout(dbConnect(), 5000);
  } catch {
    return jsonError("Password changes require the database connection. Please try again shortly.", 503);
  }
  const credential = await AdminCredentialModel.findById(ADMIN_EMAIL).lean<{ password?: string }>();
  const storedPassword = credential?.password ?? adminPasswords[ADMIN_EMAIL];
  if (!(await verifyPassword(currentPassword, storedPassword))) {
    return jsonError("Current password is incorrect.", 401);
  }

  await AdminCredentialModel.updateOne(
    { _id: ADMIN_EMAIL },
    { $set: { password: await hashPassword(newPassword) } },
    { upsert: true },
  ).lean();
  return jsonOk({ ok: true });
}
