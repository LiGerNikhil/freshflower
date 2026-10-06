import { NextRequest } from "next/server";
import { ADMIN_EMAIL, verifyAdminRequest } from "@/lib/admin/session";
import { CustomerModel, OrderModel, PaymentAttemptModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { paymentReviewSchema } from "@/lib/validation";
import { eventId, queuePaymentCustomerEmail, recordPaymentEvent } from "@/lib/payments/events";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    const { id } = await params;
    const parsed = parseOrThrow(paymentReviewSchema, await readJson(req));
    await dbConnect();

    const attempt = await PaymentAttemptModel.findById(id).lean<{
      _id: string;
      orderId: string;
      customerId?: string;
      state?: string;
    }>();
    if (!attempt) return jsonError("Payment attempt not found.", 404);
    if (attempt.state === "paid") return jsonError("Payment attempt is already paid.", 409);
    if (attempt.state === "correction_requested") return jsonError("Correction has already been requested for this attempt.", 409);
    if (attempt.state !== "verification_pending") return jsonError("Only verification-pending payments can be reviewed.", 409);

    const approved = parsed.decision === "approved";
    const nextState = approved ? "paid" : "correction_requested";
    await PaymentAttemptModel.updateOne(
      { _id: id },
      {
        $set: {
          state: nextState,
          reviewedAt: new Date(),
          reviewingAdminEmail: ADMIN_EMAIL,
          reviewDecision: parsed.decision,
          correctionReason: parsed.correctionReason,
        },
      },
    ).lean();
    await OrderModel.updateOne(
      { _id: attempt.orderId, latestPaymentAttemptId: id },
      {
        $set: {
          paymentState: nextState,
          paymentStatus: approved ? "paid" : "pending",
          updatedAt: new Date(),
        },
      },
    ).lean();
    const order = await OrderModel.findById(attempt.orderId)
      .select({ customerId: 1 })
      .lean<{ customerId?: string }>();
    const customer = await CustomerModel.findById(order?.customerId ?? attempt.customerId)
      .select({ email: 1 })
      .lean<{ email?: string }>();
    const outboxJobId = await queuePaymentCustomerEmail({
      kind: approved ? "payment-verified-customer" : "payment-correction-customer",
      orderId: attempt.orderId,
      paymentAttemptId: id,
      recipient: customer?.email ?? "",
    });
    await recordPaymentEvent({
      id: eventId([approved ? "payment.verified" : "payment.correction_requested", id, ADMIN_EMAIL]),
      type: approved ? "payment.verified" : "payment.correction_requested",
      orderId: attempt.orderId,
      paymentAttemptId: id,
      actor: ADMIN_EMAIL,
      metadata: {
        ...(parsed.correctionReason ? { correctionReason: parsed.correctionReason } : {}),
        ...(outboxJobId ? { customerEmailOutboxJobId: outboxJobId } : {}),
      },
    });

    return jsonOk({ ok: true, state: nextState });
  });
}
