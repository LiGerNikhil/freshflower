"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flower, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminThumb } from "@/components/admin/AdminThumb";
import type { Bouquet } from "@/lib/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? `Request failed (${response.status}).`);
  }
  return body as T;
}

export function BouquetsManager() {
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function load() {
    try {
      setBouquets(await request<Bouquet[]>("/api/admin/bouquets"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load bouquets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    request<Bouquet[]>("/api/admin/bouquets")
      .then((items) => {
        if (active) setBouquets(items);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load bouquets.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function remove(id: string) {
    setWorking(id);
    setError("");
    try {
      await request<{ ok: true }>(`/api/admin/bouquets/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setConfirmDelete(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete bouquet.");
    } finally {
      setWorking(null);
    }
  }

  const visible = bouquets.filter((bouquet) =>
    `${bouquet.name} ${bouquet.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Flower size={13} /> Catalogue
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Bouquets</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Manage bouquet details, pricing, included flowers, and Cloudinary images.
          </p>
        </div>
        <Link
          href="/admin/bouquets/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-ivory hover:bg-ink-soft"
        >
          <Plus size={15} /> New bouquet
        </Link>
      </div>

      <div className="relative mb-4 max-w-lg">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search bouquet name or slug"
          aria-label="Search bouquets"
          className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-blush px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">Bouquet</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Included flowers</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((bouquet) => (
                <tr key={bouquet.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AdminThumb token={bouquet.images?.[0]} name={bouquet.name} className="h-14 w-14" />
                      <div className="min-w-0">
                        <p className="font-semibold">{bouquet.name}</p>
                        <p className="truncate text-xs text-ink-soft">/{bouquet.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{bouquet.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{bouquet.items?.length ?? 0}</td>
                  <td className="px-4 py-3">{bouquet.featured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/bouquets/${encodeURIComponent(bouquet.id)}/edit`}
                        aria-label={`Edit ${bouquet.name}`}
                        className="rounded-md p-2 hover:bg-ink/5"
                      >
                        <Pencil size={15} />
                      </Link>
                      {confirmDelete === bouquet.id ? (
                        <button
                          type="button"
                          disabled={working === bouquet.id}
                          onClick={() => void remove(bouquet.id)}
                          className="rounded-md bg-blush px-3 py-2 text-xs disabled:opacity-50"
                        >
                          {working === bouquet.id ? "Deleting…" : "Confirm"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Delete ${bouquet.name}`}
                          onClick={() => setConfirmDelete(bouquet.id)}
                          className="rounded-md p-2 hover:bg-blush"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-soft">No bouquets found.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-soft">Loading bouquets…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
