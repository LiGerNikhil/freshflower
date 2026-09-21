import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import { setCustomerSessionCookie } from "@/lib/auth/customer-session";
import { verifyCustomerPassword } from "@/lib/auth/customer-passwords";

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
      .select({ _id: 1, name: 1, email: 1, passwordHash: 1, emailVerified: 1 })
      .lean<{ _id: string; name?: string; email: string; passwordHash?: string; emailVerified?: boolean }>();
    if (!customer || !(await verifyCustomerPassword(input.password, customer.passwordHash))) {
      return jsonError("Invalid email or password.", 401);
    }
    const response = jsonOk({
      ok: true,
      customer: {
        id: String(customer._id),
        name: customer.name ?? "",
        email: customer.email,
        emailVerified: customer.emailVerified ?? false,
      },
    });
    await setCustomerSessionCookie(response, String(customer._id));
    return response;
  });
}
