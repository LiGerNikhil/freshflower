"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Clipboard, Clock3, Download, Loader2, MapPin, QrCode, Upload } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import { DELIVERY_CHARGE, DELIVERY_NOTE } from "@/lib/cart";

interface OrderRecord {
  id: string;
  orderNumber?: string;
  items: Array<{ name: string; quantity: number; price: number; image?: string; color?: string }>;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  payment?: "upi" | "cod" | "online";
  delivery: {
    areaName?: string;
    date: string;
    slotLabel?: string;
    address: string;
    city: string;
  };
}

type Asset = { publicId: string; secureUrl: string; resourceType: "image"; version?: string };
type ActiveAccount = {
  id: string;
  label: string;
  receiverName: string;
  upiId: string;
  defaultAccount?: boolean;
  qrAsset: Asset;
};
type AccountSnapshot = {
  accountId: string;
  label: string;
  receiverName: string;
  upiId: string;
  qrAsset: Asset;
};
type PaymentInstructions = {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    currency: "INR";
    paymentMethod?: string;
    paymentStatus?: string;
    paymentState?: string;
  };
  selectedAccount: AccountSnapshot | null;
  canSwitchAccount: boolean;
  accounts: ActiveAccount[];
};

export default function OrderConfirmationClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [payment, setPayment] = useState<PaymentInstructions | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [paidFormOpen, setPaidFormOpen] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submissionRequestId, setSubmissionRequestId] = useState(() => `pay-submit-${Date.now().toString(36)}-${crypto.randomUUID()}`);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { clearCart } = useCart();
  const hydratedOrderId = useRef<string | null>(null);

  async function loadPaymentInstructions() {
    setLoadingPayment(true);
    setPaymentError("");
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-instructions`);
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not load payment instructions.");
      setPayment(body as PaymentInstructions);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Could not load payment instructions.");
    } finally {
      setLoadingPayment(false);
    }
  }

  useEffect(() => {
    if (hydratedOrderId.current === orderId) return;
    const saved = sessionStorage.getItem(`freshflower-order-${orderId}`);
    if (saved) {
      hydratedOrderId.current = orderId;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(JSON.parse(saved) as OrderRecord);
      clearCart();
    }
  }, [clearCart, orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPaymentInstructions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  async function selectAccount(accountId: string) {
    if (!payment?.canSwitchAccount) return;
    setPaymentError("");
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-instructions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentAccountId: accountId }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not change payment account.");
      await loadPaymentInstructions();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Could not change payment account.");
    }
  }

  async function submitPaymentEvidence() {
    if (!transactionRef.trim()) {
      setPaymentError("Enter the UPI transaction reference.");
      return;
    }
    setSubmitting(true);
    setPaymentError("");
    try {
      const form = new FormData();
      form.append("upiTransactionRef", transactionRef.trim());
      form.append("submissionRequestId", submissionRequestId);
      if (screenshot) form.append("screenshot", screenshot);
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-attempts`, {
        method: "POST",
        body: form,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not submit payment details.");
      setSubmitted(true);
      setPaidFormOpen(false);
      setTransactionRef("");
      setScreenshot(null);
      setSubmissionRequestId(`pay-submit-${Date.now().toString(36)}-${crypto.randomUUID()}`);
      await loadPaymentInstructions();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Could not submit payment details.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!order && loadingPayment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-5 text-center">
        <div>
          <h1 className="text-4xl">Loading your booking...</h1>
          <p className="mt-3 text-sm text-ink-soft">Your order is being retrieved.</p>
        </div>
      </main>
    );
  }

  const subtotal = order?.subtotal ?? order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const deliveryFee = order?.deliveryFee ?? DELIVERY_CHARGE;
  const total = payment?.order.total ?? order?.total ?? subtotal + deliveryFee;
  const selectedAccount = payment?.selectedAccount ?? null;
  const isUpiOrder = payment?.order.paymentMethod === "upi" || order?.payment === "upi";
  const paymentState = payment?.order.paymentState ?? "awaiting_payment";

  return (
    <main className="min-h-screen bg-ivory px-5 py-10 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[420px_1fr]">
        <aside className="order-first h-fit rounded-2xl border border-ink/10 bg-white/85 p-5 shadow-sm md:p-6 lg:sticky lg:top-6">
          {loadingPayment ? (
            <p className="text-sm text-ink-soft">Loading payment instructions...</p>
          ) : !isUpiOrder ? (
            <div className="text-sm leading-6 text-ink-soft">
              <p className="font-semibold text-ink">Payment method: Cash / Pay on Delivery</p>
              <p className="mt-2">No online payment evidence is required for this order.</p>
            </div>
          ) : selectedAccount ? (
            <div>
              <div className="rounded-lg border border-gold/30 bg-gold/15 px-4 py-3">
                <p className="text-sm font-bold text-ink">
                  Payment required — pay ₹{total.toLocaleString("en-IN")} to confirm your order
                </p>
                <p className="mt-1 text-xs leading-5 text-ink/70">
                  Your order is on hold until our team verifies your payment. Please pay the
                  amount below, then submit the UPI reference.
                </p>
              </div>
              <p className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold"><QrCode size={13} /> Manual UPI payment</p>
              <h2 className="mt-2 font-display text-3xl">Pay ₹{total.toLocaleString("en-IN")}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Payment is confirmed only after admin verification. UPI app return screens, screenshots, or references are not automatic proof of payment.</p>

              {payment?.accounts.length && payment.accounts.length > 1 && (
                <label className="mt-5 block text-sm font-semibold">
                  Payment account
                  <select disabled={!payment.canSwitchAccount} value={selectedAccount.accountId} onChange={(event) => void selectAccount(event.target.value)} className="mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm disabled:opacity-60">
                    {payment.accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.label}{account.defaultAccount ? " (default)" : ""}</option>
                    ))}
                  </select>
                  {!payment.canSwitchAccount && <span className="mt-1 block text-xs text-ink-soft">Account selection is locked after payment evidence is submitted.</span>}
                </label>
              )}

              <div className="mt-5 rounded-xl border border-ink/10 bg-ivory-deep/40 p-4 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedAccount.qrAsset.secureUrl} alt="Selected UPI QR" className="mx-auto h-56 w-56 rounded-md bg-white object-contain" />
                <a href={selectedAccount.qrAsset.secureUrl} download className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gold hover:text-ink"><Download size={13} /> Download QR</a>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <InfoRow label="Order number" value={payment.order.orderNumber} />
                <InfoRow label="Receiver" value={selectedAccount.receiverName} />
                <InfoRow label="UPI ID" value={selectedAccount.upiId} />
                <InfoRow label="Amount" value={`₹${total.toLocaleString("en-IN")}`} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => void copy(selectedAccount.upiId)} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-gold"><Clipboard size={14} /> Copy UPI ID</button>
                <button type="button" onClick={() => void copy(String(total))} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-gold"><Clipboard size={14} /> Copy Amount</button>
              </div>

              <details className="group mt-4 rounded-lg border border-ink/10 bg-ivory-deep/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  How to pay
                  <ChevronDown size={15} className="shrink-0 text-gold transition-transform group-open:rotate-180" />
                </summary>
                <ol className="space-y-3 px-4 pb-4">
                  <li className="flex items-start gap-3 text-sm leading-5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-ivory">1</span>
                    <span className="text-ink-soft">Open any UPI app (GPay, PhonePe, Paytm or BHIM).</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-ivory">2</span>
                    <span className="text-ink-soft">Scan the QR above (or pay to the UPI ID) and enter <strong className="text-ink">₹{total.toLocaleString("en-IN")}</strong> — the exact amount.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-ivory">3</span>
                    <span className="text-ink-soft">From the success screen, copy the <strong className="text-ink">UTR / reference number</strong>.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm leading-5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-ivory">4</span>
                    <span className="text-ink-soft">Tap <strong className="text-ink">“I have paid”</strong> below, enter the UTR / reference (a screenshot is optional), then submit. Our team verifies it and confirms your order.</span>
                  </li>
                </ol>
              </details>

              {paymentError && <p role="alert" className="mt-4 rounded-md bg-blush px-3 py-2 text-sm font-semibold text-red-800">{paymentError}</p>}
              {submitted && <p className="mt-4 rounded-md bg-sage px-3 py-2 text-sm font-semibold text-sage-ink">Payment details submitted for admin verification.</p>}

              {paymentState === "verification_pending" ? (
                <p className="mt-5 rounded-md bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">Verification pending. Our admin team will review your UPI reference and screenshot if provided.</p>
              ) : (
                <div className="mt-5">
                  {!paidFormOpen ? (
                    <button type="button" onClick={() => setPaidFormOpen(true)} className="w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft">I have paid</button>
                  ) : (
                    <div className="rounded-xl border border-ink/10 bg-white p-4">
                      <label className="block text-sm font-semibold">
                        UPI transaction reference <span className="text-red-700">*</span>
                        <input value={transactionRef} onChange={(event) => setTransactionRef(event.target.value)} placeholder="Enter UTR / UPI ref no." className="mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                      </label>
                      <label className="mt-4 block text-sm font-semibold">
                        Payment screenshot <span className="font-normal text-ink-soft">optional</span>
                        <span className="mt-2 flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-dashed border-ink/20 px-3 py-2 text-sm text-ink-soft hover:border-gold">
                          <Upload size={14} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate" title={screenshot?.name}>
                            {screenshot ? screenshot.name : "Choose screenshot"}
                          </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            if (file && file.size > 5 * 1024 * 1024) {
                              setPaymentError("Screenshot must be 5 MB or smaller. You can submit without a screenshot if needed.");
                              setScreenshot(null);
                              return;
                            }
                            setPaymentError("");
                            setScreenshot(file);
                          }}
                          className="sr-only"
                        />
                      </span>
                      <span className="mt-1 block text-xs font-normal text-ink-soft">JPEG, PNG, or WebP up to 5 MB. If upload fails, retry or submit without screenshot.</span>
                      </label>
                      <button type="button" disabled={submitting} onClick={() => void submitPaymentEvidence()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-gold-soft disabled:opacity-60">
                        {submitting && <Loader2 size={15} className="animate-spin" />} Submit for verification
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Payment instructions are unavailable. Please contact support with order {orderId}.</p>
          )}

          <Link href="/flowers" className="mt-6 inline-flex w-full justify-center rounded-md border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-gold">Continue shopping</Link>
        </aside>

        <section className="order-last">
          <div className="rounded-2xl bg-white/75 p-6 text-center shadow-sm md:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage">
              <Check size={30} className="text-sage-ink" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">Booking received</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">Order created successfully.</h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              Order <strong className="text-ink">{payment?.order.orderNumber ?? order?.orderNumber ?? orderId}</strong> is saved.
              {isUpiOrder
                ? <> Your order will be confirmed once you pay the <strong className="text-ink">₹{total.toLocaleString("en-IN")}</strong> shown above and our team verifies it.</>
                : " We'll use the details below to prepare the next step."}
            </p>
          </div>

          {order && (
            <div className="mt-6 rounded-xl bg-white/70 p-6 text-left">
              <div className="flex items-start gap-3 border-b border-ink/10 pb-5">
                <Clock3 className="mt-1 text-gold" size={20} />
                <div>
                  <p className="font-semibold">{order.delivery.date} · {order.delivery.slotLabel}</p>
                  <p className="mt-1 text-sm text-ink-soft">{order.delivery.areaName}</p>
                  <p className="mt-2 text-xs font-semibold text-sage-ink">Your order will be delivered by Porter.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-ink/10 py-5">
                <MapPin className="mt-1 text-gold" size={20} />
                <div>
                  <p className="font-semibold">Delivering to</p>
                  <p className="mt-1 text-sm text-ink-soft">{order.delivery.address}, {order.delivery.city}</p>
                </div>
              </div>
              <div className="divide-y divide-ink/10 border-b border-ink/10 py-2">
                {order.items.map((item, index) => (
                  <div key={`${item.name}-${item.color ?? ""}-${index}`} className="flex items-center gap-3 py-3 text-sm">
                    <ProductItemImage image={item.image} name={item.name} className="h-14 w-14" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{item.name}</span>
                      <span className="text-ink-soft">x {item.quantity}{item.color ? ` · ${item.color}` : ""}</span>
                    </span>
                    <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-5 text-sm">
                <div className="flex justify-between"><span className="text-ink-soft">Flowers total</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-ink-soft">Porter delivery charge</span><span>₹{deliveryFee.toLocaleString("en-IN")}</span></div>
                <p className="text-xs leading-5 text-ink-soft">{DELIVERY_NOTE}</p>
              </div>
              <div className="mt-4 flex justify-between border-t border-ink/10 pt-5 text-lg font-bold"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink/5 pb-2 last:border-0">
      <span className="text-ink-soft">{label}</span>
      <span className="break-all text-right font-semibold text-ink">{value}</span>
    </div>
  );
}
