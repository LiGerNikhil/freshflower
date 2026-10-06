import crypto from "crypto";
import { DurablePaymentEventModel, EmailOutboxModel } from "@/lib/db/models";
import { adminPaymentNotificationRecipient } from "@/lib/email/nodemailer";

export function eventId(parts: string[]): string {
  return `pevt-${crypto.createHash("sha1").update(parts.join("|")).digest("hex")}`;
}

export async function recordPaymentEvent({
  id,
  type,
  orderId,
  paymentAttemptId,
  actor,
  metadata,
  createdAt = new Date(),
}: {
  id: string;
  type:
    | "payment.submitted"
    | "payment.screenshot_uploaded"
    | "payment.email_sent"
    | "payment.email_failed"
    | "payment.verified"
    | "payment.correction_requested";
  orderId: string;
  paymentAttemptId: string;
  actor?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt?: Date;
}) {
  await DurablePaymentEventModel.updateOne(
    { _id: id },
    {
      $setOnInsert: {
        _id: id,
        type,
        orderId,
        paymentAttemptId,
        actor,
        metadata,
        createdAt,
      },
    },
    { upsert: true },
  ).lean();
}

export async function queuePaymentVerificationEmail({
  orderId,
  paymentAttemptId,
  submissionRequestId,
}: {
  orderId: string;
  paymentAttemptId: string;
  submissionRequestId: string;
}) {
  const recipient = adminPaymentNotificationRecipient();
  if (!recipient) {
    throw new Error("Missing PAYMENT_NOTIFICATION_EMAIL, ADMIN_NOTIFICATION_EMAIL, or SMTP_USER for payment notifications.");
  }
  const id = `emailout-payment-${paymentAttemptId}-${submissionRequestId}`;
  await EmailOutboxModel.updateOne(
    { _id: id },
    {
      $setOnInsert: {
        _id: id,
        kind: "payment-verification-required",
        status: "pending",
        orderId,
        paymentAttemptId,
        submissionRequestId,
        recipient,
        attemptCount: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
      },
    },
    { upsert: true },
  ).lean();
  return id;
}

export async function queuePaymentCustomerEmail({
  kind,
  orderId,
  paymentAttemptId,
  recipient,
}: {
  kind: "payment-verified-customer" | "payment-correction-customer";
  orderId: string;
  paymentAttemptId: string;
  recipient: string;
}) {
  if (!recipient) return null;
  const id = `emailout-${kind}-${paymentAttemptId}`;
  await EmailOutboxModel.updateOne(
    { _id: id },
    {
      $setOnInsert: {
        _id: id,
        kind,
        status: "pending",
        orderId,
        paymentAttemptId,
        recipient,
        attemptCount: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
      },
    },
    { upsert: true },
  ).lean();
  return id;
}
