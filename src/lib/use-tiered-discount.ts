"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TIERED_DISCOUNT_CONFIG,
  computeTieredDiscount,
  normalizeTieredDiscountConfig,
  type DiscountChannel,
  type TieredDiscountConfig,
  type TieredDiscountResult,
} from "@/lib/discounts";

let configPromise: Promise<TieredDiscountConfig> | null = null;

function loadConfig(): Promise<TieredDiscountConfig> {
  if (!configPromise) {
    configPromise = fetch("/api/discounts", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return DEFAULT_TIERED_DISCOUNT_CONFIG;
        const body = await response.json().catch(() => null);
        return normalizeTieredDiscountConfig(body?.config);
      })
      .catch(() => {
        configPromise = null;
        return normalizeTieredDiscountConfig(DEFAULT_TIERED_DISCOUNT_CONFIG);
      });
  }
  return configPromise;
}

/**
 * Loads the admin-configured tier ladder once per browser session and computes
 * the reward with the same pure function the checkout API uses.
 */
export function useTieredDiscount(
  subtotal: number,
  channel: DiscountChannel = "orders",
): TieredDiscountResult {
  const [config, setConfig] = useState<TieredDiscountConfig>(() =>
    normalizeTieredDiscountConfig(DEFAULT_TIERED_DISCOUNT_CONFIG),
  );

  useEffect(() => {
    let alive = true;
    loadConfig().then((loaded) => {
      if (alive) setConfig(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(
    () => computeTieredDiscount(subtotal, config, channel),
    [subtotal, config, channel],
  );
}
