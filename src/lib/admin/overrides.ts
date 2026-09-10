import type { DeliveryArea, OrderStatus, PaymentStatus } from "@/lib/types";

export const STATUS_OVERRIDE_KEY = "ff-order-status-overrides-v1";
export const DELIVERY_CONFIG_KEY = "ff-delivery-config-v1";
export const PHASE15_KEY = "ff-phase15-entities-v1";
export const DEFAULT_MAX_ORDERS = 3;

export interface StatusOverride {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  updatedAt?: string;
}
export type StatusOverrides = Record<string, StatusOverride>;

export interface SlotConfig {
  enabled: boolean;
  maxOrders: number;
}
export type AreaOverride = DeliveryArea | "deleted";
export interface DeliveryConfig {
  slots: Partial<Record<string, SlotConfig>>;
  areas: Record<string, AreaOverride>;
}

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadStatusOverrides(): StatusOverrides {
  return loadJSON<StatusOverrides>(STATUS_OVERRIDE_KEY, {});
}

export function saveStatusOverrides(overrides: StatusOverrides): void {
  saveJSON(STATUS_OVERRIDE_KEY, overrides);
}

export function loadDeliveryConfig(): DeliveryConfig {
  return loadJSON<DeliveryConfig>(DELIVERY_CONFIG_KEY, { slots: {}, areas: {} });
}

export function saveDeliveryConfig(config: DeliveryConfig): void {
  saveJSON(DELIVERY_CONFIG_KEY, config);
}

export function loadPhase15<T>(fallback: T): T {
  return loadJSON<T>(PHASE15_KEY, fallback);
}

export function savePhase15(value: unknown): void {
  saveJSON(PHASE15_KEY, value);
}