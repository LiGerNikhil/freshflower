"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Coupon,
  ContactEnquiry,
  Customer,
  EnquiryStatus,
  Order,
  Review,
  ReviewStatus,
  WholesaleEnquiry,
  WeddingEnquiry,
} from "@/lib/types";
import {
  coupons as seedCoupons,
  customers as seedCustomers,
  reviews as seedReviews,
  wholesaleEnquiries as seedWholesaleEnquiries,
  weddingEnquiries as seedWeddingEnquiries,
  contactEnquiries as seedContactEnquiries,
} from "@/lib/data";
import { api } from "@/lib/api/client";

// ---- helpers ----

function totalSpendForCustomer(
  customer: Customer,
  orders: Order[],
): number {
  return orders
    .filter((order) => order.customerId === customer.id)
    .reduce((sum, order) => sum + order.total, 0);
}

function lastOrderForCustomer(
  customer: Customer,
  orders: Order[],
): string | null {
  const custOrders = orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return custOrders[0]?.deliveryDate ?? null;
}

// ---- store shape ----

interface Phase15Value {
  customers: Customer[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  wholesaleEnquiries: WholesaleEnquiry[];
  weddingEnquiries: WeddingEnquiry[];
  contactEnquiries: ContactEnquiry[];
  /** Returns total orders, total spend, last order date for a customer. */
  customerSummary: (id: string) => {
    totalOrders: number;
    totalSpend: number;
    lastOrder: string | null;
  };
  // coupons
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  // reviews
  updateReviewStatus: (id: string, status: ReviewStatus) => void;
  // enquiries
  updateEnquiryStatus: (
    kind: "wholesale" | "wedding" | "contact",
    id: string,
    status: EnquiryStatus,
  ) => void;
  deleteEnquiry: (
    kind: "wholesale" | "wedding" | "contact",
    id: string,
  ) => void;
}

const Phase15Context = createContext<Phase15Value | null>(null);

export function Phase15Provider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => seedCustomers);
  const [orders, setOrders] = useState<Order[]>(() => []);
  const [coupons, setCoupons] = useState<Coupon[]>(() => seedCoupons);
  const [reviews, setReviews] = useState<Review[]>(() => seedReviews);
  const [wholesaleEnquiries, setWholesaleEnquiries] =
    useState<WholesaleEnquiry[]>(() => seedWholesaleEnquiries);
  const [weddingEnquiries, setWeddingEnquiries] =
    useState<WeddingEnquiry[]>(() => seedWeddingEnquiries);
  const [contactEnquiries, setContactEnquiries] =
    useState<ContactEnquiry[]>(() => seedContactEnquiries);

  // Phase 17: hydrate customers/orders/coupons/reviews/enquiries from MongoDB
  // so admin edits survive refresh; fall back to seeds when the API is down.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [remoteCustomers, remoteOrders, remoteCoupons, remoteReviews, remoteEnquiries] =
          await Promise.all([
            api("/api/admin/customers"),
            api("/api/admin/orders"),
            api("/api/admin/coupons"),
            api("/api/admin/reviews"),
            api("/api/admin/enquiries"),
          ]);
        if (!mounted) return;
        if (Array.isArray(remoteCustomers) && remoteCustomers.length) setCustomers(remoteCustomers);
        if (Array.isArray(remoteOrders) && remoteOrders.length) setOrders(remoteOrders);
        if (Array.isArray(remoteCoupons) && remoteCoupons.length) setCoupons(remoteCoupons);
        if (Array.isArray(remoteReviews) && remoteReviews.length) setReviews(remoteReviews);
        if (remoteEnquiries && typeof remoteEnquiries === "object") {
          if (Array.isArray(remoteEnquiries.wholesale)) setWholesaleEnquiries(remoteEnquiries.wholesale);
          if (Array.isArray(remoteEnquiries.wedding)) setWeddingEnquiries(remoteEnquiries.wedding);
          if (Array.isArray(remoteEnquiries.contact)) setContactEnquiries(remoteEnquiries.contact);
        }
      } catch {
        // Fall back to the seeded preview.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const customerSummary = useCallback(
    (id: string) => {
      const c = customers.find((customer) => customer.id === id);
      if (!c) return { totalOrders: 0, totalSpend: 0, lastOrder: null };
      const custOrders = orders.filter(
        (order) => order.customerId === id,
      );
      return {
        totalOrders: custOrders.length,
        totalSpend: custOrders.reduce((sum, o) => sum + o.total, 0),
        lastOrder:
          custOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
            ?.deliveryDate ?? null,
      };
    },
    [customers, orders],
  );

  const addCoupon = useCallback((coupon: Coupon) => {
    api("/api/admin/coupons", { method: "POST", body: JSON.stringify(coupon) }).catch(
      () => undefined,
    );
    setCoupons((prev) => [...prev, coupon]);
  }, []);

  const updateCoupon = useCallback((id: string, patch: Partial<Coupon>) => {
    api(`/api/admin/coupons/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => undefined);
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id ? { ...coupon, ...patch } : coupon,
      ),
    );
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    api(`/api/admin/coupons/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
      () => undefined,
    );
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
  }, []);

  const toggleCouponActive = useCallback((id: string) => {
    setCoupons((prev) => {
      const target = prev.find((coupon) => coupon.id === id);
      const active = target ? !target.active : true;
      api(`/api/admin/coupons/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      }).catch(() => undefined);
      return prev.map((coupon) =>
        coupon.id === id ? { ...coupon, active } : coupon,
      );
    });
  }, []);

  const updateReviewStatus = useCallback(
    (id: string, status: ReviewStatus) => {
      api(`/api/admin/reviews/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }).catch(() => undefined);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, status } : review,
        ),
      );
    },
    [],
  );

