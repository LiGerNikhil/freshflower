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
import { useSiteContent } from "@/components/providers/SiteContentProvider";

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
  ) => { ok: true } | { ok: false; error: string };
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
  const { users, userPasswords } = useSiteContent();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSession(JSON.parse(saved) as AdminSession);
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const login = useCallback<AdminAuthValue["login"]>(
    (email, password) => {
      const normalized = email.trim().toLowerCase();
      const user = users.find(
        (candidate) =>
          candidate.email.toLowerCase() === normalized && candidate.active,
      );
      if (!user || userPasswords[user.email] !== password) {
        return {
          ok: false,
          error: "Invalid email or password. Try the demo credentials below.",
        };
      }
      const next: AdminSession = {
        user,
        loggedInAt: new Date().toISOString(),
      };
      setSession(next);
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      return { ok: true };
    },
    [users, userPasswords],
  );

  const logout = useCallback(() => {
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