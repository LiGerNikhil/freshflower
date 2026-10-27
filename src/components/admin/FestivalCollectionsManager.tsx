"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, ImageIcon, Plus, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/client";
import { isFestivalCollectionLive } from "@/lib/festivals";
import type { FestivalCollection } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { FestivalCollectionForm } from "@/components/admin/FestivalCollectionForm";

export function FestivalCollectionsManager() {
  const [collections, setCollections] = useState<FestivalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FestivalCollection | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const load = useCallback(async () => { setCollections(await api("/api/admin/festival-collections")); }, []);
  useEffect(() => {
    let alive = true;
    api("/api/admin/festival-collections").then((data) => { if (alive) setCollections(data); })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : "Could not load collections."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  async function action(work: () => Promise<void>) {
    setBusy(true); setError("");
    try { await work(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save. Earlier successful bulk rows remain saved."); }
    finally { try { await load(); } catch { setError("Could not refresh collections. Reload to verify the result."); } setBusy(false); }
  }
  async function save(value: Record<string, unknown>) {
    setBusy(true);
    try {
      await api(editing ? `/api/admin/festival-collections/${encodeURIComponent(editing.id)}` : "/api/admin/festival-collections", { method: editing ? "PATCH" : "POST", body: JSON.stringify(value) });
      await load(); setOpen(false);
    } finally { setBusy(false); }
  }
  // The Diwali campaign is a FestivalCollection but has its own validated editor.
  const visibleCollections = collections.filter((collection) => collection.slug !== "diwali");
  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold"><FolderKanban size={13} /> Content</p><h1 className="mt-2 font-display text-3xl md:text-4xl">Collections</h1><p className="mt-2 text-sm text-ink-soft">Drafts, schedules, banners and curated product order.</p></div><button type="button" onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-ivory"><Plus size={15} /> New collection</button></div>
    {error && <p role="alert" className="mb-4 rounded-md bg-blush p-3 text-sm text-red-800">{error} Bulk operations stop on the first error.</p>}
    {loading && <p role="status">Loading collections…</p>}
    <fieldset disabled={busy || loading}>
      <p className="mb-4 rounded-md bg-sage/20 px-3 py-2 text-sm text-ink-soft">
        The Diwali pre-booking campaign is managed in <Link href="/admin/diwali" className="font-semibold underline">Diwali Bookings</Link> so its dates, products and booking settings stay in sync.
      </p>
      <div className="mb-4 flex flex-wrap gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={visibleCollections.length > 0 && selected.length === visibleCollections.length} onChange={(event) => setSelected(event.target.checked ? visibleCollections.map((collection) => collection.id) : [])} />Select all</label>
        {[true, false].map((active) => <button key={String(active)} type="button" disabled={!selected.length} onClick={() => void action(async () => { for (const id of selected) await api(`/api/admin/festival-collections/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ active }) }); })} className="rounded-md border border-ink/10 px-3 py-2 disabled:opacity-50">{active ? "Activate" : "Deactivate"} selected</button>)}
        <button type="button" onClick={() => void action(async () => {})} className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2"><RefreshCw size={14} />Refresh</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white/80 shadow-sm"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-ivory-deep/60 text-xs uppercase text-ink-soft"><tr><th className="p-4">Collection</th><th className="p-4">State</th><th className="p-4">Selections</th><th className="p-4">Actions</th></tr></thead><tbody>
        {visibleCollections.map((collection) => <tr key={collection.id} className="border-t border-ink/5"><td className="p-4"><div className="flex items-center gap-3"><input type="checkbox" aria-label={`Select ${collection.title}`} checked={selected.includes(collection.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, collection.id] : selected.filter((id) => id !== collection.id))} /><AdminThumb token={collection.bannerImage} name={collection.title} className="h-12 w-16" /><div><p className="font-semibold">{collection.title}</p><p className="text-xs text-ink-soft">/{collection.slug}</p></div></div></td><td className="p-4">{collection.status} · {isFestivalCollectionLive(collection) ? "Live" : collection.active ? "Outside schedule" : "Inactive"}</td><td className="p-4">{collection.productIds.length} products · {collection.categoryIds.length} categories</td><td className="p-4"><div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setEditing(collection); setOpen(true); }} className="inline-flex items-center gap-1.5 font-semibold"><ImageIcon size={14} /> Change banner</button><button type="button" onClick={() => { setEditing(collection); setOpen(true); }} className="font-semibold">Edit</button>{confirmDelete === collection.id ? <button type="button" onClick={() => void action(async () => { await api(`/api/admin/festival-collections/${encodeURIComponent(collection.id)}`, { method: "DELETE" }); setConfirmDelete(null); setSelected(selected.filter((id) => id !== collection.id)); })} className="text-red-800">Confirm delete</button> : <button type="button" onClick={() => setConfirmDelete(collection.id)} className="text-ink-soft">Delete</button>}</div></td></tr>)}
      </tbody></table>{!loading && !visibleCollections.length && <p className="p-10 text-center text-ink-soft">No collections yet. Create a draft to get started.</p>}</div>
    </fieldset>
    <Modal open={open} onClose={() => { if (!busy) setOpen(false); }} className="max-w-3xl">
      {open && <FestivalCollectionForm key={editing?.id ?? "new"} existing={editing} onSave={save} />}
    </Modal>
  </div>;
}
