import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import { setCustomerSessionCookie } from "@/lib/auth/customer-session";
import {
  createEmailOtp,
  EMAIL_OTP_RESEND_COOLDOWN_MS,
  EMAIL_OTP_TTL_MS,
  hashEmailOtp,
  verifyCustomerPassword,
} from "@/lib/auth/customer-passwords";
import { sendEmailOtp } from "@/lib/auth/customer-email";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = loginSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    const input = parsed.data;
    await dbConnect();
    const customer = await CustomerModel.findOne({ email: input.email.toLowerCase() })
      .select({
        _id: 1,
        name: 1,
        email: 1,
        passwordHash: 1,
        emailVerified: 1,
        emailOtpHash: 1,
        emailOtpExpiresAt: 1,
        emailOtpResendAt: 1,
      })
      .lean<{
        _id: string;
        name?: string;
        email: string;
        passwordHash?: string;
        emailVerified?: boolean;
        emailOtpHash?: string;
        emailOtpExpiresAt?: Date;
        emailOtpResendAt?: Date;
      }>();
    if (!customer || !(await verifyCustomerPassword(input.password, customer.passwordHash))) {
      return jsonError("Invalid email or password.", 401);
    }

    let verificationEmailStatus: "sent" | "already-sent" | "failed" | undefined;
    let resendAfterSeconds = 0;
    if (!customer.emailVerified) {
      const now = Date.now();
      const codeExpiresAt = customer.emailOtpExpiresAt?.getTime() ?? 0;
      const cooldownUntil = customer.emailOtpResendAt?.getTime() ?? 0;
      if (customer.emailOtpHash && codeExpiresAt > now && cooldownUntil > now) {
        verificationEmailStatus = "already-sent";
        resendAfterSeconds = Math.ceil((cooldownUntil - now) / 1000);
      } else {
        const otp = createEmailOtp();
        const otpHash = await hashEmailOtp(otp);
        const otpExpiresAt = new Date(now + EMAIL_OTP_TTL_MS);
        await CustomerModel.updateOne(
          { _id: customer._id, emailVerified: { $ne: true } },
          {
            $set: {
              emailOtpHash: otpHash,
              emailOtpExpiresAt: otpExpiresAt,
              emailOtpAttempts: 0,
              emailOtpResendAt: new Date(now + EMAIL_OTP_RESEND_COOLDOWN_MS),
            },
          },
        ).lean();
        try {
          await sendEmailOtp({
            email: customer.email,
            name: customer.name ?? "",
            otp,
          });
          verificationEmailStatus = "sent";
          resendAfterSeconds = Math.ceil(EMAIL_OTP_RESEND_COOLDOWN_MS / 1000);
        } catch (error) {
          console.error("login: failed to send verification OTP", customer.email, error);
          await CustomerModel.updateOne(
            { _id: customer._id, emailOtpHash: otpHash },
            { $set: { emailOtpResendAt: new Date(0) } },
          ).lean();
          verificationEmailStatus = "failed";
        }
      }
    }

    const response = jsonOk({
      ok: true,
      customer: {
        id: String(customer._id),
        name: customer.name ?? "",
        email: customer.email,
        emailVerified: customer.emailVerified ?? false,
      },
      verificationEmailStatus,
      resendAfterSeconds,
    });
    await setCustomerSessionCookie(response, String(customer._id));
    return response;
  });
}
