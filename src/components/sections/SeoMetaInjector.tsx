"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import type { SeoRouteOverride } from "@/lib/types";

/**
 * Client-side SEO override injector. Next.js computes <head> metadata at build
 * time, so per-route overrides edited in /admin/seo are applied here — on the
 * client — as the user navigates. When a route has no override, we touch
 * nothing and Next's server metadata stands.
 */
export function SeoMetaInjector() {
  const pathname = usePathname();
  const { seoOverrides } = useSiteContent();

  const applied = (() => {
    if (!pathname || pathname.startsWith("/admin")) return null;
    for (const key of Object.keys(seoOverrides)) {
      if (matchesRoute(key, pathname)) return { key, override: seoOverrides[key] };
    }
    return null;
  })();

  useEffect(() => {
    if (!applied) return;
    const { override } = applied;
    if (override.title) document.title = override.title;
    if (override.description) {
      upsertMetaName("description", override.description);
      upsertMetaProperty("og:description", override.description);
    }
    if (override.keywords) upsertMetaName("keywords", override.keywords);
  }, [applied]);

  return null;
}

/** Exact path match, or a "/blog/[slug]"-style key matching a path deeper in
 * the same section (e.g. key "/blog/[slug]" matches "/blog/rose-care-tips"). */
function matchesRoute(key: string, pathname: string): boolean {
  if (key === pathname) return true;
  const slugIndex = key.indexOf("[slug]");
  if (slugIndex !== -1) {
    const prefix = key.slice(0, slugIndex);
    return pathname.startsWith(prefix) && pathname.length > prefix.length;
  }
  return false;
}

function upsertMetaName(name: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function upsertMetaProperty(property: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}