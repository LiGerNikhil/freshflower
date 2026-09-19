import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderStatusStepper } from "@/components/sections/OrderStatusStepper";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import { AccountShell } from "@/components/sections/AccountShell";
import { getCustomers, getFlowers, getOrderById, getOrders } from "@/lib/db/repositories";
import { resolveProductImage } from "@/lib/product-media";

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
  const customers = await getCustomers();
  const order = await getOrderById(orderId);
  const flowers = await getFlowers();
  if (!order || order.customerId !== customers[0].id) notFound();
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
              Placed {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
            <p className="mt-2 text-2xl font-bold">
              ₹{order.total.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-sm text-ink-soft">Delivery {order.deliveryDate}</p>
        </div>
        <div className="mt-10">
          <OrderStatusStepper status={order.status} />
        </div>
      </div>
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
            key={item.productId}
            className="flex items-center gap-3 py-5 text-sm"
          >
            <ProductItemImage
              image={resolveProductImage(item, flowers)}
              name={item.name}
              className="h-14 w-14"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.name}</span>
              <span className="text-ink-soft">× {item.quantity}</span>
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
