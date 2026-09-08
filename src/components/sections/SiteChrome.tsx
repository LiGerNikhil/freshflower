"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";

/**
 * Renders the public site chrome (shared nav + footer) everywhere except the
 * admin area, which provides its own layout in /src/app/admin.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <SiteNav />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}