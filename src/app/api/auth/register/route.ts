import { NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import {
  createEmailOtp,
  EMAIL_OTP_RESEND_COOLDOWN_MS,
  EMAIL_OTP_TTL_MS,
  hashCustomerPassword,
  hashEmailOtp,
  validatePassword,
} from "@/lib/auth/customer-passwords";
import { sendEmailOtp } from "@/lib/auth/customer-email";
import { setCustomerSessionCookie } from "@/lib/auth/customer-session";

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
});

function defaultProfileAddress(input: { name: string; phone: string }) {
  return {
    id: `addr-profile-${Date.now().toString(36)}`,
    label: `${input.name.trim()} profile`,
    line1: "Address not added yet",
    line2: `Contact: ${input.name.trim()} - ${input.phone}`,
    city: "Delhi NCR",
    areaId: "",
    pincode: "",
    isDefault: true,
  };
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    const parsed = registerSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    const input = parsed.data;
    const passwordError = validatePassword(input.password);
    if (passwordError) return jsonError(passwordError, 400);
    await dbConnect();

    const email = input.email.toLowerCase();
    const existing = await CustomerModel.findOne({ email }).lean<{ _id: string; passwordHash?: string; addresses?: unknown[] }>();
    const passwordHash = await hashCustomerPassword(input.password);
    const nameParts = input.name.trim().split(/\s+/);
    const otp = createEmailOtp();
    const otpHash = await hashEmailOtp(otp);
    const otpExpiresAt = new Date(Date.now() + EMAIL_OTP_TTL_MS);

    async function deliverOtp(customerId: string, name: string) {
      let emailSent = false;
      try {
        await sendEmailOtp({ email, name, otp });
        emailSent = true;
      } catch (err) {
        console.error("register: failed to send verification OTP", email, err);
      }
      await CustomerModel.updateOne(
        { _id: customerId },
        { $set: { emailOtpResendAt: new Date(emailSent ? Date.now() + EMAIL_OTP_RESEND_COOLDOWN_MS : 0) } },
      ).lean();
      return emailSent;
    }

    let customerId: string;
    if (existing) {
      if (existing.passwordHash) return jsonError("An account already exists for this email.", 409);
      customerId = String(existing._id);
      await CustomerModel.updateOne(
        { _id: customerId },
        {
          $set: {
            name: input.name.trim(),
            firstName: nameParts[0] ?? "",
            lastName: nameParts.slice(1).join(" "),
            phone: input.phone,
            email,
            passwordHash,
            emailVerified: false,
            emailOtpHash: otpHash,
            emailOtpExpiresAt: otpExpiresAt,
            emailOtpAttempts: 0,
            emailOtpResendAt: new Date(Date.now() + EMAIL_OTP_RESEND_COOLDOWN_MS),
            ...(!existing.addresses?.length ? { addresses: [defaultProfileAddress(input)] } : {}),
          },
        },
      ).lean();
      const emailSentExisting = await deliverOtp(customerId, input.name.trim());
      const responseExisting = jsonOk({ ok: true, customerId, requiresEmailVerification: true, emailSent: emailSentExisting }, 201);
      await setCustomerSessionCookie(responseExisting, customerId);
      return responseExisting;
    } else {
      customerId = `cust-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
      await CustomerModel.create({
        _id: customerId,
        name: input.name.trim(),
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
        email,
        phone: input.phone,
        passwordHash,
        emailVerified: false,
        emailOtpHash: otpHash,
        emailOtpExpiresAt: otpExpiresAt,
        emailOtpAttempts: 0,
        emailOtpResendAt: new Date(Date.now() + EMAIL_OTP_RESEND_COOLDOWN_MS),
        wishlist: [],
        addresses: [defaultProfileAddress(input)],
        totalOrders: 0,
      });
      const emailSent = await deliverOtp(customerId, input.name.trim());
      const response = jsonOk({ ok: true, customerId, requiresEmailVerification: true, emailSent }, 201);
      await setCustomerSessionCookie(response, customerId);
      return response;
    }

  });
}
