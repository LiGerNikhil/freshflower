import { NextRequest } from "next/server";
import { OrderModel, PaymentAccountModel, PaymentAttemptModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { jsonError, jsonOk, readJson, safe } from "@/lib/api/helpers";

type PaymentAccountSnapshot = {
  accountId: string;
  label: string;
  receiverName: string;
  upiId: string;
  qrAsset: { publicId: string; secureUrl: string; resourceType: "image"; version?: string };
  capturedAt: Date;
};

type OrderDoc = {
  _id: string;
  orderNumber: string;
  customerId: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentState?: string;
  paymentCurrency?: "INR";
  latestPaymentAttemptId?: string;
};

async function ownedOrder(req: NextRequest, orderId: string): Promise<OrderDoc | Response> {
  const session = await getCustomerSession(req);
  if (!session) return jsonError("Unauthorized.", 401);
  const order = await OrderModel.findById(orderId).lean<OrderDoc>();
  if (!order || order.customerId !== session.customerId) return jsonError("Order not found.", 404);
  return order;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    const { orderId } = await params;
    await dbConnect();
    const order = await ownedOrder(req, orderId);
    if (order instanceof Response) return order;
    const [attempts, accounts] = await Promise.all([
      PaymentAttemptModel.find({ orderId }).sort({ attemptNumber: 1 }).lean(),
      PaymentAccountModel.find({ active: true })
        .sort({ defaultAccount: -1, updatedAt: -1 })
        .select({ label: 1, receiverName: 1, upiId: 1, qrAsset: 1, defaultAccount: 1 })
        .lean(),
    ]);
    const latest = attempts.at(-1) as { state?: string; paymentAccountSnapshot?: PaymentAccountSnapshot } | undefined;
    return jsonOk({
      order: {
        id: String(order._id),
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.paymentCurrency ?? "INR",
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentState: order.paymentState ?? latest?.state ?? "awaiting_payment",
      },
      selectedAccount: latest?.paymentAccountSnapshot ?? null,
      canSwitchAccount: latest?.state === "awaiting_payment",
      attempts,
      accounts: accounts.map((account: any) => ({
        id: String(account._id),
        label: account.label,
        receiverName: account.receiverName,
        upiId: account.upiId,
        defaultAccount: account.defaultAccount === true,
        qrAsset: account.qrAsset,
      })),
    });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    const { orderId } = await params;
    const body = await readJson(req) as { paymentAccountId?: string };
    if (!body.paymentAccountId) return jsonError("Payment account is required.", 400);
    await dbConnect();
    const order = await ownedOrder(req, orderId);
    if (order instanceof Response) return order;
    if (order.paymentState && order.paymentState !== "awaiting_payment") {
      return jsonError("Payment account cannot be changed after payment evidence is submitted.", 409);
    }
    const [attempt, account] = await Promise.all([
      PaymentAttemptModel.findOne({ orderId }).sort({ attemptNumber: -1 }).lean<{ _id: string; state?: string }>(),
      PaymentAccountModel.findOne({ _id: body.paymentAccountId, active: true }).lean<{
        _id: string;
        label: string;
        receiverName: string;
        upiId: string;
        qrAsset: { publicId: string; secureUrl: string; resourceType: "image"; version?: string };
      }>(),
    ]);
    if (!attempt) return jsonError("Payment attempt not found.", 404);
    if (attempt.state !== "awaiting_payment") {
      return jsonError("Payment account cannot be changed after payment evidence is submitted.", 409);
    }
    if (!account) return jsonError("Payment account is not active.", 400);
    const snapshot = {
      accountId: String(account._id),
      label: account.label,
      receiverName: account.receiverName,
      upiId: account.upiId,
      qrAsset: account.qrAsset,
      capturedAt: new Date(),
    };
    await PaymentAttemptModel.updateOne(
      { _id: attempt._id, state: "awaiting_payment" },
      { $set: { paymentAccountSnapshot: snapshot, updatedAt: new Date() } },
    ).lean();
    return jsonOk({ ok: true, selectedAccount: snapshot });
  });
}
