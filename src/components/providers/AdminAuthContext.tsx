"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { AdminRole, AdminUser } from "@/lib/types";

const SESSION_STORAGE_KEY = "ff-admin-session-v1";

export interface AdminSession {
  user: AdminUser;
  loggedInAt: string;
}

interface AdminAuthValue {
  session: AdminSession | null;
  user: AdminUser | null;
  role: AdminRole | null;
  hydrated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch("/api/admin/auth/me", { credentials: "same-origin" });
        if (!response.ok) throw new Error("Unauthorized");
        const body = (await response.json()) as { user: AdminUser };
        const next = { user: body.user, loggedInAt: new Date().toISOString() };
        if (!mounted) return;
        setSession(next);
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch {
        if (!mounted) return;
        setSession(null);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback<AdminAuthValue["login"]>(
    async (email, password) => {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        return {
          ok: false,
          error: "Invalid email or password.",
        };
      }
      const body = (await response.json()) as { user: AdminUser };
      const next: AdminSession = {
        user: body.user,
        loggedInAt: new Date().toISOString(),
      };
      setSession(next);
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => undefined);
    setSession(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user.role ?? null,
      hydrated,
      login,
      logout,
    }),
    [session, hydrated, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return context;
}
