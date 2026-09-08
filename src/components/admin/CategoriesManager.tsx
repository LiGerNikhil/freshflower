"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FolderKanban,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCatalog } from "@/components/providers/CatalogContext";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { Modal } from "@/components/ui/Modal";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoriesManager() {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
  } = useCatalog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const countFor = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          products.filter((flower) => flower.categoryId === category.id).length,
        ]),
      ),
    [categories, products],
  );

  const openAdd = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setError(null);
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setDescription(category.description);
    setError(null);
    setOpen(true);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }
    if (editing) {
      updateCategory(editing.id, { name, description });
    } else {
      const result = addCategory({ name, description });
      if ("error" in result) {
        setError(result.error);
        return;
      }
    }
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <FolderKanban size={13} /> Catalogue
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {categories.length} categories. Reordering adjusts display order;
            deletions are blocked while a category still contains products.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Plus size={15} /> New category
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="divide-y divide-ink/5">
          {categories.map((category, index) => {
            const count = countFor.get(category.id) ?? 0;
            return (
              <div
                key={category.id}
                data-cat-row={category.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-ivory-deep/30"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveCategory(category.id, "up")}
                    disabled={index === 0}
                    aria-label={`Move ${category.name} up`}
                    className="rounded p-1 text-ink-soft/60 enabled:hover:bg-ink/5 enabled:hover:text-ink disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(category.id, "down")}
                    disabled={index === categories.length - 1}
                    aria-label={`Move ${category.name} down`}
                    className="rounded p-1 text-ink-soft/60 enabled:hover:bg-ink/5 enabled:hover:text-ink disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <AdminThumb token={category.heroImage} name={category.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{category.name}</p>
                  <p className="truncate text-xs text-ink-soft">
                    /{category.slug} — {category.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-ink-soft">
                  {count} product{count === 1 ? "" : "s"}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="rounded-md p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil size={15} />
                  </button>
                  {confirmDelete === category.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          deleteCategory(category.id);
                          setConfirmDelete(null);
                        }}
                        disabled={count > 0}
                        className="rounded-md bg-blush-deep px-3 py-1.5 text-xs font-bold text-ink hover:bg-blush-deep/80"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-md px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-ink/5"
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(category.id)}
                      disabled={count > 0}
                      title={
                        count > 0
                          ? `Contains ${count} product${count === 1 ? "" : "s"} — move them first`
                          : "Delete category"
                      }
                      aria-label={`Delete ${category.name}`}
                      className="rounded-md p-2 text-ink-soft transition enabled:hover:bg-blush-deep enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="mb-4 font-display text-xl">
          {editing ? "Edit category" : "New category"}
        </h2>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Seasonal Gardenias"
              className="w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
            />
            {name && (
              <span className="mt-1 block text-xs text-ink-soft">
                Slug: /{slugify(name)}
              </span>
            )}
            {error && <span className="mt-1 block text-xs text-ink">{error}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="One-line category description."
              className="w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-ink-soft"
          >
            <Save size={15} />
            {editing ? "Save changes" : "Create category"}
          </button>
        </div>
      </Modal>
    </div>
  );
}