import { NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import {
  createEmailVerificationToken,
  hashCustomerPassword,
  validatePassword,
} from "@/lib/auth/customer-passwords";
import { sendVerificationEmail } from "@/lib/auth/customer-email";
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
    const verificationExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    let customerId: string;
    if (existing) {
      if (existing.passwordHash) return jsonError("An account already exists for this email.", 409);
      customerId = String(existing._id);
      const verificationToken = await createEmailVerificationToken(customerId, email);
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
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiresAt: verificationExpiry,
            ...(!existing.addresses?.length ? { addresses: [defaultProfileAddress(input)] } : {}),
          },
        },
      ).lean();
      await sendVerificationEmail({ email, name: input.name.trim(), token: verificationToken });
      const response = jsonOk({ ok: true, customerId }, 201);
      await setCustomerSessionCookie(response, customerId);
      return response;
    } else {
      customerId = `cust-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
      const token = await createEmailVerificationToken(customerId, email);
      await CustomerModel.create({
        _id: customerId,
        name: input.name.trim(),
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
        email,
        phone: input.phone,
        passwordHash,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: verificationExpiry,
        wishlist: [],
        addresses: [defaultProfileAddress(input)],
        totalOrders: 0,
      });
      await sendVerificationEmail({ email, name: input.name.trim(), token });
      const response = jsonOk({ ok: true, customerId }, 201);
      await setCustomerSessionCookie(response, customerId);
      return response;
    }

  });
}
