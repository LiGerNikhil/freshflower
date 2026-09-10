"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";
import { usePhase15 } from "@/components/providers/Phase15Provider";
import { formatINR } from "@/lib/admin/analytics";
import type {
  Customer,
  Order,
  Review,
  WholesaleEnquiry,
  WeddingEnquiry,
  ContactEnquiry,
} from "@/lib/types";

export function CustomerDetail({ customerId }: { customerId: string }) {
  const {
    customers,
    orders,
    reviews,
    wholesaleEnquiries,
    weddingEnquiries,
    contactEnquiries,
    customerSummary,
  } = usePhase15();

  const customer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId],
  );

  const summary = useMemo(
    () => (customer ? customerSummary(customerId) : null),
    [customer, customerId, customerSummary],
  );

  const customerOrders = useMemo(
    () => orders.filter((order) => order.customerId === customerId),
    [orders, customerId],
  );

  const customerReviews = useMemo(
    () =>
      reviews.filter(
        (review) => review.customerName === customer?.name,
      ),
    [reviews, customer?.name],
  );

  // Enquiries matched by email or name.
  const matchedEnquiries = useMemo<{
    wholesale: WholesaleEnquiry[];
    wedding: WeddingEnquiry[];
    contact: ContactEnquiry[];
  }>(() => {
    const empty = {
      wholesale: [] as WholesaleEnquiry[],
      wedding: [] as WeddingEnquiry[],
      contact: [] as ContactEnquiry[],
    };
    if (!customer) return empty;
    const email = customer.email.toLowerCase();
    const name = customer.name.toLowerCase();
    const match = (e: {
      email: string;
      contactName?: string;
      clientName?: string;
      name?: string;
    }) => {
      const eEmail = (e.email || "").toLowerCase();
      const eNames = [
        e.contactName,
        e.clientName,
        e.name,
      ]
        .filter(Boolean)
        .map((n) => (n || "").toLowerCase());
      return eEmail === email || eNames.some((n) => n === name);
    };
    return {
      wholesale: wholesaleEnquiries.filter(match),
      wedding: weddingEnquiries.filter(match),
      contact: contactEnquiries.filter(match),
    };
  }, [customer, wholesaleEnquiries, weddingEnquiries, contactEnquiries]);

  if (!customer || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-deep">
        <p className="font-display text-xl text-ink-soft">
          Customer not found.
        </p>
      </div>
    );
  }

  const totalEnquiries =
    matchedEnquiries.wholesale.length +
    matchedEnquiries.wedding.length +
    matchedEnquiries.contact.length;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to customers
        </Link>
      </div>

      <div className="mb-8 rounded-xl border border-ink/10 bg-white/80 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blush text-ink">
            <User size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl">{customer.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{customer.id}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-ink-soft" />{" "}
            <span className="text-ink-soft">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-4 w-4 items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </span>{" "}
            <span className="text-ink-soft">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-ink-soft" />{" "}
            <span className="text-ink-soft">
              Joined{" "}
              {new Date(customer.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart size={16} className="text-ink-soft" />{" "}
            <span className="font-semibold">
              {summary.totalOrders} orders · {formatINR(summary.totalSpend)}
            </span>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl">
          Orders ({customerOrders.length})
        </h2>
        {customerOrders.length === 0 ? (
          <p className="text-sm text-ink-soft">No orders found.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {order.deliveryDate}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {order.items.length} item(s)
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatINR(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-sm bg-sage px-2 py-0.5 text-[10px] font-semibold text-sage-ink">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl">
          Enquiries ({totalEnquiries})
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {matchedEnquiries.wholesale.map((enquiry) => (
            <div
              key={enquiry.id}
              className="rounded-lg bg-white/70 p-4"
            >
              <span className="inline-flex items-center rounded-sm bg-lavender/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-lavender-ink">
                Wholesale
              </span>
              <p className="mt-2 font-semibold">{enquiry.businessName}</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft line-clamp-2">
                {enquiry.message}
              </p>
              <p className="mt-2 text-xs text-ink-soft">
                {new Date(enquiry.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
          {matchedEnquiries.wedding.map((enquiry) => (
            <div
              key={enquiry.id}
              className="rounded-lg bg-white/70 p-4"
            >
              <span className="inline-flex items-center rounded-sm bg-lavender/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-lavender-ink">
                Wedding
              </span>
              <p className="mt-2 font-semibold">{enquiry.clientName}</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft line-clamp-2">
                {enquiry.message}
              </p>
              <p className="mt-2 text-xs text-ink-soft">
                {new Date(enquiry.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
          {matchedEnquiries.contact.map((enquiry) => (
            <div
              key={enquiry.id}
              className="rounded-lg bg-white/70 p-4"
            >
              <span className="inline-flex items-center rounded-sm bg-lavender/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-lavender-ink">
                Contact
              </span>
              <p className="mt-2 font-semibold">{enquiry.name}</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft line-clamp-2">
                {enquiry.message}
              </p>
              <p className="mt-2 text-xs text-ink-soft">
                {new Date(enquiry.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
          {totalEnquiries === 0 && (
            <p className="text-sm text-ink-soft">No enquiries found.</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl">
          Reviews ({customerReviews.length})
        </h2>
        {customerReviews.length === 0 ? (
          <p className="text-sm text-ink-soft">No reviews found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {customerReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg bg-white/70 p-5"
              >
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  {review.comment}
                </p>
                <p className="mt-3 text-xs text-ink-soft">
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  {review.status && (
                    <span className="ml-2 rounded-sm bg-sage/60 px-2 py-0.5 text-[10px] font-semibold text-sage-ink">
                      {review.status}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}