"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  DeliveryArea,
  DeliverySlot,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/types";
import { deliveryAreas, deliverySlots, orders as baseOrders } from "@/lib/data";
import { api } from "@/lib/api/client";
import { DEFAULT_MAX_ORDERS } from "@/lib/admin/overrides";

export interface SlotWithConfig extends DeliverySlot {
  enabled: boolean;
  maxOrders: number;
}

interface StatusPatch {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

interface OperationsValue {
  orders: Order[];
  slotList: SlotWithConfig[];
  slotById: Record<string, SlotWithConfig>;
  areas: DeliveryArea[];
  areaById: Record<string, DeliveryArea>;
  hydrated: boolean;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  setOrderPayment: (orderId: string, paymentStatus: PaymentStatus) => void;
  setSlotConfig: (slotId: string, config: Partial<Pick<SlotWithConfig, "enabled" | "maxOrders">>) => void;
  upsertArea: (area: DeliveryArea) => void;
  deleteArea: (areaId: string) => void;
}

const OperationsContext = createContext<OperationsValue | null>(null);

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
  const [slotList, setSlotList] = useState<SlotWithConfig[]>(SEED_SLOTS);
  const [areas, setAreas] = useState<DeliveryArea[]>(deliveryAreas);
  const [hydrated, setHydrated] = useState(false);

  // Phase 17: hydrate orders + delivery configuration from MongoDB.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [remoteOrders, remoteSlots, remoteAreas] = await Promise.all([
          api("/api/admin/orders"),
          api("/api/admin/delivery-slots"),
          api("/api/admin/delivery-areas"),
        ]);
        if (!mounted) return;
        if (Array.isArray(remoteOrders) && remoteOrders.length) {
          setOrders(remoteOrders as Order[]);
        }
        if (Array.isArray(remoteSlots) && remoteSlots.length) {
          setSlotList((remoteSlots as DeliverySlot[]).map((slot) => ({
            ...slot,
            enabled: slot.enabled ?? true,
            maxOrders: slot.maxOrders ?? DEFAULT_MAX_ORDERS,
          })) as SlotWithConfig[]);
        }
        if (Array.isArray(remoteAreas) && remoteAreas.length) {
          setAreas(remoteAreas as DeliveryArea[]);
        }
      } catch {
        // Fall back to the seeded preview.
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const slotById = useMemo(
    () => Object.fromEntries(slotList.map((slot) => [slot.id, slot])),
    [slotList],
  );

  const areaById = useMemo(
    () => Object.fromEntries(areas.map((area) => [area.id, area])),
    [areas],
  );

  const setOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    api(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
    }).catch(() => undefined);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order,
      ),
    );
  }, []);

  const setOrderPayment = useCallback(
    (orderId: string, paymentStatus: PaymentStatus) => {
      api(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus, updatedAt: new Date().toISOString() }),
      }).catch(() => undefined);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, paymentStatus, updatedAt: new Date().toISOString() }
            : order,
        ),
      );
    },
    [],
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
      slotList,
      slotById,
      areas,
      areaById,
      hydrated,
      setOrderStatus,
      setOrderPayment,
      setSlotConfig,
      upsertArea,
      deleteArea,
    }),
    [
      orders,
      slotList,
      slotById,
      areas,
      areaById,
      hydrated,
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