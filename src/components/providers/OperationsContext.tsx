"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Customer,
  DeliveryArea,
  DeliverySlot,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/types";
import {
  customers as seedCustomers,
  deliveryAreas,
  deliverySlots,
  orders as baseOrders,
} from "@/lib/data";
import { api } from "@/lib/api/client";
import { DEFAULT_MAX_ORDERS } from "@/lib/admin/overrides";

export interface SlotWithConfig extends DeliverySlot {
  enabled: boolean;
  maxOrders: number;
}

interface OperationsValue {
  orders: Order[];
  customers: Customer[];
  customersById: Record<string, Customer>;
  slotList: SlotWithConfig[];
  slotById: Record<string, SlotWithConfig>;
  areas: DeliveryArea[];
  areaById: Record<string, DeliveryArea>;
  hydrated: boolean;
  refresh: () => Promise<void>;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  setOrderPayment: (orderId: string, paymentStatus: PaymentStatus) => void;
  setSlotConfig: (slotId: string, config: Partial<Pick<SlotWithConfig, "enabled" | "maxOrders">>) => void;
  upsertArea: (area: DeliveryArea) => void;
  deleteArea: (areaId: string) => void;
}

const OperationsContext = createContext<OperationsValue | null>(null);

const REFRESH_INTERVAL_MS = 20_000;

const SEED_SLOTS: SlotWithConfig[] = deliverySlots.map((slot) => ({
  ...slot,
  enabled: slot.enabled ?? true,
  maxOrders: slot.maxOrders ?? DEFAULT_MAX_ORDERS,
}));

export function OperationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orders, setOrders] = useState<Order[]>(baseOrders);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [slotList, setSlotList] = useState<SlotWithConfig[]>(SEED_SLOTS);
  const [areas, setAreas] = useState<DeliveryArea[]>(deliveryAreas);
  const [hydrated, setHydrated] = useState(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    const [remoteOrders, remoteCustomers, remoteSlots, remoteAreas] = await Promise.all([
      api("/api/admin/orders"),
      api("/api/admin/customers"),
      api("/api/admin/delivery-slots"),
      api("/api/admin/delivery-areas"),
    ]);
    if (!alive.current) return;
    // A successful response is authoritative even when it is empty, so stale
    // seed data can never mask the live database.
    if (Array.isArray(remoteOrders)) setOrders(remoteOrders as Order[]);
    if (Array.isArray(remoteCustomers)) setCustomers(remoteCustomers as Customer[]);
    if (Array.isArray(remoteSlots)) {
      setSlotList((remoteSlots as DeliverySlot[]).map((slot) => ({
        ...slot,
        enabled: slot.enabled ?? true,
        maxOrders: slot.maxOrders ?? DEFAULT_MAX_ORDERS,
      })) as SlotWithConfig[]);
    }
    if (Array.isArray(remoteAreas)) setAreas(remoteAreas as DeliveryArea[]);
  }, []);

  useEffect(() => {
    alive.current = true;
    const safeRefresh = () => {
      refresh().catch(() => undefined);
    };
    (async () => {
      try {
        await refresh();
      } catch {
        // Keep the last known snapshot (the seeded preview) if the API is down.
      } finally {
        if (alive.current) setHydrated(true);
      }
    })();
    const interval = window.setInterval(safeRefresh, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") safeRefresh();
    };
    window.addEventListener("focus", safeRefresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive.current = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", safeRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const slotById = useMemo(
    () => Object.fromEntries(slotList.map((slot) => [slot.id, slot])),
    [slotList],
  );

  const customersById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  const areaById = useMemo(
    () => Object.fromEntries(areas.map((area) => [area.id, area])),
    [areas],
  );

  const setOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    const updatedAt = new Date().toISOString();
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status, updatedAt } : order,
      ),
    );
    api(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, updatedAt }),
    })
      .catch(() => undefined)
      .finally(() => {
        refresh().catch(() => undefined);
      });
  }, [refresh]);

  const setOrderPayment = useCallback(
    (orderId: string, paymentStatus: PaymentStatus) => {
      const updatedAt = new Date().toISOString();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, paymentStatus, updatedAt } : order,
        ),
      );
      api(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus, updatedAt }),
      })
        .catch(() => undefined)
        .finally(() => {
          refresh().catch(() => undefined);
        });
    },
    [refresh],
  );

  const setSlotConfig = useCallback(
    (slotId: string, config: Partial<Pick<SlotWithConfig, "enabled" | "maxOrders">>) => {
      api(`/api/admin/delivery-slots/${encodeURIComponent(slotId)}`, {
        method: "PATCH",
        body: JSON.stringify(config),
      }).catch(() => undefined);
      setSlotList((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                enabled: config.enabled ?? slot.enabled ?? true,
                maxOrders: config.maxOrders ?? slot.maxOrders ?? DEFAULT_MAX_ORDERS,
              }
            : slot,
        ),
      );
    },
    [],
  );

  const upsertArea = useCallback((area: DeliveryArea) => {
    const exists = area.id && areas.some((candidate) => candidate.id === area.id);
    api(exists ? `/api/admin/delivery-areas/${encodeURIComponent(area.id)}` : "/api/admin/delivery-areas", {
      method: exists ? "PATCH" : "POST",
      body: JSON.stringify(area),
    }).catch(() => undefined);
    setAreas((prev) =>
      prev.some((candidate) => candidate.id === area.id)
        ? prev.map((candidate) => (candidate.id === area.id ? area : candidate))
        : [...prev, area],
    );
  }, [areas]);

  const deleteArea = useCallback((areaId: string) => {
    api(`/api/admin/delivery-areas/${encodeURIComponent(areaId)}`, {
      method: "DELETE",
    }).catch(() => undefined);
    setAreas((prev) => prev.filter((area) => area.id !== areaId));
  }, []);

  const value = useMemo<OperationsValue>(
    () => ({
      orders,
      customers,
      customersById,
      slotList,
      slotById,
      areas,
      areaById,
      hydrated,
      refresh,
      setOrderStatus,
      setOrderPayment,
      setSlotConfig,
      upsertArea,
      deleteArea,
    }),
    [
      orders,
      customers,
      customersById,
      slotList,
      slotById,
      areas,
      areaById,
      hydrated,
      refresh,
      setOrderStatus,
      setOrderPayment,
      setSlotConfig,
      upsertArea,
      deleteArea,
    ],
  );

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error("useOperations must be used inside OperationsProvider");
  }
  return context;
}
