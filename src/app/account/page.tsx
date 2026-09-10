import AccountContent from "@/components/sections/AccountContent";
import {
  getCustomers,
  getFlowers,
  getOrders,
  getReviews,
} from "@/lib/db/repositories";
export const metadata = {
  title: "My account | FreshFlower.zone",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const customers = await getCustomers();
  const flowers = await getFlowers();
  const orders = await getOrders();
  const reviews = await getReviews();
  const demo = customers[0];
  return (
    <AccountContent
      mode="overview"
      customer={demo}
      orders={orders.filter((order) => order.customerId === demo.id)}
      flowers={flowers}
      reviews={reviews.filter((review) =>
        review.customerName.startsWith("Ananya"),
      )}
    />
  );
}
