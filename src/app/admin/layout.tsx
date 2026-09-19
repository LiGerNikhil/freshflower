"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "@/components/providers/AdminAuthContext";
import { CatalogProvider } from "@/components/providers/CatalogContext";
import { OperationsProvider } from "@/components/providers/OperationsContext";
import { Phase15Provider } from "@/components/providers/Phase15Provider";

function AdminGate({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!hydrated) return;
    if (!session && !isLoginPage) {
      router.replace("/admin/login");
    } else if (session && isLoginPage) {
      router.replace("/admin");
    }
  }, [hydrated, session, isLoginPage, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-deep">
        <div className="flex items-center gap-2 font-display text-lg text-ink-soft">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
          Loading admin…
        </div>
      </div>
    );
  }

  if (!session) {
    // Not authenticated — the effect above redirects to /admin/login. The login
    // page is still rendered through this layout so it can use the auth context.
    return <div className="min-h-screen bg-ivory-deep">{children}</div>;
  }

  if (isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-deep">
        <div className="flex items-center gap-2 font-display text-lg text-ink-soft">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
          Opening admin dashboard…
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
        <CatalogProvider>
          <OperationsProvider>
            <Phase15Provider>{children}</Phase15Provider>
          </OperationsProvider>
        </CatalogProvider>
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminGate>{children}</AdminGate>
    </AdminAuthProvider>
  );
}