const updateEnquiryStatus = useCallback(
    (
      kind: "wholesale" | "wedding" | "contact",
      id: string,
      status: EnquiryStatus,
    ) => {
      api(`/api/admin/enquiries/${kind}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }).catch(() => undefined);
      if (kind === "wholesale") {
        setWholesaleEnquiries((prev) =>
          prev.map((item) =>
            (item as { id: string }).id === id
              ? { ...item, status }
              : item,
          ),
        );
      } else if (kind === "wedding") {
        setWeddingEnquiries((prev) =>
          prev.map((item) =>
            (item as { id: string }).id === id
              ? { ...item, status }
              : item,
          ),
        );
      } else {
        setContactEnquiries((prev) =>
          prev.map((item) =>
            (item as { id: string }).id === id
              ? { ...item, status }
              : item,
          ),
        );
      }
    },
    [setWholesaleEnquiries, setWeddingEnquiries, setContactEnquiries],
  );

  const deleteEnquiry = useCallback(
    (kind: "wholesale" | "wedding" | "contact", id: string) => {
      api(`/api/admin/enquiries/${kind}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => undefined);
      if (kind === "wholesale") {
        setWholesaleEnquiries((prev) =>
          prev.filter((item) => (item as { id: string }).id !== id),
        );
      } else if (kind === "wedding") {
        setWeddingEnquiries((prev) =>
          prev.filter((item) => (item as { id: string }).id !== id),
        );
      } else {
        setContactEnquiries((prev) =>
          prev.filter((item) => (item as { id: string }).id !== id),
        );
      }
    },
    [setWholesaleEnquiries, setWeddingEnquiries, setContactEnquiries],
  );

  const value = useMemo<Phase15Value>(
    () => ({
      customers,
      orders,
      coupons,
      reviews,
      wholesaleEnquiries,
      weddingEnquiries,
      contactEnquiries,
      customerSummary,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponActive,
      updateReviewStatus,
      updateEnquiryStatus,
      deleteEnquiry,
    }),
    [
      customers,
      orders,
      coupons,
      reviews,
      wholesaleEnquiries,
      weddingEnquiries,
      contactEnquiries,
      customerSummary,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponActive,
      updateReviewStatus,
      updateEnquiryStatus,
      deleteEnquiry,
    ],
  );

  return (
    <Phase15Context.Provider value={value}>
      {children}
    </Phase15Context.Provider>
  );
}

export function usePhase15(): Phase15Value {
  const context = useContext(Phase15Context);
  if (!context) {
    throw new Error("usePhase15 must be used within a Phase15Provider.");
  }
  return context;
}