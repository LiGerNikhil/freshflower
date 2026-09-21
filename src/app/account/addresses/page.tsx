import AccountContent from "@/components/sections/AccountContent";
import { getAccountPageData } from "@/lib/account/account-page-data";
export const metadata = {
  title: "Saved addresses | FreshFlower.zone",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AccountAddressesPage() {
  const { customer, flowers, orders, reviews } = await getAccountPageData();
  return (
    <AccountContent
      mode="addresses"
      customer={customer}
      orders={orders}
      flowers={flowers}
      reviews={reviews}
    />
  );
}
