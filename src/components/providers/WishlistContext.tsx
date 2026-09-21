"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";

const STORAGE_KEY = "freshflower-wishlist";
interface WishlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}
const WishlistContext = createContext<WishlistContextValue | null>(null);
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { requireAuth } = useCustomerAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // Hydrate once from the browser-only wishlist store after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIds(JSON.parse(saved) as string[]);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [hydrated, ids]);
  const value = useMemo(
    () => ({
      ids,
      has: (id: string) => ids.includes(id),
      toggle: (id: string) => {
        if (!requireAuth()) return;
        setIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id],
        );
      },
      remove: (id: string) => {
        if (!requireAuth()) return;
        setIds((current) => current.filter((item) => item !== id));
      },
    }),
    [ids, requireAuth],
  );
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
