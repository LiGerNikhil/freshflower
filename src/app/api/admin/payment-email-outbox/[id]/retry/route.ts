import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { EmailOutboxModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    const { id } = await params;
    await dbConnect();
    const updated = await EmailOutboxModel.findByIdAndUpdate(
      { _id: id, status: { $in: ["failed", "pending"] } },
      {
        $set: {
          status: "pending",
          attemptCount: 0,
          nextAttemptAt: new Date(),
        },
        $unset: { lockedAt: "", lockedUntil: "", lockToken: "", failureReason: "" },
      },
      { returnDocument: "after" },
    ).lean();
    if (!updated) return jsonError("Email outbox job not found or not retryable.", 404);
    return jsonOk({ ok: true });
  });
}
