import { NextRequest } from "next/server";
import { OrderModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { orderStatusPatchSchema } from "@/lib/validation";

const crud = makeCrud(OrderModel);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.get(id));
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    const parsed = parseOrThrow(orderStatusPatchSchema, await readJson(req));
    const order = await OrderModel.findById(id)
      .select({ paymentMethod: 1, paymentStatus: 1 })
      .lean<{ paymentMethod?: string; paymentStatus?: string }>();
    if (parsed.paymentStatus === "paid") {
      if (order?.paymentMethod === "upi") {
        return jsonOk({ error: "Review UPI payments from the payment verification panel." }, 409);
      }
    }
    if (
      parsed.status &&
      order?.paymentMethod === "upi" &&
      order.paymentStatus !== "paid" &&
      !["received", "cancelled"].includes(parsed.status)
    ) {
      return jsonOk({ error: "Verify UPI payment before moving this order into fulfillment." }, 409);
    }
    return jsonOk(await crud.patch(id, parsed as Record<string, unknown>));
  });
}
