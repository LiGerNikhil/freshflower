"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCatalog } from "@/components/providers/CatalogContext";
import { OrderedReferencePicker } from "@/components/admin/OrderedReferencePicker";
import { HOMEPAGE_SECTION_IDS } from "@/lib/festivals";
import { api } from "@/lib/api/client";
import type { FestivalCollection, HomepageConfig } from "@/lib/types";

export function HomepageFestivalControls({ value, onChange }: { value: HomepageConfig; onChange: (patch: Partial<HomepageConfig>) => void }) {
  const { categories } = useCatalog();
  const [collections, setCollections] = useState<FestivalCollection[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    api("/api/admin/festival-collections").then((items) => { if (alive) setCollections(items); })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : "Could not load collections."); });
    return () => { alive = false; };
  }, []);
  const sections = [...(value.sections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  function move(index: number, offset: number) {
    const next = [...sections];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange({ sections: next.map((section, sortOrder) => ({ ...section, sortOrder })) });
  }
  return <section className="mb-6 space-y-5 rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
    <h2 className="font-display text-xl">Collections hero &amp; homepage sections</h2>
    <p className="text-xs leading-5 text-ink-soft">The legacy hero and section order remain in use when this switch is off, the section list is invalid or empty, or no selected collection is live within its saved dates.</p>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.festivalHeroEnabled ?? false} onChange={(event) => onChange({ festivalHeroEnabled: event.target.checked })} /> Enable collections hero</label>
    <div className="flex flex-wrap gap-3"><button type="button" className="rounded-md border border-ink/10 px-3 py-2 text-sm" onClick={() => onChange({ sections: HOMEPAGE_SECTION_IDS.map((id, sortOrder) => ({ id, sortOrder, enabled: !["wholesale", "reviews"].includes(id) })) })}>Initialize section list</button><button type="button" className="rounded-md border border-ink/10 px-3 py-2 text-sm" onClick={() => onChange({ sections: [], festivalHeroEnabled: false })}>Reset to legacy homepage</button></div>
    <ol className="grid gap-2">{sections.map((section, index) => <li key={section.id} className="flex items-center gap-3 rounded-md bg-ivory-deep/50 p-2"><label className="flex flex-1 items-center gap-2 text-sm"><input type="checkbox" checked={section.enabled} onChange={(event) => onChange({ sections: sections.map((entry) => entry.id === section.id ? { ...entry, enabled: event.target.checked } : entry) })} />{section.id.replace(/-/g, " ")}</label><button type="button" disabled={index === 0} aria-label={`Move ${section.id} up`} onClick={() => move(index, -1)} className="p-2 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" disabled={index === sections.length - 1} aria-label={`Move ${section.id} down`} onClick={() => move(index, 1)} className="p-2 disabled:opacity-30"><ArrowDown size={14} /></button></li>)}</ol>
    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    <div className="grid gap-5 lg:grid-cols-2"><OrderedReferencePicker label="Category carousel order" options={categories} value={value.categoryIds ?? []} onChange={(categoryIds) => onChange({ categoryIds })} /><OrderedReferencePicker label="Collection banner order" options={collections.map((collection) => ({ id: collection.id, name: `${collection.title} (${collection.status})` }))} value={value.festivalCollectionIds ?? []} onChange={(festivalCollectionIds) => onChange({ festivalCollectionIds })} /></div>
    <div className="flex flex-wrap gap-4">{([ ["festivalBadges", "Festival badges"], ["lowStockLabels", "Real-stock labels"], ["collectionCutoff", "Collection cutoff text"], ["whatsappBulkOrder", "WhatsApp bulk CTA"] ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.salesBoosters?.[key] ?? false} onChange={(event) => onChange({ salesBoosters: { ...value.salesBoosters, [key]: event.target.checked } })} />{label}</label>)}</div>
  </section>;
}
