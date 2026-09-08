import AccountContent from "@/components/sections/AccountContent";
import { customers, flowers, orders, reviews } from "@/lib/data";
const demo = customers[0];
export const metadata = {
  title: "Notifications | FreshFlower.zone",
  robots: { index: false, follow: false },
};
export default function AccountNotificationsPage() {
  return (
    <AccountContent
      mode="notifications"
      customer={demo}
      orders={orders.filter((order) => order.customerId === demo.id)}
      flowers={flowers}
      reviews={reviews.filter((review) =>
        review.customerName.startsWith("Ananya"),
      )}
    />
  );
}
