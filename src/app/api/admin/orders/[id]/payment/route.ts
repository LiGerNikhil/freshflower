import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { buildAuthenticatedImageUrl } from "@/lib/cloudinary";
import { DurablePaymentEventModel, EmailOutboxModel, OrderModel, PaymentAttemptModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    const { id } = await params;
    await dbConnect();
    const order = await OrderModel.findById(id)
      .select({ orderNumber: 1, total: 1, paymentMethod: 1, paymentStatus: 1, paymentState: 1, latestPaymentAttemptId: 1 })
      .lean<{
        _id: string;
        orderNumber: string;
        total: number;
        paymentMethod?: string;
        paymentStatus?: string;
        paymentState?: string;
        latestPaymentAttemptId?: string;
      }>();
    if (!order) return jsonError("Order not found.", 404);

    const [attempts, events, outboxJobs] = await Promise.all([
      PaymentAttemptModel.find({ orderId: id }).sort({ attemptNumber: 1 }).lean(),
      DurablePaymentEventModel.find({ orderId: id }).sort({ createdAt: 1 }).lean(),
      EmailOutboxModel.find({ orderId: id }).sort({ createdAt: 1 }).lean(),
    ]);
    const attemptsWithScreenshots = attempts.map((attempt: any) => ({
      ...attempt,
      id: String(attempt._id),
      screenshotPreviewUrl: attempt.screenshotAsset?.publicId
        ? buildAuthenticatedImageUrl(attempt.screenshotAsset.publicId, { width: 400 })
        : undefined,
      screenshotFullUrl: attempt.screenshotAsset?.publicId
        ? buildAuthenticatedImageUrl(attempt.screenshotAsset.publicId, { width: 1800 })
        : undefined,
    }));

    return jsonOk({
      order: {
        id: String(order._id),
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentState: order.paymentState,
        latestPaymentAttemptId: order.latestPaymentAttemptId,
      },
      attempts: attemptsWithScreenshots,
      events: events.map((event: any) => ({ ...event, id: String(event._id) })),
      outboxJobs: outboxJobs.map((job: any) => ({ ...job, id: String(job._id) })),
    });
  });
}
