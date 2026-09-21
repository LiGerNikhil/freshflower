import dotenv from "dotenv";
import { getFlowers } from "../src/lib/db/repositories";

dotenv.config({ path: ".env.local" });

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const requestTimeoutMs = Number(process.env.E2E_TIMEOUT_MS ?? 15_000);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function cookieHeaderFrom(response: Response): string {
  const setCookie = response.headers.get("set-cookie");
  assert(setCookie, "Expected auth response to set a session cookie.");
  return setCookie
    .split(/,(?=\s*[^;]+=)/)
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function request(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(requestTimeoutMs) });
}

function realInboxAddress(): string {
  const smtpUser = process.env.SMTP_USER;
  assert(smtpUser, "SMTP_USER is required for real-inbox E2E email testing.");
  const [local, domain] = smtpUser.split("@");
  assert(local && domain, "SMTP_USER must be an email address.");
  return domain.toLowerCase() === "gmail.com"
    ? `${local}+freshflower-e2e-${Date.now()}@${domain}`
    : smtpUser;
}

async function main() {
  const protectedAccount = await request(`${baseUrl}/account/orders`, { redirect: "manual" });
  assert([302, 307, 308].includes(protectedAccount.status), "Expected /account/orders to redirect when logged out.");
  assert(protectedAccount.headers.get("location")?.includes("/login?returnUrl=%2Faccount%2Forders"), "Expected account redirect to include returnUrl.");

  const browse = await request(`${baseUrl}/flowers`);
  assert(browse.ok, "Expected flowers browse page to load.");

  const products = await getFlowers();
  const product = products.find((item) => item.active !== false && item.id);
  assert(product, "Expected at least one active product.");
  const productId = product.id;
  assert(productId, "Expected product id.");

  const checkoutPayload = {
    customer: {
      name: "E2E Customer",
      phone: "9876543210",
      email: `e2e-${Date.now()}@example.com`,
      address: {
        line: "E2E test address",
        city: "New Delhi",
        areaId: "area-new-delhi",
        pincode: "",
      },
      notes: "E2E smoke test order",
      preferCall: false,
    },
    items: [{ productId, productType: "flower", name: product.name, quantity: 1, price: product.price }],
    deliverySlotId: "default-slot",
    deliveryDate: new Date(Date.now() + 86_400_000).toISOString(),
    coupons: [],
    subtotal: product.price,
    discount: 0,
    deliveryFee: 299,
    total: product.price + 299,
    paymentMethod: "cod",
    agreedToTos: true,
  };

  const unauthenticatedCheckout = await request(`${baseUrl}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutPayload),
  });
  assert(unauthenticatedCheckout.status === 401, "Expected checkout to require login.");

  const email = realInboxAddress();
  const password = "E2E-password-123";
  checkoutPayload.customer.email = email;
  const register = await request(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "E2E Customer", phone: "9876543210", email, password }),
  });
  let cookie = register.ok ? cookieHeaderFrom(register) : "";

  if (!cookie) {
    const login = await request(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert(login.ok, "Expected login after register prompt to succeed.");
    cookie = cookieHeaderFrom(login);
  }

  const checkout = await request(`${baseUrl}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(checkoutPayload),
  });
  const checkoutBody = await json<{ orderId?: string; orderNumber?: string; error?: string }>(checkout);
  assert(checkout.ok, `Expected checkout to succeed: ${checkoutBody.error ?? checkout.status}`);
  assert(checkoutBody.orderNumber, "Expected checkout to return an order number.");

  const paymentSuccess = await request(`${baseUrl}/api/payment/success`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ orderId: checkoutBody.orderId, paymentId: `e2e-${Date.now()}` }),
  });
  const paymentSuccessBody = await json<{ error?: string }>(paymentSuccess);
  assert(paymentSuccess.ok, `Expected payment success callback to send order email: ${paymentSuccessBody.error ?? paymentSuccess.status}`);

  const passwordChange = await request(`${baseUrl}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ oldPassword: password, newPassword: "E2E-password-456" }),
  });
  const passwordChangeBody = await json<{ error?: string }>(passwordChange);
  assert(passwordChange.ok, `Expected password-changed email route to succeed: ${passwordChangeBody.error ?? passwordChange.status}`);

  const history = await request(`${baseUrl}/account/orders`, { headers: { Cookie: cookie } });
  assert(history.ok, "Expected account order history to load.");
  const historyHtml = await history.text();
  assert(historyHtml.includes(checkoutBody.orderNumber), "Expected created order to appear in account history.");

  console.log(`Customer E2E flow passed for ${checkoutBody.orderNumber}; emails sent to ${email}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
