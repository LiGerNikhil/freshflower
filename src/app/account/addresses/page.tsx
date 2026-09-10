import AccountContent from "@/components/sections/AccountContent";
import {
  getCustomers,
  getFlowers,
  getOrders,
  getReviews,
} from "@/lib/db/repositories";
export const metadata = {
  title: "Saved addresses | FreshFlower.zone",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AccountAddressesPage() {
  const customers = await getCustomers();
  const flowers = await getFlowers();
  const orders = await getOrders();
  const reviews = await getReviews();
  const demo = customers[0];
  return (
    <AccountContent
      mode="addresses"
      customer={demo}
      orders={orders.filter((order) => order.customerId === demo.id)}
      flowers={flowers}
      reviews={reviews.filter((review) =>
        review.customerName.startsWith("Ananya"),
      )}
    />
  );
}
