import { NextRequest } from "next/server";
import { z } from "zod";
import { CustomerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
});

export async function PATCH(req: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);
    const parsed = profileSchema.safeParse(await readJson(req));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);

    const input = parsed.data;
    const nameParts = input.name.split(/\s+/);
    await dbConnect();
    await CustomerModel.updateOne(
      { _id: session.customerId },
      {
        $set: {
          name: input.name,
          firstName: nameParts[0] ?? "",
          lastName: nameParts.slice(1).join(" "),
          phone: input.phone,
          addresses: [
            {
              id: "addr-default",
              label: "Home",
              line1: input.address,
              city: input.city,
              areaId: "",
              pincode: "",
              isDefault: true,
            },
          ],
          updatedAt: new Date(),
        },
      },
    ).lean();
    return jsonOk({ ok: true });
  });
}
