import { NextRequest } from "next/server";
import { AdminCredentialModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk } from "@/lib/api/helpers";
import { hashPassword } from "@/lib/admin/passwords";
import { ADMIN_EMAIL } from "@/lib/admin/session";
import { adminUsers } from "@/lib/data/admin";

async function setCredential(email: string, password: string): Promise<void> {
  await dbConnect();
  await AdminCredentialModel.updateOne(
    { _id: email.toLowerCase() },
    { $set: { password: await hashPassword(password) } },
    { upsert: true },
  ).lean();
}

export async function GET() {
  return jsonOk(adminUsers);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (body?.email?.toLowerCase() === ADMIN_EMAIL && body.password) {
    await setCredential(ADMIN_EMAIL, body.password);
    return jsonOk({ ok: true });
  }
  return jsonOk({ error: "Only the configured admin account is allowed." }, 405);
}

export async function DELETE() {
  return jsonOk({ error: "Delete users via /api/admin/users/[id]." }, 405);
}
