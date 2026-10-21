"use client";

import { useState } from "react";
import { useCatalog } from "@/components/providers/CatalogContext";
import { CollectionBannerField } from "@/components/admin/CollectionBannerField";
import { OrderedReferencePicker } from "@/components/admin/OrderedReferencePicker";
import { slugify } from "@/lib/utils";
import type { FestivalCollection } from "@/lib/types";

const fieldClass = "mt-1 w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-gold/60";
function localDate(value?: string) {
  return value ? new Date(new Date(value).getTime() + 330 * 60_000).toISOString().slice(0, 16) : "";
}

export function FestivalCollectionForm({ existing, onSave }: {
  existing: FestivalCollection | null;
  onSave: (value: Record<string, unknown>) => Promise<void>;
}) {
  const { products, categories } = useCatalog();
  const [draft, setDraft] = useState({
    title: existing?.title ?? "", slug: existing?.slug ?? "", subtitle: existing?.subtitle ?? "",
    bannerImage: existing?.bannerImage ?? "", status: existing?.status ?? "draft", active: existing?.active ?? false,
    startsAt: localDate(existing?.startsAt), endsAt: localDate(existing?.endsAt),
    productIds: existing?.productIds ?? [], categoryIds: existing?.categoryIds ?? [],
    sortOrder: existing?.sortOrder ?? 0, badgeText: existing?.badgeText ?? "Curated",
    lastOrderByText: existing?.lastOrderByText ?? "", poojaCollection: existing?.poojaCollection ?? false,
    whatsappBulkOrderEnabled: existing?.whatsappBulkOrderEnabled ?? false,
    seoTitle: existing?.seoTitle ?? "", metaDescription: existing?.metaDescription ?? "", keywords: (existing?.keywords ?? []).join(","),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const patch = (value: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...value }));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      await onSave({
        ...draft, active: draft.status === "published" && draft.active,
        startsAt: draft.startsAt ? new Date(`${draft.startsAt}:00+05:30`).toISOString() : null,
        endsAt: draft.endsAt ? new Date(`${draft.endsAt}:00+05:30`).toISOString() : null,
        keywords: draft.keywords.split(",").map((value) => value.trim()).filter(Boolean),
      });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save collection."); }
    finally { setSaving(false); }
  }
  return <form onSubmit={save}>
    <fieldset disabled={saving} className="grid gap-4">
      <h2 className="pr-10 font-display text-2xl">{existing ? "Edit collection" : "New collection"}</h2>
      <label className="text-sm">Title<input required maxLength={120} className={fieldClass} value={draft.title} onChange={(event) => patch({ title: event.target.value, ...(!existing ? { slug: slugify(event.target.value) } : {}) })} /></label>
      <CollectionBannerField value={draft.bannerImage} onChange={(bannerImage) => patch({ bannerImage })} />
      <label className="text-sm">Slug<input required className={fieldClass} value={draft.slug} onChange={(event) => patch({ slug: event.target.value })} /></label>
      <label className="text-sm">Subtitle<textarea className={fieldClass} value={draft.subtitle} onChange={(event) => patch({ subtitle: event.target.value })} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Status<select className={fieldClass} value={draft.status} onChange={(event) => patch({ status: event.target.value as "draft" | "published", active: false })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={draft.status !== "published"} checked={draft.active} onChange={(event) => patch({ active: event.target.checked })} /> Active</label>
        <label className="text-sm">Start (India time)<input type="datetime-local" className={fieldClass} value={draft.startsAt} onChange={(event) => patch({ startsAt: event.target.value })} /></label>
        <label className="text-sm">End (India time)<input type="datetime-local" className={fieldClass} value={draft.endsAt} onChange={(event) => patch({ endsAt: event.target.value })} /></label>
        <label className="text-sm">Sort order<input type="number" min={0} step={1} className={fieldClass} value={draft.sortOrder} onChange={(event) => patch({ sortOrder: Number(event.target.value) })} /></label>
        <label className="text-sm">Badge text<input className={fieldClass} value={draft.badgeText} onChange={(event) => patch({ badgeText: event.target.value })} /></label>
      </div>
      <p className="text-xs text-ink-soft">Schedules use Asia/Kolkata. End time is exclusive. Drafts never go live; published collections need an uploaded banner and published products.</p>
      <OrderedReferencePicker label="Ordered products" options={products.map((product) => ({ id: product.id, name: `${product.name}${product.publicationStatus === "draft" ? " (draft)" : ""}` }))} value={draft.productIds} onChange={(productIds) => patch({ productIds })} />
      <OrderedReferencePicker label="Ordered categories" options={categories} value={draft.categoryIds} onChange={(categoryIds) => patch({ categoryIds })} />
      <label className="text-sm">Last order by (display text)<input className={fieldClass} value={draft.lastOrderByText} onChange={(event) => patch({ lastOrderByText: event.target.value })} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.poojaCollection} onChange={(event) => patch({ poojaCollection: event.target.checked })} /> Pooja collection</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.whatsappBulkOrderEnabled} onChange={(event) => patch({ whatsappBulkOrderEnabled: event.target.checked })} /> WhatsApp bulk-order CTA</label>
      <label className="text-sm">SEO title<input className={fieldClass} value={draft.seoTitle} onChange={(event) => patch({ seoTitle: event.target.value })} /></label>
      <label className="text-sm">Meta description<textarea className={fieldClass} value={draft.metaDescription} onChange={(event) => patch({ metaDescription: event.target.value })} /></label>
      <label className="text-sm">Keywords<input className={fieldClass} value={draft.keywords} onChange={(event) => patch({ keywords: event.target.value })} /></label>
      {error && <p role="alert" className="rounded-md bg-blush p-3 text-sm text-red-800">{error}</p>}
      <button type="submit" className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory">{saving ? "Saving…" : "Save collection"}</button>
    </fieldset>
  </form>;
}
