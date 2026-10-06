import crypto from "crypto";
import { buildAuthenticatedImageUrl } from "@/lib/cloudinary";
import { CustomerModel, EmailOutboxModel, OrderModel, PaymentAttemptModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { canonical } from "@/lib/seo";
import { sendEmail, type EmailAttachment } from "@/lib/email/nodemailer";
import { eventId, recordPaymentEvent } from "@/lib/payments/events";

const LOCK_MS = 2 * 60 * 1000;

function safeFilename(orderNumber: string, attemptId: string): string {
  const safeOrder = orderNumber.replace(/[^a-z0-9-]/gi, "-");
  const safeAttempt = attemptId.replace(/[^a-z0-9-]/gi, "-").slice(-24);
  return `payment-${safeOrder}-${safeAttempt}.jpg`;
}

function failureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown email error";
  return message.slice(0, 500);
}

async function attachmentFor(attempt: { _id: string; orderNumber: string; screenshotAsset?: { publicId?: string } }): Promise<EmailAttachment[]> {
  const publicId = attempt.screenshotAsset?.publicId;
  if (!publicId) return [];
  const signedUrl = buildAuthenticatedImageUrl(publicId, { width: 1600 });
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error(`Could not fetch payment screenshot from Cloudinary (${response.status}).`);
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const content = Buffer.from(await response.arrayBuffer());
  return [{ filename: safeFilename(attempt.orderNumber, String(attempt._id)), content, contentType }];
}

export async function processPaymentEmailOutbox({ limit = 10 } = {}) {
  await dbConnect();
  let processed = 0;
  for (let index = 0; index < limit; index += 1) {
    const lockToken = crypto.randomUUID();
    const now = new Date();
    const job = await EmailOutboxModel.findOneAndUpdate(
      {
        kind: { $in: ["payment-verification-required", "payment-verified-customer", "payment-correction-customer"] },
        status: { $in: ["pending", "failed"] },
        nextAttemptAt: { $lte: now },
        $or: [{ lockedUntil: { $exists: false } }, { lockedUntil: { $lte: now } }],
        $expr: { $lt: ["$attemptCount", "$maxAttempts"] },
      },
      {
        $set: {
          status: "processing",
          lockedAt: now,
          lockedUntil: new Date(now.getTime() + LOCK_MS),
          lockToken,
        },
      },
      { sort: { nextAttemptAt: 1 }, returnDocument: "after" },
    ).lean<{
      _id: string;
      orderId: string;
      paymentAttemptId: string;
      recipient: string;
      kind: "payment-verification-required" | "payment-verified-customer" | "payment-correction-customer";
      attemptCount?: number;
      maxAttempts?: number;
      submissionRequestId?: string;
    }>();
    if (!job) break;

    try {
      const [order, attempt] = await Promise.all([
        OrderModel.findById(job.orderId).lean<{
          _id: string;
          orderNumber: string;
          customerId: string;
          total: number;
        }>(),
        PaymentAttemptModel.findById(job.paymentAttemptId).lean<{
          _id: string;
          orderNumber: string;
          customerId: string;
          amount: number;
          submittedAt?: Date;
          upiTransactionRef?: string;
          paymentAccountSnapshot?: { label: string; receiverName: string; upiId: string };
          screenshotAsset?: { publicId?: string };
        }>(),
      ]);
      if (!order || !attempt) throw new Error("Order or payment attempt not found for outbox job.");
      const customer = await CustomerModel.findById(order.customerId)
        .select({ name: 1, email: 1, phone: 1 })
        .lean<{ name?: string; email?: string; phone?: string }>();
      let attachments: EmailAttachment[] = [];
      const customerName = customer?.name ?? "Customer";
      const info = job.kind === "payment-verification-required"
        ? await (async () => {
            if (!attempt.paymentAccountSnapshot || !attempt.upiTransactionRef || !attempt.submittedAt) {
              throw new Error("Payment attempt is missing submission details.");
            }
            attachments = await attachmentFor(attempt);
            return sendEmail({
              to: job.recipient,
              template: {
                type: "payment-verification-required",
                orderNumber: order.orderNumber,
                customerName,
                customerEmail: customer?.email,
                customerPhone: customer?.phone,
                total: attempt.amount,
                paymentAccount: attempt.paymentAccountSnapshot,
                upiTransactionRef: attempt.upiTransactionRef,
                submittedAt: new Date(attempt.submittedAt),
                adminOrderUrl: canonical(`/admin/orders/${encodeURIComponent(String(order._id))}`),
              },
              attachments,
            });
          })()
        : job.kind === "payment-verified-customer"
          ? await sendEmail({
              to: job.recipient,
              template: {
                type: "payment-verified-customer",
                name: customerName,
                orderNumber: order.orderNumber,
                total: attempt.amount,
              },
            })
          : await sendEmail({
              to: job.recipient,
              template: {
                type: "payment-correction-customer",
                name: customerName,
                orderNumber: order.orderNumber,
                reason: (attempt as { correctionReason?: string }).correctionReason ?? "Please review and resubmit your payment details.",
                orderUrl: canonical(`/order-confirmation/${encodeURIComponent(String(order._id))}`),
              },
            });
      await EmailOutboxModel.updateOne(
        { _id: job._id, lockToken },
        {
          $set: {
            status: "sent",
            sentAt: new Date(),
            notificationId: info.messageId,
            failureReason: undefined,
          },
          $unset: { lockToken: "", lockedAt: "", lockedUntil: "" },
        },
      ).lean();
      await recordPaymentEvent({
        id: eventId(["payment.email_sent", job.paymentAttemptId, job._id]),
        type: "payment.email_sent",
        orderId: job.orderId,
        paymentAttemptId: job.paymentAttemptId,
        actor: "system",
        metadata: {
          outboxJobId: job._id,
          notificationId: info.messageId ?? "",
          acceptedCount: Array.isArray(info.accepted) ? info.accepted.length : 0,
          rejectedCount: Array.isArray(info.rejected) ? info.rejected.length : 0,
          hadScreenshotAttachment: attachments.length > 0,
          kind: job.kind,
        },
      });
      processed += 1;
    } catch (error) {
      const nextAttemptCount = (job.attemptCount ?? 0) + 1;
      const maxAttempts = job.maxAttempts ?? 5;
      const failedPermanently = nextAttemptCount >= maxAttempts;
      const reason = failureMessage(error);
      await EmailOutboxModel.updateOne(
        { _id: job._id, lockToken },
        {
          $set: {
            status: failedPermanently ? "failed" : "pending",
            attemptCount: nextAttemptCount,
            failureReason: reason,
            lastErrorAt: new Date(),
            nextAttemptAt: new Date(Date.now() + Math.min(60, 2 ** nextAttemptCount) * 60 * 1000),
          },
          $unset: { lockToken: "", lockedAt: "", lockedUntil: "" },
        },
      ).lean();
      await recordPaymentEvent({
        id: eventId(["payment.email_failed", job.paymentAttemptId, job._id, String(nextAttemptCount)]),
        type: "payment.email_failed",
        orderId: job.orderId,
        paymentAttemptId: job.paymentAttemptId,
        actor: "system",
        metadata: { outboxJobId: job._id, attemptCount: nextAttemptCount, failureReason: reason, kind: job.kind },
      });
      processed += 1;
    }
  }
  return { processed };
}
