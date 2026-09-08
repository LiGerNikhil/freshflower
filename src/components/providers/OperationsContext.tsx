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
import {
  DEFAULT_MAX_ORDERS,
  loadDeliveryConfig,
  loadStatusOverrides,
  saveDeliveryConfig,
  saveStatusOverrides,
  type DeliveryConfig,
  type SlotConfig,
  type StatusOverrides,
} from "@/lib/admin/overrides";

export interface SlotWithConfig extends DeliverySlot, SlotConfig {}

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
  setSlotConfig: (slotId: string, config: Partial<SlotConfig>) => void;
  upsertArea: (area: DeliveryArea) => void;
  deleteArea: (areaId: string) => void;
}

const OperationsContext = createContext<OperationsValue | null>(null);

function mergeStoredAreas(stored: DeliveryConfig["areas"]): DeliveryArea[] {
  const entries = Object.entries(stored).filter(
    (entry): entry is [string, DeliveryArea] => entry[1] !== "deleted",
  );
  const byId = new Map(entries);
  const merged = deliveryAreas
    .filter((area) => stored[area.id] !== "deleted")
    .map((area) => byId.get(area.id) ?? area);
  for (const [id, area] of entries) {
    if (!deliveryAreas.some((candidate) => candidate.id === id)) {
      merged.push(area);
    }
  }
  return merged;
}

export function OperationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [statusOverrides, setStatusOverrides] = useState<StatusOverrides>({});
  const [slotConfig, setSlotConfigState] = useState<
    Partial<Record<string, SlotConfig>>
  >({});
  const [areas, setAreas] = useState<DeliveryArea[]>(deliveryAreas);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedOverrides = loadStatusOverrides();
    const storedConfig = loadDeliveryConfig();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatusOverrides(storedOverrides);
    setSlotConfigState(storedConfig.slots ?? {});
    setAreas(mergeStoredAreas(storedConfig.areas));
    setHydrated(true);
  }, []);

  const orders = useMemo<Order[]>(
    () =>
      baseOrders.map((order) => {
        const override = statusOverrides[order.id];
        if (!override) return order;
        return {
          ...order,
          status: override.status ?? order.status,
          paymentStatus: override.paymentStatus ?? order.paymentStatus,
          updatedAt: override.updatedAt ?? order.updatedAt,
        };
      }),
    [statusOverrides],
  );

  const slotList = useMemo<SlotWithConfig[]>(
    () =>
      deliverySlots.map((slot) => ({
        ...slot,
        enabled: slotConfig[slot.id]?.enabled ?? true,
        maxOrders: slotConfig[slot.id]?.maxOrders ?? DEFAULT_MAX_ORDERS,
      })),
    [slotConfig],
  );

  const slotById = useMemo(
    () => Object.fromEntries(slotList.map((slot) => [slot.id, slot])),
    [slotList],
  );

  const areaById = useMemo(
    () => Object.fromEntries(areas.map((area) => [area.id, area])),
    [areas],
  );

  const applyStatusOverride = useCallback(
    (orderId: string, patch: StatusPatch) => {
      const next: StatusOverrides = {
        ...statusOverrides,
        [orderId]: {
          ...statusOverrides[orderId],
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      };
      setStatusOverrides(next);
      saveStatusOverrides(next);
    },
    [statusOverrides],
  );

  const setOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) =>
      applyStatusOverride(orderId, { status }),
    [applyStatusOverride],
  );

  const setOrderPayment = useCallback(
    (orderId: string, paymentStatus: PaymentStatus) =>
      applyStatusOverride(orderId, { paymentStatus }),
    [applyStatusOverride],
  );

  const setSlotConfig = useCallback(
    (slotId: string, config: Partial<SlotConfig>) => {
      const nextSlots: Partial<Record<string, SlotConfig>> = {
        ...slotConfig,
        [slotId]: {
          enabled:
            config.enabled ?? slotConfig[slotId]?.enabled ?? true,
          maxOrders:
            config.maxOrders ??
            slotConfig[slotId]?.maxOrders ??
            DEFAULT_MAX_ORDERS,
        },
      };
      setSlotConfigState(nextSlots);
      saveDeliveryConfig({
        slots: nextSlots,
        areas: Object.fromEntries(areas.map((area) => [area.id, area])),
      });
    },
    [slotConfig, areas],
  );

  const upsertArea = useCallback(
    (area: DeliveryArea) => {
      const nextAreas = areas.some((candidate) => candidate.id === area.id)
        ? areas.map((candidate) =>
            candidate.id === area.id ? area : candidate,
          )
        : [...areas, area];
      setAreas(nextAreas);
      saveDeliveryConfig({
        slots: slotConfig,
        areas: Object.fromEntries(nextAreas.map((candidate) => [candidate.id, candidate])),
      });
    },
    [areas, slotConfig],
  );

  const deleteArea = useCallback(
    (areaId: string) => {
      const nextAreas = areas.filter((area) => area.id !== areaId);
      setAreas(nextAreas);
      saveDeliveryConfig({
        slots: slotConfig,
        areas: {
          ...Object.fromEntries(
            nextAreas.map((candidate) => [candidate.id, candidate]),
          ),
          [areaId]: "deleted",
        },
      });
    },
    [areas, slotConfig],
  );

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