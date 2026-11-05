import { createHash, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  AdminCredentialModel,
  CustomerModel,
  PasswordResetTokenModel,
} from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import {
  hashCustomerPassword,
  validatePassword,
} from "@/lib/auth/customer-passwords";
import { sendPasswordChangedEmail } from "@/lib/auth/customer-email";
import { ADMIN_EMAIL } from "@/lib/admin/session";
import { hashPassword } from "@/lib/admin/passwords";

const resetSchema = z.object({
  accountType: z.enum(["customer", "admin"]),
  token: z.string().regex(/^[a-f0-9]{64}$/i, "This reset link is invalid or expired."),
  password: z.string().min(8).max(128),
});

function tokensMatch(left: string, right: string) {
  const leftBytes = Buffer.from(left, "hex");
  const rightBytes = Buffer.from(right, "hex");
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export async function POST(request: NextRequest) {
  return safe(async () => {
    const parsed = resetSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid reset request.", 400);
    }
    const { accountType, token, password } = parsed.data;
    if (accountType === "customer") {
      const error = validatePassword(password);
      if (error) return jsonError(error, 400);
    }

    await dbConnect();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const tokenRecord = await PasswordResetTokenModel.findById(
      `password-reset-${tokenHash}`,
    )
      .select({ accountType: 1, email: 1, tokenHash: 1, expiresAt: 1 })
      .lean<{
        accountType: "customer" | "admin";
        email: string;
        tokenHash: string;
        expiresAt: Date;
      }>();

    if (
      !tokenRecord ||
      tokenRecord.accountType !== accountType ||
      (accountType === "admin" &&
        tokenRecord.email !== ADMIN_EMAIL.toLowerCase()) ||
      tokenRecord.expiresAt.getTime() <= Date.now() ||
      !tokensMatch(tokenHash, tokenRecord.tokenHash)
    ) {
      return jsonError("This reset link is invalid or expired. Request a new one.", 400);
    }

    const consumed = await PasswordResetTokenModel.findOneAndDelete({
      _id: `password-reset-${tokenHash}`,
      tokenHash: tokenRecord.tokenHash,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!consumed) {
      return jsonError("This reset link has already been used or expired. Request a new one.", 400);
    }

    const passwordHash =
      accountType === "customer"
        ? await hashCustomerPassword(password)
        : await hashPassword(password);
    if (accountType === "customer") {
      const result = await CustomerModel.updateOne(
        { email: tokenRecord.email },
        { $set: { passwordHash, updatedAt: new Date() } },
      ).lean();
      if (!result.matchedCount) {
        return jsonError("This reset link is invalid or expired. Request a new one.", 400);
      }
    } else {
      await AdminCredentialModel.updateOne(
        { _id: ADMIN_EMAIL.toLowerCase() },
        { $set: { password: passwordHash } },
        { upsert: true },
      ).lean();
    }

    try {
      await sendPasswordChangedEmail({
        email: tokenRecord.email,
        name: accountType === "admin" ? "Administrator" : "Customer",
      });
    } catch (error) {
      console.error("reset-password: failed to send password-change notice", accountType, error);
    }

    return jsonOk({ ok: true });
  });
}
