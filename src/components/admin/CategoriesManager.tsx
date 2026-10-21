"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FolderKanban, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useCatalog, type CategoryDraft } from "@/components/providers/CatalogContext";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { Modal } from "@/components/ui/Modal";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

const blank: CategoryDraft = { name: "", slug: "", description: "", imageUrl: "", active: false, sortOrder: 0, seoTitle: "", metaDescription: "", keywords: [] };
const fieldClass = "w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink focus:ring-2 focus:ring-gold/60";

export function CategoriesManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory, moveCategory, busy } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(blank);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [working, setWorking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const patch = (value: Partial<CategoryDraft>) => setDraft((current) => ({ ...current, ...value }));
  function edit(category: Category | null) {
    setEditing(category); setDraft(category ? { ...category } : { ...blank, sortOrder: categories.length }); setError(""); setOpen(true);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (editing) {
      if (await updateCategory(editing.id, draft)) setOpen(false);
      else setError("Category was not saved. See the error above and retry.");
    } else {
      const result = await addCategory(draft);
      if ("error" in result) setError(result.error); else setOpen(false);
    }
  }
  async function bulk(active: boolean) {
    setWorking(true);
    try { for (const id of selected) if (!(await updateCategory(id, { active }))) break; }
    finally { setWorking(false); }
  }
  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold"><FolderKanban size={13} /> Catalogue</p><h1 className="mt-2 font-display text-3xl md:text-4xl">Categories</h1><p className="mt-2 text-sm text-ink-soft">{categories.length} categories · Manage images, search metadata and display order.</p></div>
      <button type="button" onClick={() => edit(null)} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-ivory"><Plus size={15} /> New category</button>
    </div>
    <fieldset disabled={busy || working}>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={categories.length > 0 && selected.length === categories.length} onChange={(event) => setSelected(event.target.checked ? categories.map((category) => category.id) : [])} /> Select all</label>
        <button type="button" disabled={!selected.length} onClick={() => void bulk(true)} className="rounded-md border border-ink/10 px-3 py-2 disabled:opacity-50">Activate selected</button>
        <button type="button" disabled={!selected.length} onClick={() => void bulk(false)} className="rounded-md border border-ink/10 px-3 py-2 disabled:opacity-50">Deactivate selected</button>
      </div>
      <div className="divide-y divide-ink/5 overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        {categories.map((category, index) => {
          const count = products.filter((product) => product.categoryId === category.id).length;
          return <div key={category.id} data-cat-row={category.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <input type="checkbox" aria-label={`Select ${category.name}`} checked={selected.includes(category.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, category.id] : selected.filter((id) => id !== category.id))} />
            <div className="flex flex-col"><button type="button" aria-label={`Move ${category.name} up`} disabled={index === 0} onClick={() => void moveCategory(category.id, "up")} className="p-1 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" aria-label={`Move ${category.name} down`} disabled={index === categories.length - 1} onClick={() => void moveCategory(category.id, "down")} className="p-1 disabled:opacity-30"><ArrowDown size={14} /></button></div>
            <AdminThumb token={category.imageUrl || category.heroImage} name={category.name} />
            <div className="min-w-0 flex-1"><p className="font-semibold">{category.name}</p><p className="truncate text-xs text-ink-soft">/{category.slug} · {count} products · {category.active === false ? "Inactive" : "Active"}</p></div>
            <button type="button" aria-label={`Edit ${category.name}`} onClick={() => edit(category)} className="rounded-md p-2 hover:bg-ink/5"><Pencil size={15} /></button>
            {confirmDelete === category.id ? <button type="button" disabled={count > 0} onClick={async () => { if (await deleteCategory(category.id)) { setConfirmDelete(null); setSelected(selected.filter((id) => id !== category.id)); } }} className="rounded-md bg-blush px-3 py-2 text-xs">Confirm delete</button> : <button type="button" disabled={count > 0} aria-label={`Delete ${category.name}`} onClick={() => setConfirmDelete(category.id)} className="rounded-md p-2 disabled:opacity-30"><Trash2 size={15} /></button>}
          </div>;
        })}
      </div>
    </fieldset>
    <Modal open={open} onClose={() => { if (!busy) setOpen(false); }}>
      <form onSubmit={save}><fieldset disabled={busy} className="grid gap-4">
        <h2 className="font-display text-xl">{editing ? "Edit category" : "New category"}</h2>
        <label className="text-sm">Name<input required className={fieldClass} value={draft.name} onChange={(event) => patch({ name: event.target.value, ...(!editing ? { slug: slugify(event.target.value) } : {}) })} /></label>
        <label className="text-sm">Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={fieldClass} value={draft.slug ?? ""} onChange={(event) => patch({ slug: event.target.value })} /></label>
        <label className="text-sm">Description<textarea className={fieldClass} value={draft.description} onChange={(event) => patch({ description: event.target.value })} /></label>
        <CloudinaryUpload label="Category image" value={draft.imageUrl ? [draft.imageUrl] : []} onChange={(urls) => patch({ imageUrl: urls.at(-1) ?? "" })} />
        <label className="text-sm">Sort order<input type="number" step={1} min={0} className={fieldClass} value={draft.sortOrder ?? 0} onChange={(event) => patch({ sortOrder: Number(event.target.value) })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active !== false} onChange={(event) => patch({ active: event.target.checked })} /> Active</label>
        <label className="text-sm">SEO title<input className={fieldClass} value={draft.seoTitle ?? ""} onChange={(event) => patch({ seoTitle: event.target.value })} /></label>
        <label className="text-sm">Meta description<textarea className={fieldClass} value={draft.metaDescription ?? ""} onChange={(event) => patch({ metaDescription: event.target.value })} /></label>
        <label className="text-sm">Keywords<input className={fieldClass} value={(draft.keywords ?? []).join(",")} onChange={(event) => patch({ keywords: event.target.value.split(",") })} /></label>
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm text-ivory"><Save size={15} />{busy ? "Saving…" : "Save category"}</button>
      </fieldset></form>
    </Modal>
  </div>;
}
