import { NextRequest } from "next/server";
import { getCustomerByPhone, getFlowers, getOrderByNumber } from "@/lib/db/repositories";
import { jsonOk, jsonError, safe } from "@/lib/api/helpers";
import { resolveProductImage } from "@/lib/product-media";

export async function GET(req: NextRequest) {
  return safe(async () => {
    const orderNumber = req.nextUrl.searchParams.get("order")?.trim() ?? "";
    const phone = req.nextUrl.searchParams.get("phone")?.trim() ?? "";
    if (!orderNumber || !/^\d{10}$/.test(phone)) {
      return jsonError("Enter an order number and the 10-digit mobile number used at checkout.", 400);
    }
    const order = await getOrderByNumber(orderNumber);
    if (!order) return jsonError("We couldn't find an order with that number.", 404);
    const customer = await getCustomerByPhone(phone);
    if (!customer || customer.id !== order.customerId) {
      return jsonError("That mobile number doesn't match this order.", 404);
    }
    const customerName =
      customer.name ||
      [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
      "Customer";
    const flowers = await getFlowers();
    return jsonOk({
      order: {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          image: resolveProductImage(item, flowers),
        })),
      },
      customerName,
    });
  });
}
