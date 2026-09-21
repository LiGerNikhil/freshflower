import { NextRequest } from "next/server";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);
    await dbConnect();
    const customer = await CustomerModel.findById(session.customerId)
      .select({ _id: 1, name: 1, email: 1, phone: 1, emailVerified: 1 })
      .lean<{ _id: string; name?: string; email?: string; phone?: string; emailVerified?: boolean }>();
    if (!customer) return jsonError("Unauthorized.", 401);
    return jsonOk({
      customer: {
        id: String(customer._id),
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        emailVerified: customer.emailVerified ?? false,
      },
    });
  });
}
