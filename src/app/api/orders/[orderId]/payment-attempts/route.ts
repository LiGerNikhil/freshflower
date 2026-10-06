import { NextRequest } from "next/server";
import crypto from "crypto";
import { OrderModel, PaymentAttemptModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { uploadMediaBuffer } from "@/lib/cloudinary";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";
import { eventId, queuePaymentVerificationEmail, recordPaymentEvent } from "@/lib/payments/events";

type OrderDoc = {
  _id: string;
  orderNumber: string;
  customerId: string;
  total: number;
  paymentStatus?: "paid" | "pending" | "refunded";
  paymentState?: string;
};

type PaymentAccountDoc = {
  accountId?: string;
  label: string;
  receiverName: string;
  upiId: string;
  qrAsset: {
    publicId: string;
    secureUrl: string;
    resourceType: "image";
    version?: string;
  };
  capturedAt?: Date;
};

function normalizeReference(value: string): string {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}

const ALLOWED_SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;

function hasValidImageSignature(bytes: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === "image/webp") {
    return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
}

async function uploadScreenshot(file: File | null) {
  if (!file) return undefined;
  if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type)) {
    throw new Error("Screenshot must be a JPEG, PNG, or WebP image.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0 || bytes.length > SCREENSHOT_MAX_BYTES) {
    throw new Error("Screenshot must be between 1 byte and 5 MB.");
  }
  if (!hasValidImageSignature(bytes, file.type)) {
    throw new Error("Screenshot content does not match a supported image format.");
  }
  return uploadMediaBuffer(bytes, {
    folder: "freshflower/payment-evidence",
    resourceType: "image",
    deliveryType: "authenticated",
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);
    const { orderId } = await params;
    await dbConnect();
    const order = await OrderModel.findById(orderId).lean<OrderDoc>();
    if (!order || order.customerId !== session.customerId) return jsonError("Order not found.", 404);
    const attempts = await PaymentAttemptModel.find({ orderId }).sort({ attemptNumber: 1 }).lean();
    return jsonOk(attempts);
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    const session = await getCustomerSession(req);
    if (!session) return jsonError("Unauthorized.", 401);
    const { orderId } = await params;
    const form = await req.formData();
    const upiTransactionRef = String(form.get("upiTransactionRef") ?? "").trim();
    const submissionRequestId = String(form.get("submissionRequestId") ?? "").trim();
    const screenshotValue = form.get("screenshot");
    const screenshotFile = screenshotValue && typeof screenshotValue !== "string" ? screenshotValue : null;
    if (upiTransactionRef.length < 4 || upiTransactionRef.length > 160) {
      return jsonError("Enter a valid UPI transaction reference.", 400);
    }
    if (submissionRequestId.length < 8 || submissionRequestId.length > 160) {
      return jsonError("Missing payment submission request id. Please refresh and try again.", 400);
    }
    const normalizedRef = normalizeReference(upiTransactionRef);

    await dbConnect();
    const order = await OrderModel.findById(orderId).lean<OrderDoc>();
    if (!order || order.customerId !== session.customerId) return jsonError("Order not found.", 404);
    if (order.paymentStatus === "paid" || order.paymentState === "paid") {
      return jsonError("This order is already marked paid.", 409);
    }

    const existingSubmission = await PaymentAttemptModel.findOne({ orderId, submissionRequestId })
      .select({ _id: 1, state: 1, customerId: 1, screenshotAsset: 1, reusedTransactionReference: 1, reusedReferenceOrderIds: 1 })
      .lean<{
        _id: string;
        state?: string;
        customerId?: string;
        screenshotAsset?: { publicId?: string; deliveryType?: string };
        reusedTransactionReference?: boolean;
        reusedReferenceOrderIds?: string[];
      }>();
    if (existingSubmission) {
      if (existingSubmission.screenshotAsset?.publicId) {
        await recordPaymentEvent({
          id: eventId(["payment.screenshot_uploaded", String(existingSubmission._id), submissionRequestId]),
          type: "payment.screenshot_uploaded",
          orderId,
          paymentAttemptId: String(existingSubmission._id),
          actor: `customer:${existingSubmission.customerId ?? session.customerId}`,
          metadata: {
            publicId: existingSubmission.screenshotAsset.publicId,
            deliveryType: existingSubmission.screenshotAsset.deliveryType ?? "authenticated",
          },
        });
      }
      await recordPaymentEvent({
        id: eventId(["payment.submitted", String(existingSubmission._id), submissionRequestId]),
        type: "payment.submitted",
        orderId,
        paymentAttemptId: String(existingSubmission._id),
        actor: `customer:${existingSubmission.customerId ?? session.customerId}`,
        metadata: {
          submissionRequestId,
          hasScreenshot: Boolean(existingSubmission.screenshotAsset?.publicId),
          reusedTransactionReference: existingSubmission.reusedTransactionReference === true,
        },
      });
      const outboxJobId = await queuePaymentVerificationEmail({
        orderId,
        paymentAttemptId: String(existingSubmission._id),
        submissionRequestId,
      });
      return jsonOk({
        ok: true,
        attemptId: String(existingSubmission._id),
        outboxJobId,
        state: existingSubmission.state ?? "verification_pending",
        reusedTransactionReference: existingSubmission.reusedTransactionReference === true,
        reusedReferenceOrderIds: existingSubmission.reusedReferenceOrderIds ?? [],
        idempotent: true,
      });
    }

    const latestAttempt = await PaymentAttemptModel.findOne({ orderId })
      .sort({ attemptNumber: -1 })
      .lean<{
        _id: string;
        attemptNumber?: number;
        state?: string;
        paymentAccountSnapshot?: PaymentAccountDoc;
      }>();
    if (!latestAttempt?.paymentAccountSnapshot) return jsonError("Payment instructions are not ready for this order.", 409);
    if (latestAttempt.state === "verification_pending") {
      return jsonError("Payment evidence is already submitted and awaiting admin verification.", 409);
    }
    if (latestAttempt.state === "paid") return jsonError("This order is already marked paid.", 409);

    let screenshotAsset: Awaited<ReturnType<typeof uploadScreenshot>> | undefined;
    try {
      screenshotAsset = await uploadScreenshot(screenshotFile);
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Screenshot upload failed.", 400);
    }

    const reused = await PaymentAttemptModel.find({
      normalizedUpiTransactionRef: normalizedRef,
      orderId: { $ne: orderId },
    })
      .select({ orderId: 1 })
      .lean<Array<{ orderId?: string }>>();
    const reusedOrderIds = Array.from(
      new Set(reused.flatMap((attempt) => (attempt.orderId ? [attempt.orderId] : []))),
    );
    const now = new Date();
    const embeddedEvents = [
      ...(screenshotAsset
        ? [
            {
              type: "payment.screenshot_uploaded",
              createdAt: now,
              metadata: { publicId: screenshotAsset.publicId, deliveryType: screenshotAsset.deliveryType ?? "authenticated" },
            },
          ]
        : []),
      {
        type: "payment.submitted",
        createdAt: now,
        metadata: { hasScreenshot: Boolean(screenshotAsset), reusedTransactionReference: reusedOrderIds.length > 0 },
      },
    ];
    const basePatch = {
      state: "verification_pending",
      upiTransactionRef,
      normalizedUpiTransactionRef: normalizedRef,
      screenshotAsset,
      submissionRequestId,
      submittedAt: now,
      reusedTransactionReference: reusedOrderIds.length > 0,
      reusedReferenceOrderIds: reusedOrderIds,
      events: embeddedEvents,
      updatedAt: now,
    };
    let attemptId = latestAttempt._id;
    if (latestAttempt.state === "awaiting_payment") {
      await PaymentAttemptModel.updateOne(
        { _id: latestAttempt._id, state: "awaiting_payment" },
        { $set: basePatch },
      ).lean();
    } else {
      attemptId = `payatt-${Date.now().toString(36)}${crypto.randomInt(1000)}`;
      await PaymentAttemptModel.create({
        _id: attemptId,
        orderId,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        attemptNumber: (latestAttempt.attemptNumber ?? 0) + 1,
        amount: order.total,
        currency: "INR",
        paymentAccountSnapshot: latestAttempt.paymentAccountSnapshot,
        ...basePatch,
      });
    }
    await OrderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          latestPaymentAttemptId: attemptId,
          paymentMethod: "upi",
          paymentStatus: "pending",
          paymentState: "verification_pending",
          paymentCurrency: "INR",
          updatedAt: now,
        },
      },
    ).lean();

    if (screenshotAsset) {
      await recordPaymentEvent({
        id: eventId(["payment.screenshot_uploaded", attemptId, submissionRequestId]),
        type: "payment.screenshot_uploaded",
        orderId,
        paymentAttemptId: attemptId,
        actor: `customer:${order.customerId}`,
        metadata: {
          publicId: screenshotAsset.publicId,
          deliveryType: screenshotAsset.deliveryType ?? "authenticated",
        },
        createdAt: now,
      });
    }
    await recordPaymentEvent({
      id: eventId(["payment.submitted", attemptId, submissionRequestId]),
      type: "payment.submitted",
      orderId,
      paymentAttemptId: attemptId,
      actor: `customer:${order.customerId}`,
      metadata: {
        submissionRequestId,
        hasScreenshot: Boolean(screenshotAsset),
        reusedTransactionReference: reusedOrderIds.length > 0,
      },
      createdAt: now,
    });
    const outboxJobId = await queuePaymentVerificationEmail({
      orderId,
      paymentAttemptId: attemptId,
      submissionRequestId,
    });

    return jsonOk({
      ok: true,
      attemptId,
      outboxJobId,
      state: "verification_pending",
      reusedTransactionReference: reusedOrderIds.length > 0,
      reusedReferenceOrderIds: reusedOrderIds,
    }, 201);
  });
}
