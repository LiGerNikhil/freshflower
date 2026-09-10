"use client";

import { Fragment, useMemo, useState } from "react";
import { Check, ChevronDown, RotateCcw, Save, Search } from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { ROUTE_GROUPS, ROUTE_REGISTRY } from "@/lib/admin/routes";

/**
 * /admin/seo — per-route title / description / keywords overrides. Stored in
 * the Phase 16 store and applied at runtime by SeoMetaInjector (the client
 * component in SiteChrome). Route list comes from src/lib/admin/routes.ts.
 */
export function SeoManager() {
  const { seoOverrides, upsertSeoOverride, clearSeoOverride } = useSiteContent();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { title: string; description: string; keywords: string }>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const byGroup = useMemo(() => {
    const groups: Record<string, typeof ROUTE_REGISTRY> = {};
    for (const group of ROUTE_GROUPS) {
      groups[group] = ROUTE_REGISTRY.filter((route) => route.group === group);
    }
    return groups;
  }, []);

  const draftFor = (path: string) =>
    drafts[path] ?? {
      title: seoOverrides[path]?.title ?? "",
      description: seoOverrides[path]?.description ?? "",
      keywords: seoOverrides[path]?.keywords ?? "",
    };

  const toggle = (path: string) => {
    setOpenPath((current) => (current === path ? null : path));
    setSaved(null);
  };

  const handleSave = (path: string) => {
    const draft = draftFor(path);
    const next: { title?: string; description?: string; keywords?: string } = {};
    if (draft.title.trim()) next.title = draft.title.trim();
    if (draft.description.trim()) next.description = draft.description.trim();
    if (draft.keywords.trim()) next.keywords = draft.keywords.trim();
    if (Object.keys(next).length === 0) {
      clearSeoOverride(path);
    } else {
      upsertSeoOverride(path, next);
    }
    setSaved(path);
    window.setTimeout(() => setSaved(null), 1400);
  };

  const handleReset = (path: string) => {
    clearSeoOverride(path);
    setDrafts((current) => {
      const next = { ...current };
      delete next[path];
      return next;
    });
    setSaved(path);
    window.setTimeout(() => setSaved(null), 1400);
  };

  const overrideCount = Object.keys(seoOverrides).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Search size={13} /> SEO Manager
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Route metadata
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {overrideCount} override{overrideCount === 1 ? "" : "s"} active.
            Titles and meta are generated at build time, so overrides apply on
            the client as visitors navigate — the list below shows
            exactly what each route would report.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {ROUTE_GROUPS.map((group) => {
          const routes = byGroup[group];
          if (routes.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-soft">
                {group}
              </h2>
              <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {routes.map((route, index) => {
                      const override = seoOverrides[route.path];
                      const draft = draftFor(route.path);
                      const isOpen = openPath === route.path;
                      const hasOverride = Boolean(override && (override.title || override.description || override.keywords));
                      return (
                        <Fragment key={route.path}>
                          <tr
                            onClick={() => toggle(route.path)}
                            className="cursor-pointer border-t border-ink/5 first:border-t-0 hover:bg-ivory-deep/30"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <ChevronDown
                                  size={14}
                                  className={`shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                                <div>
                                  <p className="font-semibold text-ink">{route.label}</p>
                                  <p className="text-xs text-ink-soft">{route.path}</p>
                                </div>
                              </div>
                            </td>
                            <td className="hidden px-4 py-3 text-xs text-ink-soft md:table-cell">
                              {route.title}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {hasOverride ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                                  <Check size={10} /> Overridden
                                </span>
                              ) : (
                                <span className="text-xs text-ink-soft">Default</span>
                              )}
                            </td>
                          </tr>
                          {isOpen && (
                            <tr
                              className="border-t border-ink/5 bg-ivory-deep/30"
                            >
                              <td colSpan={3} className="px-4 py-4">
                                <div className="grid gap-3 lg:grid-cols-2">
                                  <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                                      Title override
                                    </label>
                                    <input
                                      type="text"
                                      value={draft.title}
                                      onChange={(event) =>
                                        setDrafts((current) => ({
                                          ...current,
                                          [route.path]: {
                                            ...draftFor(route.path),
                                            title: event.target.value,
                                          },
                                        }))
                                      }
                                      placeholder={route.title}
                                      className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                                      Meta description override
                                    </label>
                                    <textarea
                                      value={draft.description}
                                      onChange={(event) =>
                                        setDrafts((current) => ({
                                          ...current,
                                          [route.path]: {
                                            ...draftFor(route.path),
                                            description: event.target.value,
                                          },
                                        }))
                                      }
                                      rows={1}
                                      placeholder={route.description}
                                      className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                                      Keywords (comma-separated)
                                    </label>
                                    <input
                                      type="text"
                                      value={draft.keywords}
                                      onChange={(event) =>
                                        setDrafts((current) => ({
                                          ...current,
                                          [route.path]: {
                                            ...draftFor(route.path),
                                            keywords: event.target.value,
                                          },
                                        }))
                                      }
                                      placeholder={route.keywords ?? "flower delivery delhi, …"}
                                      className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex items-end justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleReset(route.path)}
                                      className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-red-300 hover:text-red-600"
                                    >
                                      <RotateCcw size={13} /> Reset to default
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSave(route.path)}
                                      className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-ink-soft"
                                    >
                                      {saved === route.path ? (
                                        <>
                                          <Check size={13} /> Saved
                                        </>
                                      ) : (
                                        <>
                                          <Save size={13} /> Save override
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {hasOverride && (
                                  <p className="mt-2 text-xs text-ink-soft">
                                    Matches route{" "}
                                    <code className="rounded bg-ink/5 px-1 py-0.5">{route.path}</code>
                                    {route.path.includes("[slug]") &&
                                      " and every post/page beneath it"}
                                    . Leave a field empty to keep the build-time
                                    value for that field.
                                  </p>
)}
                                </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}