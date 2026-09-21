"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface CustomerSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}

interface CustomerAuthValue {
  user: CustomerSessionUser | null;
  hydrated: boolean;
  requireAuth: () => boolean;
  refresh: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerSessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  async function refresh() {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Unauthorized");
      const body = (await response.json()) as { customer: CustomerSessionUser };
      setUser(body.customer);
    } catch {
      setUser(null);
    } finally {
      setHydrated(true);
    }
  }

  useEffect(() => {
    // Hydrate once from the server session endpoint after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, []);

  const value = useMemo<CustomerAuthValue>(() => {
    const requireAuth = () => {
      if (user) return true;
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return false;
    };
    return { user, hydrated, requireAuth, refresh };
  }, [user, hydrated, router]);

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  return context;
}
