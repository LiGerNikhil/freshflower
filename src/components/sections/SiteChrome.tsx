"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/sections/SiteNav";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { ReviewCta } from "@/components/sections/ReviewCta";
import { WhatsAppFloat } from "@/components/sections/WhatsAppFloat";
import { SeoMetaInjector } from "@/components/sections/SeoMetaInjector";

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
      <SeoMetaInjector />
      <SiteNav />
      <div className="flex-1">{children}</div>
      <ReviewCta />
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}