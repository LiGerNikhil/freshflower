import { NextRequest, NextResponse } from "next/server";
import { AdminCredentialModel, AdminUserModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { adminPasswords, adminUsers } from "@/lib/data/admin";
import {
  ADMIN_EMAIL,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { verifyPassword } from "@/lib/admin/passwords";
import { jsonError } from "@/lib/api/helpers";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error("Database timeout")), ms);
    }),
  ]);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";
  if (email !== ADMIN_EMAIL || !password) {
    return jsonError("Invalid email or password.", 401);
  }

  if (!process.env.ADMIN_SESSION_SECRET && (await verifyPassword(password, adminPasswords[ADMIN_EMAIL]))) {
    const response = NextResponse.json({ ok: true, user: adminUsers[0] });
    response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
    return response;
  }

  let storedPassword = adminPasswords[ADMIN_EMAIL];
  let inactive = false;
  try {
    await withTimeout(
      (async () => {
        await dbConnect();
        const credential = await AdminCredentialModel.findById(ADMIN_EMAIL).lean<{ password?: string }>();
        storedPassword = credential?.password ?? storedPassword;
        const dbUser = await AdminUserModel.findOne({ email: ADMIN_EMAIL }).lean<{ active?: boolean }>();
        inactive = dbUser?.active === false;
      })(),
      2500,
    );
  } catch {
    // Static preview fallback: use the seed credential.
  }
  if (inactive) return jsonError("Invalid email or password.", 401);

  if (!(await verifyPassword(password, storedPassword))) {
    return jsonError("Invalid email or password.", 401);
  }

  const response = NextResponse.json({ ok: true, user: adminUsers[0] });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return response;
}
