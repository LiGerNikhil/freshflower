import { NextRequest } from "next/server";
import { DiwaliBookingModel } from "@/lib/db/models";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { ApiError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { serialize } from "@/lib/db/repositories";
import { diwaliBookingPatchSchema } from "@/lib/validation";
import type { DiwaliBooking } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return safe(async () => {
    await requireAdminRole(request, CONTENT_WRITE_ROLES);
    const { id } = await params;
    const patch = parseOrThrow(diwaliBookingPatchSchema, await readJson(request));
    const booking = await DiwaliBookingModel.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    ).lean();
    if (!booking) throw new ApiError("Diwali booking not found.", 404);
    return jsonOk({ ok: true, booking: serialize<DiwaliBooking>(booking) });
  });
}
