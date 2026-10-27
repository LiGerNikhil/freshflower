"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import type { Bouquet, Flower } from "@/lib/types";
import { slugify } from "@/lib/utils";

type BouquetDraft = {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  colors: string[];
  featured: boolean;
  items: { flowerId: string; quantity: number }[];
  occasionIds: string[];
};

const fieldClass = "mt-1 w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink focus:ring-2 focus:ring-gold/60";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status}).`);
  return body as T;
}

function addColor() {
  const color = colorInput.trim();
  if (!color || draft.colors.some((existing) => existing.toLowerCase() === color.toLowerCase())) {
    return;
  }
  if (draft.colors.length >= 24) {
    setError("A bouquet can have at most 24 color options.");
    return;
  }
  patch({ colors: [...draft.colors, color] });
  setColorInput("");
}

export function BouquetForm({ bouquetId }: { bouquetId?: string }) {
  const router = useRouter();
  const editing = Boolean(bouquetId);
  const [draft, setDraft] = useState<BouquetDraft>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    images: [],
    colors: [],
    featured: false,
    items: [],
    occasionIds: [],
  });
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(editing);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [colorInput, setColorInput] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [flowerList, bouquet] = await Promise.all([
          request<Flower[]>("/api/admin/flowers"),
          bouquetId
            ? request<Bouquet>(`/api/admin/bouquets/${encodeURIComponent(bouquetId)}`)
            : Promise.resolve(null),
        ]);
        if (!active) return;
        setFlowers(flowerList);
        if (bouquet) {
          setDraft({
            name: bouquet.name,
            slug: bouquet.slug,
            description: bouquet.description ?? "",
            price: bouquet.price,
            images: (bouquet.images ?? []).filter((image) => /^https?:\/\//.test(image)),
            colors: bouquet.colors ?? [],
            featured: bouquet.featured,
            items: bouquet.items ?? [],
            occasionIds: bouquet.occasionIds ?? [],
          });
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load bouquet data.");
          setLoadFailed(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [bouquetId]);

  function patch(values: Partial<BouquetDraft>) {
    setDraft((current) => ({ ...current, ...values }));
  }

  function toggleFlower(flowerId: string, selected: boolean) {
    if (selected) {
      patch({ items: [...draft.items, { flowerId, quantity: 1 }] });
    } else {
      patch({ items: draft.items.filter((item) => item.flowerId !== flowerId) });
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!draft.images.some((url) => /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url))) {
      setError("Upload at least one image to Cloudinary before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        name: draft.name.trim(),
        slug: (draft.slug.trim() || slugify(draft.name)).toLowerCase(),
        price: Number(draft.price),
      };
      await request(
        bouquetId
          ? `/api/admin/bouquets/${encodeURIComponent(bouquetId)}`
          : "/api/admin/bouquets",
        {
          method: bouquetId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      router.push("/admin/bouquets");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bouquet was not saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="rounded-xl bg-white/80 p-8 text-sm text-ink-soft">Loading bouquet…</p>;
  }
  if (editing && loadFailed) {
    return (
      <div className="rounded-xl border border-ink/10 bg-white/80 p-8">
        <p role="alert" className="text-sm text-red-800">{error}</p>
        <Link href="/admin/bouquets" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft size={15} /> Back to bouquets
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl">
      <Link href="/admin/bouquets" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to bouquets
      </Link>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">{editing ? "Edit bouquet" : "Create bouquet"}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Upload one or more Cloudinary images. The first image is used as the cover across the storefront.
      </p>

      <form onSubmit={save} className="mt-6 space-y-6 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Bouquet name
            <input
              required
              maxLength={120}
              className={fieldClass}
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value, ...(!editing ? { slug: slugify(event.target.value) } : {}) })}
            />
          </label>
          <label className="text-sm font-semibold">
            URL slug
            <input
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={120}
              className={fieldClass}
              value={draft.slug}
              onChange={(event) => patch({ slug: event.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            Price (INR)
            <input
              required
              type="number"
              min={0}
              step="0.01"
              className={fieldClass}
              value={draft.price}
              onChange={(event) => patch({ price: Number(event.target.value) })}
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold">
            <input type="checkbox" checked={draft.featured} onChange={(event) => patch({ featured: event.target.checked })} />
            Feature this bouquet
          </label>
        </div>

        <label className="block text-sm font-semibold">
          Description
          <textarea
            rows={4}
            maxLength={20_000}
            className={fieldClass}
            value={draft.description}
            onChange={(event) => patch({ description: event.target.value })}
          />
        </label>

        <section>
          <h2 className="text-sm font-semibold">Color options</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Add colors customers can choose when ordering. The bouquet price stays the same for every color.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={colorInput}
              maxLength={60}
              onChange={(event) => setColorInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addColor();
                }
              }}
              placeholder="e.g. Red, White, Pink"
              aria-label="Bouquet color"
              className={fieldClass}
            />
            <button
              type="button"
              onClick={addColor}
              disabled={!colorInput.trim()}
              className="mt-1 shrink-0 rounded-md border border-ink/10 px-4 text-sm font-semibold disabled:opacity-50"
            >
              Add color
            </button>
          </div>
          {draft.colors.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {draft.colors.map((color) => (
                <li key={color}>
                  <button
                    type="button"
                    onClick={() => patch({ colors: draft.colors.filter((item) => item !== color) })}
                    aria-label={`Remove ${color} color`}
                    className="inline-flex items-center gap-2 rounded-full bg-sage/40 px-3 py-1.5 text-sm font-medium text-ink hover:bg-blush"
                  >
                    {color}<span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-ink-soft">No color selection will be shown to customers.</p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Bouquet images</h2>
          <CloudinaryUpload
            label="Upload bouquet images"
            value={draft.images}
            onChange={(images) => patch({ images })}
          />
          <p className="mt-2 text-xs text-ink-soft">
            Upload JPEG, PNG, WebP, or GIF images (up to 8 MB each). Removing an image here only detaches it from this bouquet.
          </p>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Included flowers (optional)</h2>
              <p className="mt-1 text-xs text-ink-soft">Select flowers displayed as the bouquet contents.</p>
            </div>
            {draft.items.length > 0 && (
              <button type="button" onClick={() => patch({ items: [] })} className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
                <Trash2 size={13} /> Clear selection
              </button>
            )}
          </div>
          {flowers.length === 0 ? (
            <p className="rounded-md bg-ivory-deep p-3 text-sm text-ink-soft">No flowers are available to select.</p>
          ) : (
            <div className="grid max-h-72 gap-2 overflow-y-auto rounded-lg border border-ink/10 p-3 sm:grid-cols-2">
              {flowers.map((flower) => {
                const item = draft.items.find((entry) => entry.flowerId === flower.id);
                return (
                  <div key={flower.id} className="flex items-center gap-2 rounded-md bg-ivory/70 p-2">
                    <input
                      type="checkbox"
                      checked={Boolean(item)}
                      onChange={(event) => toggleFlower(flower.id, event.target.checked)}
                      aria-label={`Include ${flower.name}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{flower.name}</span>
                    {item && (
                      <input
                        type="number"
                        min={1}
                        max={100_000}
                        aria-label={`${flower.name} quantity`}
                        className="w-16 rounded border border-ink/10 bg-white px-2 py-1 text-sm"
                        value={item.quantity}
                        onChange={(event) => patch({
                          items: draft.items.map((entry) =>
                            entry.flowerId === flower.id
                              ? { ...entry, quantity: Math.max(1, Number(event.target.value) || 1) }
                              : entry,
                          ),
                        })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {error && <p role="alert" className="rounded-md bg-blush px-4 py-3 text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-50">
            <Save size={15} /> {saving ? "Saving…" : editing ? "Save changes" : "Create bouquet"}
          </button>
          <Link href="/admin/bouquets" className="rounded-md border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink-soft">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
