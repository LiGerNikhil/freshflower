"use client";

type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type CheckoutOptions = {
  key: string; amount: number; currency: string; order_id: string; name: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: PaymentResponse) => void;
  modal: { ondismiss: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => {
      open: () => void;
      close: () => void;
      on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

let scriptPromise: Promise<void> | undefined;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); scriptPromise = undefined; reject(new Error("Could not load Razorpay. Please check your connection and retry.")); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

async function post(url: string, data: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Payment request failed.");
  return body;
}

export async function payWithRazorpay(orderId: string, prefill?: CheckoutOptions["prefill"]) {
  await loadCheckout();
  // Keep the signed result for retrying verification after network/capture delays.
  const storageKey = `razorpay-result-${orderId}`;
  const previous = sessionStorage.getItem(storageKey);
  if (previous) {
    await post("/api/verify-payment", JSON.parse(previous));
    sessionStorage.removeItem(storageKey);
    return;
  }
  const order = await post("/api/create-order", { orderId });
  if (order.alreadyPaid) return;
  return new Promise<void>((resolve, reject) => {
    if (!window.Razorpay) return reject(new Error("Razorpay is unavailable. Please retry."));
    let verifying = false;
    const checkout = new window.Razorpay({
      key: order.key_id, amount: order.amount, currency: order.currency, order_id: order.order_id,
      name: "FreshFlower.zone", prefill,
      handler: async (result) => {
        verifying = true;
        sessionStorage.setItem(storageKey, JSON.stringify(result));
        try {
          await post("/api/verify-payment", result);
          sessionStorage.removeItem(storageKey);
          resolve();
        } catch (error) { reject(error); }
      },
      modal: { ondismiss: () => { if (!verifying) reject(new Error("Payment cancelled. Your order is saved; you can retry payment.")); } },
    });
    checkout.on("payment.failed", response => {
      reject(new Error(response.error?.description ?? "Payment failed. Please try again."));
      checkout.close();
    });
    checkout.open();
  });
}
