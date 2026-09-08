import type { Metadata } from "next";
import OrderConfirmationClient from "@/components/sections/OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order confirmation | FreshFlower.zone",
  robots: { index: false, follow: false },
};

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}
export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { orderId } = await params;
  return <OrderConfirmationClient orderId={orderId} />;
}
