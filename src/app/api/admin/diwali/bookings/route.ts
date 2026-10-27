import { NextRequest } from "next/server";
import { DiwaliBookingModel } from "@/lib/db/models";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { jsonOk, safe } from "@/lib/api/helpers";
import { serializeList } from "@/lib/db/repositories";
import type { DiwaliBooking } from "@/lib/types";

export async function GET(request: NextRequest) {
  return safe(async () => {
    await requireAdminRole(request, CONTENT_WRITE_ROLES);
    const bookings = await DiwaliBookingModel.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(500)
      .lean();
    return jsonOk(serializeList<DiwaliBooking>(bookings));
  });
}
