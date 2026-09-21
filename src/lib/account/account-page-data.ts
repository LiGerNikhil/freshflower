import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from "@/lib/auth/customer-session";
import { getCustomerById, getFlowers, getOrders, getReviews } from "@/lib/db/repositories";

export async function getAccountPageData() {
  const cookieStore = await cookies();
  const session = await verifyCustomerSessionToken(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!session) redirect("/login?returnUrl=/account");

  const [customer, flowers, orders, reviews] = await Promise.all([
    getCustomerById(session.customerId),
    getFlowers(),
    getOrders(),
    getReviews(),
  ]);
  if (!customer) redirect("/login?returnUrl=/account");

  return {
    customer,
    flowers,
    orders: orders.filter((order) => order.customerId === customer.id),
    reviews: reviews.filter((review) => review.customerName.startsWith(customer.name.split(" ")[0] ?? customer.name)),
  };
}
