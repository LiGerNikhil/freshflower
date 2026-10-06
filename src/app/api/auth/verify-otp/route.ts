import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import { EMAIL_OTP_MAX_ATTEMPTS, verifyEmailOtp } from "@/lib/auth/customer-passwords";

const verifyOtpSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = verifyOtpSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    const { email, otp } = parsed.data;
    await dbConnect();
    const customer = await CustomerModel.findOne({ email: email.toLowerCase() })
      .select({
        _id: 1,
        emailVerified: 1,
        emailOtpHash: 1,
        emailOtpExpiresAt: 1,
        emailOtpAttempts: 1,
      })
      .lean<{
        _id: string;
        emailVerified?: boolean;
        emailOtpHash?: string;
        emailOtpExpiresAt?: Date;
        emailOtpAttempts?: number;
      }>();
    if (!customer) return jsonError("No account found for this email.", 404);
    if (customer.emailVerified) return jsonError("This email is already verified.", 400);

    const attempts = customer.emailOtpAttempts ?? 0;
    const otpExpired = !customer.emailOtpHash || !customer.emailOtpExpiresAt || customer.emailOtpExpiresAt.getTime() < Date.now();

    if (otpExpired) {
      return jsonError("This code has expired. Request a new code.", 400);
    }
    if (attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
      return jsonError("Too many incorrect attempts. Request a new code.", 429);
    }

    const valid = await verifyEmailOtp(otp, customer.emailOtpHash);
    if (!valid) {
      const nextAttempts = attempts + 1;
      const exhausted = nextAttempts >= EMAIL_OTP_MAX_ATTEMPTS;
      await CustomerModel.updateOne(
        { _id: customer._id },
        {
          $set: { emailOtpAttempts: nextAttempts },
          ...(exhausted ? { $unset: { emailOtpHash: "", emailOtpExpiresAt: "" } } : {}),
        },
      ).lean();
      return jsonError(
        exhausted
          ? "Too many incorrect attempts. Request a new code."
          : "That code is incorrect, please try again.",
        400,
      );
    }

    await CustomerModel.updateOne(
      { _id: customer._id },
      {
        $set: { emailVerified: true, updatedAt: new Date() },
        $unset: {
          emailOtpHash: "",
          emailOtpExpiresAt: "",
          emailOtpAttempts: "",
          emailOtpResendAt: "",
        },
      },
    ).lean();
    return jsonOk({ ok: true });
  });
}