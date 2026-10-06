import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import {
  createEmailOtp,
  EMAIL_OTP_RESEND_COOLDOWN_MS,
  EMAIL_OTP_TTL_MS,
  hashEmailOtp,
} from "@/lib/auth/customer-passwords";
import { sendEmailOtp } from "@/lib/auth/customer-email";

const resendOtpSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = resendOtpSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    const { email } = parsed.data;
    await dbConnect();
    const customer = await CustomerModel.findOne({ email: email.toLowerCase() })
      .select({ _id: 1, name: 1, email: 1, emailVerified: 1, emailOtpResendAt: 1 })
      .lean<{ _id: string; name?: string; email: string; emailVerified?: boolean; emailOtpResendAt?: Date }>();
    if (!customer) return jsonError("No account found for this email.", 404);
    if (customer.emailVerified) return jsonError("This email is already verified.", 400);

    const cooldownUntil = customer.emailOtpResendAt?.getTime() ?? 0;
    const remainingMs = cooldownUntil - Date.now();
    if (remainingMs > 0) {
      const resendAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      return jsonError(
        `A fresh code was sent recently. Please try again in ${resendAfterSeconds}s.`,
        429,
      );
    }

    const otp = createEmailOtp();
    const otpHash = await hashEmailOtp(otp);
    const otpExpiresAt = new Date(Date.now() + EMAIL_OTP_TTL_MS);

    let emailSent = false;
    try {
      await sendEmailOtp({ email: customer.email, name: customer.name ?? "", otp });
      emailSent = true;
    } catch (err) {
      console.error("resend-otp: failed to send verification OTP", email, err);
    }

    await CustomerModel.updateOne(
      { _id: customer._id },
      {
        $set: {
          emailOtpHash: otpHash,
          emailOtpExpiresAt: otpExpiresAt,
          emailOtpAttempts: 0,
          emailOtpResendAt: new Date(emailSent ? Date.now() + EMAIL_OTP_RESEND_COOLDOWN_MS : 0),
        },
      },
    ).lean();

    if (!emailSent) {
      return jsonError("We could not send the code right now. Please try again shortly.", 502);
    }
    return jsonOk({ ok: true });
  });
}