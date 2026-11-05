import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel, PasswordResetTokenModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, readJson, safe } from "@/lib/api/helpers";
import { sendPasswordResetEmail } from "@/lib/auth/customer-email";
import { ADMIN_EMAIL } from "@/lib/admin/session";
import { canonical } from "@/lib/seo";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
  accountType: z.enum(["customer", "admin"]),
});

const RESEND_COOLDOWN_MS = 60 * 1000;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export async function POST(request: NextRequest) {
  return safe(async () => {
    const parsed = requestSchema.safeParse(await readJson(request));
    if (!parsed.success) return jsonOk({ ok: true });

    const email = parsed.data.email.toLowerCase();
    const accountType = parsed.data.accountType;
    await dbConnect();

    let name = "Customer";
    if (accountType === "customer") {
      const customer = await CustomerModel.findOne({ email })
        .select({ name: 1, email: 1 })
        .lean<{ name?: string; email: string }>();
      if (!customer) return jsonOk({ ok: true });
      name = customer.name || "Customer";
    } else if (email !== ADMIN_EMAIL.toLowerCase()) {
      return jsonOk({ ok: true });
    } else {
      name = "Administrator";
    }

    const now = new Date();
    const active = await PasswordResetTokenModel.findOne({
      accountType,
      email,
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .select({ createdAt: 1, expiresAt: 1 })
      .lean<{ createdAt?: Date; expiresAt?: Date }>();
    if (
      active?.expiresAt &&
      active.expiresAt.getTime() > now.getTime() &&
      active.createdAt &&
      now.getTime() - active.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return jsonOk({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);
    await PasswordResetTokenModel.findOneAndUpdate(
      { _id: `password-reset-${tokenHash}` },
      {
        $set: {
          _id: `password-reset-${tokenHash}`,
          accountType,
          email,
          tokenHash,
          expiresAt,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    const resetUrl = canonical(
      `/reset-password?type=${accountType}&token=${encodeURIComponent(token)}`,
    );
    try {
      await sendPasswordResetEmail({ email, name, accountType, resetUrl });
    } catch (error) {
      console.error("forgot-password: failed to deliver reset email", accountType, email, error);
      await PasswordResetTokenModel.deleteOne({
        _id: `password-reset-${tokenHash}`,
      }).lean();
    }

    return jsonOk({ ok: true });
  });
}
