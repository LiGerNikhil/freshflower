import dotenv from "dotenv";
import { createAdminSessionToken, ADMIN_SESSION_COOKIE } from "../src/lib/admin/session";
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "../src/lib/auth/customer-session";
import { dbConnect } from "../src/lib/db/connect";
import {
  CustomerModel,
  DurablePaymentEventModel,
  EmailOutboxModel,
  OrderModel,
  PaymentAccountModel,
  PaymentAttemptModel,
} from "../src/lib/db/models";
import { getFlowers } from "../src/lib/db/repositories";
import { processPaymentEmailOutbox } from "../src/lib/payments/email-outbox";
import { formatAppDate, formatAppDateTime } from "../src/lib/utils";

dotenv.config({ path: ".env.local" });

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS ?? 20_000);
const runId = `upi-e2e-${Date.now().toString(36)}`;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function request(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function pngFile(name = "payment.png") {
  const bytes = Uint8Array.from(Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64",
  ));
  return new File([bytes], name, { type: "image/png" });
}

async function main() {
  await dbConnect();

  const products = await getFlowers();
  const product = products.find((item) => item.active !== false && item.id);
  assert(product, "Expected at least one active product.");

  const customerId = `cust-${runId}`;
  const customerEmail = `${runId}@example.com`;
  await CustomerModel.updateOne(
    { _id: customerId },
    {
      $set: {
        _id: customerId,
        name: "Manual UPI E2E",
        firstName: "Manual",
        lastName: "UPI E2E",
        email: customerEmail,
        phone: "9876543210",
        emailVerified: false,
        wishlist: [],
        addresses: [],
        totalOrders: 0,
      },
    },
    { upsert: true },
  ).lean();

  const paymentAccountId = `payacct-${runId}`;
  await PaymentAccountModel.updateMany({}, { $set: { defaultAccount: false } }).lean();
  await PaymentAccountModel.updateOne(
    { _id: paymentAccountId },
    {
      $set: {
        _id: paymentAccountId,
        label: "Manual UPI E2E Primary",
        receiverName: "FreshFlower Test",
        upiId: "freshflower-test@upi",
        active: true,
        defaultAccount: true,
        qrAsset: {
          publicId: `freshflower/test/${runId}-qr-original`,
          secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          resourceType: "image",
          deliveryType: "upload",
        },
      },
    },
    { upsert: true },
  ).lean();

  const customerCookie = `${CUSTOMER_SESSION_COOKIE}=${await createCustomerSessionToken(customerId)}`;
  const adminCookie = `${ADMIN_SESSION_COOKIE}=${await createAdminSessionToken()}`;

  const checkoutRequestId = `checkout-${runId}`;
  const checkoutPayload = {
    checkoutRequestId,
    customer: {
      name: "Manual UPI E2E",
      phone: "9876543210",
      email: customerEmail,
      address: { line: "E2E payment address", city: "New Delhi", areaId: "area-new-delhi", pincode: "110001" },
      notes: "Manual UPI focused test",
      preferCall: false,
    },
    items: [{ productId: product.id, productType: "flower", name: product.name, quantity: 1, price: 1 }],
    deliverySlotId: "slot-10-11",
    deliveryDate: new Date(Date.now() + 86_400_000).toISOString(),
    coupons: [],
    subtotal: 1,
    discount: 999,
    deliveryFee: 0,
    total: 1,
    paymentMethod: "upi",
    paymentAccountId,
    agreedToTos: true,
  };

  const unauthAdmin = await request(`/api/admin/orders/not-real/payment`);
  assert(unauthAdmin.status === 401, "Expected admin payment endpoint to require admin auth.");

  const checkout = await request("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify(checkoutPayload),
  });
  const checkoutBody = await json<{ orderId: string; orderNumber: string; totals: { total: number } }>(checkout);
  assert(checkout.ok, `Expected UPI checkout to succeed: ${JSON.stringify(checkoutBody)}`);
  assert(checkoutBody.totals.total !== 1, "Expected server-side total to ignore browser-sent total.");

  const duplicateCheckout = await request("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify(checkoutPayload),
  });
  const duplicateCheckoutBody = await json<{ orderId: string }>(duplicateCheckout);
  assert(duplicateCheckoutBody.orderId === checkoutBody.orderId, "Expected duplicate checkout request to return the existing order.");

  const storedOrder = await OrderModel.findById(checkoutBody.orderId).lean<{ total: number; paymentStatus?: string; paymentState?: string }>();
  assert(storedOrder?.total === checkoutBody.totals.total, "Expected stored order total to match server total.");
  assert(storedOrder.paymentStatus !== "paid", "Customer checkout must not mark UPI paid.");

  const unauthInstructions = await request(`/api/orders/${checkoutBody.orderId}/payment-instructions`);
  assert(unauthInstructions.status === 401, "Expected customer payment instructions to require customer auth.");

  await PaymentAccountModel.updateOne(
    { _id: paymentAccountId },
    { $set: { "qrAsset.publicId": `freshflower/test/${runId}-qr-replaced`, "qrAsset.secureUrl": "https://res.cloudinary.com/demo/image/upload/sample2.jpg" } },
  ).lean();
  const initialAttempt = await PaymentAttemptModel.findOne({ orderId: checkoutBody.orderId }).lean<{ paymentAccountSnapshot?: { qrAsset?: { publicId?: string } } }>();
  assert(initialAttempt?.paymentAccountSnapshot?.qrAsset?.publicId?.endsWith("qr-original"), "Expected QR replacement not to alter existing order snapshot.");

  const invalidForm = new FormData();
  invalidForm.append("upiTransactionRef", `INVALID-${runId}`);
  invalidForm.append("submissionRequestId", `submit-invalid-${runId}`);
  invalidForm.append("screenshot", new File([new Uint8Array([1, 2, 3])], "fake.png", { type: "image/png" }));
  const invalidSubmit = await request(`/api/orders/${checkoutBody.orderId}/payment-attempts`, {
    method: "POST",
    headers: { Cookie: customerCookie },
    body: invalidForm,
  });
  assert(invalidSubmit.status === 400, "Expected invalid screenshot content to be rejected.");

  const submissionRequestId = `submit-${runId}`;
  const submitForm = new FormData();
  submitForm.append("upiTransactionRef", `UTR-${runId}`);
  submitForm.append("submissionRequestId", submissionRequestId);
  submitForm.append("screenshot", pngFile());
  const submit = await request(`/api/orders/${checkoutBody.orderId}/payment-attempts`, {
    method: "POST",
    headers: { Cookie: customerCookie },
    body: submitForm,
  });
  const submitBody = await json<{ attemptId: string; state: string }>(submit);
  assert(submit.ok, `Expected payment submission to succeed: ${JSON.stringify(submitBody)}`);
  assert(submitBody.state === "verification_pending", "Expected payment state to become verification_pending.");

  const duplicateSubmit = await request(`/api/orders/${checkoutBody.orderId}/payment-attempts`, {
    method: "POST",
    headers: { Cookie: customerCookie },
    body: submitForm,
  });
  const duplicateSubmitBody = await json<{ attemptId: string; idempotent?: boolean }>(duplicateSubmit);
  assert(duplicateSubmitBody.attemptId === submitBody.attemptId && duplicateSubmitBody.idempotent, "Expected duplicate payment submission to be idempotent.");

  const outboxCount = await EmailOutboxModel.countDocuments({ paymentAttemptId: submitBody.attemptId });
  assert(outboxCount === 1, "Expected exactly one admin email outbox job for the submission.");

  const screenshotAttempt = await PaymentAttemptModel.findById(submitBody.attemptId).lean<{ screenshotAsset?: { publicId?: string; deliveryType?: string } }>();
  assert(screenshotAttempt?.screenshotAsset?.deliveryType === "authenticated", "Expected screenshot to be stored as authenticated Cloudinary evidence.");
  const evidenceUnauth = await request(`/api/payment-evidence?publicId=${encodeURIComponent(screenshotAttempt.screenshotAsset.publicId ?? "")}`);
  assert(evidenceUnauth.status === 401, "Expected payment evidence endpoint to require authorized access.");
  const evidenceAuth = await request(`/api/payment-evidence?publicId=${encodeURIComponent(screenshotAttempt.screenshotAsset.publicId ?? "")}`, { headers: { Cookie: customerCookie } });
  assert(evidenceAuth.ok, "Expected rightful customer to receive signed evidence URL.");

  process.env.SMTP_USER = "invalid@example.com";
  process.env.SMTP_APP_PASSWORD = "invalid-app-password";
  let failedEmailEvent = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await processPaymentEmailOutbox({ limit: 20 });
    failedEmailEvent = await DurablePaymentEventModel.findOne({ paymentAttemptId: submitBody.attemptId, type: "payment.email_failed" }).lean();
    if (failedEmailEvent) break;
  }
  assert(failedEmailEvent, "Expected SMTP failure to be logged while submission remains saved.");
  const stillSubmitted = await PaymentAttemptModel.findById(submitBody.attemptId).lean<{ state?: string }>();
  assert(stillSubmitted?.state === "verification_pending", "Expected email failure not to undo payment submission.");

  const failedJob = await EmailOutboxModel.findOne({ paymentAttemptId: submitBody.attemptId, kind: "payment-verification-required" }).lean<{
    _id: string;
    status?: string;
    attemptCount?: number;
  }>();
  assert(failedJob?.status === "pending" || failedJob?.status === "failed", "Expected failed SMTP job to stay retryable.");

  const adminRetry = await request(`/api/admin/payment-email-outbox/${encodeURIComponent(failedJob?._id ?? "")}/retry`, {
    method: "POST",
    headers: { Cookie: adminCookie },
  });
  assert(adminRetry.ok, `Expected admin email retry to succeed: ${JSON.stringify(await json(adminRetry))}`);
  const retriedJob = await EmailOutboxModel.findById(failedJob?._id).lean<{ status?: string; attemptCount?: number; failureReason?: string }>();
  assert(
    retriedJob?.status === "pending" && retriedJob.attemptCount === 0 && !retriedJob.failureReason,
    "Expected admin retry to reset the job so the worker can pick it up again.",
  );

  const unauthorizedRetry = await request(`/api/admin/payment-email-outbox/${encodeURIComponent(failedJob?._id ?? "")}/retry`, {
    method: "POST",
  });
  assert(unauthorizedRetry.status === 401, "Expected email retry endpoint to reject unauthenticated requests.");

  const genericPaid = await request(`/api/admin/orders/${checkoutBody.orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ paymentStatus: "paid" }),
  });
  assert(genericPaid.status === 409, "Expected generic order API not to mark UPI paid.");

  const correction = await request(`/api/admin/payment-attempts/${submitBody.attemptId}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ decision: "correction_requested", correctionReason: "Reference did not match received funds." }),
  });
  assert(correction.ok, "Expected admin correction request to succeed.");

  const resubmitRequestId = `submit-correction-${runId}`;
  const resubmitForm = new FormData();
  resubmitForm.append("upiTransactionRef", `UTR-CORRECTED-${runId}`);
  resubmitForm.append("submissionRequestId", resubmitRequestId);
  const resubmit = await request(`/api/orders/${checkoutBody.orderId}/payment-attempts`, {
    method: "POST",
    headers: { Cookie: customerCookie },
    body: resubmitForm,
  });
  const resubmitBody = await json<{ attemptId: string }>(resubmit);
  assert(resubmit.ok && resubmitBody.attemptId !== submitBody.attemptId, "Expected correction resubmission to create a new attempt.");

  const approve = await request(`/api/admin/payment-attempts/${resubmitBody.attemptId}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ decision: "approved" }),
  });
  assert(approve.ok, "Expected admin approval to succeed.");
  const paidOrder = await OrderModel.findById(checkoutBody.orderId).lean<{ paymentStatus?: string; paymentState?: string }>();
  assert(paidOrder?.paymentStatus === "paid" && paidOrder.paymentState === "paid", "Expected only admin verification to mark UPI paid.");

  const adminPayment = await request(`/api/admin/orders/${checkoutBody.orderId}/payment`, { headers: { Cookie: adminCookie } });
  const adminPaymentBody = await json<{ attempts?: Array<{ id: string }>; events?: Array<{ id: string; createdAt: string }> }>(adminPayment);
  assert(adminPayment.ok, "Expected admin payment aggregate to load.");
  assert((adminPaymentBody.attempts?.length ?? 0) >= 2, "Expected admin payment aggregate to include every attempt.");
  assert((adminPaymentBody.events?.length ?? 0) >= 1, "Expected admin payment aggregate to include payment events.");
  for (const event of adminPaymentBody.events ?? []) {
    assert(
      typeof formatAppDateTime(event.createdAt, { dateStyle: "medium", timeStyle: "short" }) === "string",
      "Expected admin timeline timestamps to format without throwing.",
    );
    assert(
      typeof formatAppDate(event.createdAt, { dateStyle: "medium", timeStyle: "short" }) === "string",
      "Expected date formatting to tolerate time options.",
    );
  }

  const codCheckout = await request("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ ...checkoutPayload, checkoutRequestId: `checkout-cod-${runId}`, paymentMethod: "cod", paymentAccountId: undefined }),
  });
  assert(codCheckout.ok, "Expected existing COD checkout flow to remain functional.");

  console.log(`Manual UPI focused checks passed for order ${checkoutBody.orderNumber}.`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
