"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Search,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";
import { usePhase15 } from "@/components/providers/Phase15Provider";
import { formatINR } from "@/lib/admin/analytics";
import type { Customer } from "@/lib/types";

export function CustomersManager() {
  const { customers, orders, customerSummary } = usePhase15();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.phone.includes(q),
    );
  }, [customers, query]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <User size={13} /> Customers
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {customers.length} customers · synced from the live database.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or phone…"
            aria-label="Search customers"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Total spend</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const summary = customerSummary(customer.id);
                return (
                  <tr
                    key={customer.id}
                    className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-ink">
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {customer.name}
                          </p>
                          <p className="truncate text-xs text-ink-soft">
                            {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${customer.emailVerified ? "bg-sage text-sage-ink" : "bg-gold/20 text-ink"}`}>
                        {customer.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold">
                        {summary.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatINR(summary.totalSpend)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {summary.lastOrder ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        aria-label={`View ${customer.name}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                      >
                        View <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-display text-lg text-ink-soft">
              No customers match.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
