import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";
import { getCustomerSession } from "@/lib/auth/customer-session";
import {
  hashCustomerPassword,
  validatePassword,
  verifyCustomerPassword,
} from "@/lib/auth/customer-passwords";
import { sendPasswordChangedEmail } from "@/lib/auth/customer-email";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);
    const parsed = changePasswordSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    const input = parsed.data;
    const passwordError = validatePassword(input.newPassword);
    if (passwordError) return jsonError(passwordError, 400);

    await dbConnect();
    const customer = await CustomerModel.findById(session.customerId)
      .select({ _id: 1, name: 1, email: 1, passwordHash: 1 })
      .lean<{ _id: string; name?: string; email: string; passwordHash?: string }>();
    if (!customer) return jsonError("Unauthorized.", 401);
    if (!(await verifyCustomerPassword(input.oldPassword, customer.passwordHash))) {
      return jsonError("Old password is incorrect.", 400);
    }

    const passwordHash = await hashCustomerPassword(input.newPassword);
    await CustomerModel.updateOne({ _id: customer._id }, { $set: { passwordHash } }).lean();
    await sendPasswordChangedEmail({ email: customer.email, name: customer.name ?? "Customer" });
    return jsonOk({ ok: true });
  });
}
