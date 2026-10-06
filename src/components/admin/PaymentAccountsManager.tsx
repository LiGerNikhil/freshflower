"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Loader2, Pencil, Power, QrCode, Save, Star } from "lucide-react";
import { api } from "@/lib/api/client";
import type { CloudinaryAssetRef, PaymentAccount } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none";

type Draft = {
  id?: string;
  label: string;
  receiverName: string;
  upiId: string;
  qrAsset?: CloudinaryAssetRef;
  active: boolean;
  defaultAccount: boolean;
};

const emptyDraft: Draft = {
  label: "",
  receiverName: "",
  upiId: "",
  active: true,
  defaultAccount: false,
};

function assetFromUpload(upload: { secureUrl: string; publicId: string; resourceType: "image" | "video" }): CloudinaryAssetRef {
  return {
    secureUrl: upload.secureUrl,
    publicId: upload.publicId,
    resourceType: "image",
  };
}

export function PaymentAccountsManager() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function loadAccounts() {
    setLoading(true);
    setError("");
    try {
      const body = await api("/api/admin/payment-accounts");
      setAccounts(Array.isArray(body) ? body as PaymentAccount[] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payment accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAccounts();
  }, []);

  const activeCount = useMemo(() => accounts.filter((account) => account.active).length, [accounts]);
  const defaultAccount = accounts.find((account) => account.active && account.defaultAccount);

  function edit(account: PaymentAccount) {
    setError("");
    setDraft({
      id: account.id,
      label: account.label,
      receiverName: account.receiverName,
      upiId: account.upiId,
      qrAsset: account.qrAsset,
      active: account.active,
      defaultAccount: account.defaultAccount,
    });
  }

  async function uploadQr(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("resourceType", "image");
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "QR upload failed.");
      setDraft((current) => ({ ...current, qrAsset: assetFromUpload(body) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "QR upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError("");
    if (!draft.label.trim() || !draft.receiverName.trim() || !draft.upiId.trim()) {
      setError("Label, receiver name, and UPI ID are required.");
      return;
    }
    if (!draft.qrAsset) {
      setError("Upload a QR image before saving this account.");
      return;
    }
    setSaving(true);
    try {
      const id = draft.id ?? `payacct-${Date.now().toString(36)}`;
      const payload = {
        id,
        label: draft.label.trim(),
        receiverName: draft.receiverName.trim(),
        upiId: draft.upiId.trim(),
        qrAsset: draft.qrAsset,
        active: draft.active,
        defaultAccount: draft.active && draft.defaultAccount,
      };
      await api(draft.id ? `/api/admin/payment-accounts/${encodeURIComponent(draft.id)}` : "/api/admin/payment-accounts", {
        method: draft.id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setDraft(emptyDraft);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save payment account.");
    } finally {
      setSaving(false);
    }
  }

  async function patchAccount(account: PaymentAccount, patch: Partial<PaymentAccount>) {
    setError("");
    try {
      await api(`/api/admin/payment-accounts/${encodeURIComponent(account.id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update payment account.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <QrCode size={13} /> Payments
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">UPI accounts</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Manage manual UPI receiver accounts and QR images. Orders keep a snapshot of the selected account, so future edits never invalidate existing payment evidence.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-blush px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
      {saved && <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-sage px-4 py-2 text-sm font-semibold text-sage-ink"><Check size={15} /> Saved</p>}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            {draft.id ? "Edit account" : "Add account"}
          </p>
          <div className="space-y-4">
            <Field label="Label" value={draft.label} onChange={(value) => setDraft((current) => ({ ...current, label: value }))} placeholder="Primary UPI" />
            <Field label="Receiver name" value={draft.receiverName} onChange={(value) => setDraft((current) => ({ ...current, receiverName: value }))} placeholder="FreshFlower Zone" />
            <Field label="UPI ID" value={draft.upiId} onChange={(value) => setDraft((current) => ({ ...current, upiId: value }))} placeholder="freshflower@upi" />

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">QR image</p>
              {draft.qrAsset && (
                <div className="mb-3 rounded-lg border border-ink/10 bg-ivory-deep/40 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.qrAsset.secureUrl} alt="UPI QR preview" className="mx-auto h-44 w-44 rounded-md bg-white object-contain" />
                  <p className="mt-2 break-all text-center text-[11px] text-ink-soft">{draft.qrAsset.publicId}</p>
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-ink/25 px-4 py-2.5 text-sm font-semibold text-ink-soft hover:border-gold hover:text-ink">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploading ? "Uploading..." : draft.qrAsset ? "Replace QR" : "Upload QR"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(event) => void uploadQr(event.target.files?.[0])} className="sr-only" />
              </label>
              <p className="mt-2 text-xs leading-5 text-ink-soft">JPEG, PNG, WebP, or GIF. The server verifies file type, size, and image content before Cloudinary upload.</p>
            </div>

            <label className="flex items-center justify-between rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm font-semibold">
              Active
              <input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked, defaultAccount: event.target.checked ? current.defaultAccount : false }))} className="h-4 w-4 accent-ink" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm font-semibold">
              Default active account
              <input type="checkbox" checked={draft.active && draft.defaultAccount} disabled={!draft.active} onChange={(event) => setDraft((current) => ({ ...current, defaultAccount: event.target.checked }))} className="h-4 w-4 accent-ink" />
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={() => void save()} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving..." : "Save account"}
              </button>
              {draft.id && (
                <button type="button" onClick={() => setDraft(emptyDraft)} className="rounded-md border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink transition hover:border-gold">
                  Cancel edit
                </button>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Accounts" value={String(accounts.length)} />
            <Stat label="Active" value={String(activeCount)} />
            <Stat label="Default" value={defaultAccount?.label ?? "None"} />
          </div>

          {loading ? (
            <div className="rounded-xl border border-ink/10 bg-white/80 p-8 text-sm text-ink-soft shadow-sm">Loading payment accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-ink/10 bg-white/80 p-8 text-sm text-ink-soft shadow-sm">No UPI accounts yet. Add one active default account to enable manual UPI checkout.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {accounts.map((account) => (
                <article key={account.id} className="rounded-xl border border-ink/10 bg-white/80 p-4 shadow-sm">
                  <div className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={account.qrAsset.secureUrl} alt={`${account.label} QR`} className="h-24 w-24 shrink-0 rounded-lg border border-ink/10 bg-white object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-display text-xl text-ink">{account.label}</h2>
                        <span className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold ${account.active ? "bg-sage text-sage-ink" : "bg-ink/10 text-ink-soft"}`}>{account.active ? "Active" : "Inactive"}</span>
                        {account.defaultAccount && <span className="rounded-sm bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold">Default</span>}
                      </div>
                      <p className="mt-1 text-sm font-medium text-ink">{account.receiverName}</p>
                      <p className="break-all text-sm text-ink-soft">{account.upiId}</p>
                      <p className="mt-1 break-all text-[11px] text-ink-soft">{account.qrAsset.publicId}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => edit(account)} className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink transition hover:border-gold">
                      <Pencil size={13} /> Edit
                    </button>
                    <button type="button" onClick={() => void patchAccount(account, { active: !account.active })} className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink transition hover:border-gold">
                      <Power size={13} /> {account.active ? "Deactivate" : "Activate"}
                    </button>
                    <button type="button" disabled={!account.active || account.defaultAccount} onClick={() => void patchAccount(account, { defaultAccount: true })} className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink transition hover:border-gold disabled:opacity-50">
                      <Star size={13} /> Make default
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/80 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="mt-1 truncate font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
