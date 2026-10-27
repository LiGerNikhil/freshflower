import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";
import { OrderStatusStepper } from "@/components/sections/OrderStatusStepper";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import { AccountShell } from "@/components/sections/AccountShell";
import { getAccountPageData } from "@/lib/account/account-page-data";
import { dbConnect } from "@/lib/db/connect";
import { DurablePaymentEventModel } from "@/lib/db/models";
import { getFlowers, getOrderById, getOrders, serializeList } from "@/lib/db/repositories";
import { resolveProductImage } from "@/lib/product-media";
import { formatAppDate, formatAppDateTime } from "@/lib/utils";
import type { PaymentEvent } from "@/lib/types";

const paymentEventLabels: Record<string, string> = {
  "payment.submitted": "Payment submitted",
  "payment.screenshot_uploaded": "Payment proof uploaded",
  "payment.email_sent": "Payment email sent",
  "payment.email_failed": "Payment email failed",
  "payment.verified": "Payment verified",
  "payment.correction_requested": "Correction requested",
  "payment.authorized": "Payment authorized",
  "payment.captured": "Payment captured",
  "payment.failed": "Payment attempt failed",
};

export const metadata = {
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface OrderDetailProps {
  params: Promise<{ orderId: string }>;
}
export async function generateStaticParams() {
  const orders = await getOrders();
  return orders
    .filter((order) => order.customerId === "cust-1")
    .map((order) => ({ orderId: order.id }));
}
export default async function AccountOrderDetailPage({
  params,
}: OrderDetailProps) {
  const { orderId } = await params;
  const { customer } = await getAccountPageData();
  const order = await getOrderById(orderId);
  const flowers = await getFlowers();
  if (!order || order.customerId !== customer.id) notFound();
  await dbConnect();
  const paymentEvents = await DurablePaymentEventModel.find({ orderId: order.id })
    .sort({ createdAt: 1 })
    .lean();
  const events = serializeList<PaymentEvent>(paymentEvents);
  return (
    <AccountShell title={`Order ${order.orderNumber}`} eyebrow="Order detail">
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft"
      >
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <div className="rounded-xl bg-white/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-soft">
              Placed {formatAppDate(order.createdAt, { dateStyle: "medium" })}
            </p>
            <p className="mt-2 text-2xl font-bold">
              ₹{order.total.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-sm text-ink-soft">
            Delivery {formatAppDate(order.deliveryDate, { dateStyle: "medium" })}
          </p>
        </div>
        <div className="mt-10">
          <OrderStatusStepper status={order.status} />
        </div>
      </div>
      {order.paymentMethod === "online" && (
        <div className="mt-5 rounded-xl bg-white/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <CreditCard size={20} className="text-gold" />
              {order.source === "diwali" ? "Advance payment" : "Payment"}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                order.paymentStatus === "paid"
                  ? "bg-sage/50 text-sage-ink"
                  : order.paymentStatus === "refunded"
                    ? "bg-ink/10 text-ink-soft"
                    : "bg-gold/20 text-ink"
              }`}
            >
              {order.paymentStatus === "paid" && <BadgeCheck size={13} />}
              {order.paymentStatus ?? "pending"}
            </span>
          </div>
          {order.source === "diwali" && (
            <p className="mt-2 inline-flex rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold text-ink">
              Diwali advance booking{order.bookingReference ? ` · ${order.bookingReference}` : ""}
            </p>
          )}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                {order.paymentStatus === "paid" ? "Amount paid" : "Advance amount"}
              </dt>
              <dd className="mt-0.5 font-semibold">₹{order.total.toLocaleString("en-IN")}</dd>
              {order.source === "diwali" && order.deliveryFee > 0 && (
                <dd className="mt-0.5 text-[11px] text-ink-soft">
                  Includes ₹{order.deliveryFee.toLocaleString("en-IN")} Porter delivery
                </dd>
              )}
              {order.discount > 0 && (
                <dd className="mt-0.5 text-[11px] text-sage-ink">
                  Includes ₹{order.discount.toLocaleString("en-IN")} cart reward
                </dd>
              )}
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Transaction ID</dt>
              <dd className="mt-0.5 break-all font-mono text-xs">{order.razorpayPaymentId ?? "Not captured yet"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Payment mode</dt>
              <dd className="mt-0.5">{order.razorpayPaymentMethod ? order.razorpayPaymentMethod.toUpperCase() : "Razorpay"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Paid at</dt>
              <dd className="mt-0.5">
                {order.paidAt
                  ? formatAppDateTime(order.paidAt, { dateStyle: "medium", timeStyle: "short" })
                  : order.paymentStatus === "paid"
                    ? "Recorded"
                    : "Awaiting payment"}
              </dd>
            </div>
          </dl>
          {order.paymentStatus === "paid" ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-sage/30 px-3 py-2 text-xs leading-5 text-sage-ink">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              Payment verified with Razorpay and your booking is confirmed.
            </p>
          ) : (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-gold/10 px-3 py-2 text-xs leading-5 text-ink-soft">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              Your booking is saved. You can retry the advance payment from the Diwali booking page.
            </p>
          )}
          <div className="mt-5 border-t border-ink/10 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Payment events</p>
            {events.length ? (
              <ol className="mt-3 space-y-3">
                {events.map((event) => (
                  <li key={`${event.type}-${event.createdAt}`} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <span>
                      <span className="block font-semibold">
                        {paymentEventLabels[event.type] ?? event.type.replaceAll(".", " ")}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {formatAppDateTime(event.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                        {event.actor ? ` · ${event.actor}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-xs text-ink-soft">No gateway events recorded yet.</p>
            )}
          </div>
        </div>
      )}
      <div className="mt-5 rounded-lg bg-sage p-6">
        <h2 className="font-display text-2xl">
          Delivering to {order.deliveryAddress.label}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {order.deliveryAddress.line1}, {order.deliveryAddress.city} ·{" "}
          {order.deliveryAddress.pincode}
        </p>
      </div>
      <div className="mt-5 divide-y divide-ink/10 rounded-lg bg-white/70 px-6">
{order.items.map((item) => (
          <div
            key={`${item.productId}-${item.color ?? ""}`}
            className="flex items-center gap-3 py-5 text-sm"
          >
            <ProductItemImage
              image={resolveProductImage(item, flowers)}
              name={item.name}
              className="h-14 w-14"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.name}</span>
              <span className="text-ink-soft">
                × {item.quantity}
                {item.color && (
                  <span className="ml-1.5 inline-flex rounded-full bg-ink/5 px-2 py-0.5 font-semibold text-ink">
                    {item.color}
                  </span>
                )}
              </span>
            </span>
            <span className="font-semibold">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}
