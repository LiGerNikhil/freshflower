import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { buildAuthenticatedImageUrl } from "@/lib/cloudinary";
import { PaymentAttemptModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";

export async function GET(req: NextRequest) {
  return safe(async () => {
    const publicId = req.nextUrl.searchParams.get("publicId")?.trim();
    if (!publicId) return jsonError("Missing payment evidence asset id.", 400);
    await dbConnect();
    const attempt = await PaymentAttemptModel.findOne({ "screenshotAsset.publicId": publicId })
      .select({ customerId: 1 })
      .lean<{ customerId?: string }>();
    if (!attempt) return jsonError("Payment evidence not found.", 404);

    const isAdmin = await verifyAdminRequest(req);
    const session = isAdmin ? null : await getCustomerSession(req);
    if (!isAdmin && session?.customerId !== attempt.customerId) {
      return jsonError("Unauthorized.", 401);
    }

    return jsonOk({ url: buildAuthenticatedImageUrl(publicId, { width: 1400 }) });
  });
}
