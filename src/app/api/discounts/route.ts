import { jsonOk, safe } from "@/lib/api/helpers";
import { getTieredDiscountConfig } from "@/lib/server/tiered-discount";

export const dynamic = "force-dynamic";

/**
 * Public, display-only tier configuration for the cart/Diwali journey.
 * The discount itself is always recalculated server-side at checkout.
 */
export async function GET() {
  return safe(async () => {
    const config = await getTieredDiscountConfig();
    return jsonOk({ ok: true, config });
  });
}
