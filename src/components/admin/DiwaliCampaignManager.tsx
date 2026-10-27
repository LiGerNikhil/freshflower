"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, CheckCircle2, ClipboardList, CreditCard, RefreshCw, Search, Save, Sparkles } from "lucide-react";
import { CollectionBannerField } from "@/components/admin/CollectionBannerField";
import { DiwaliCampaignBanner } from "@/components/home/DiwaliCampaignBanner";
import { formatINR } from "@/lib/admin/analytics";
import type { DeliveryArea, DiwaliBooking, DiwaliBookingStatus, FestivalCollection, Flower } from "@/lib/types";

type CampaignDraft = Omit<FestivalCollection, "id" | "createdAt" | "updatedAt"> & {
  advanceBooking: NonNullable<FestivalCollection["advanceBooking"]>;
};
type CampaignProduct = Flower & { sku?: string };
type CampaignAdminPayload = {
  campaign: FestivalCollection | null;
  products: CampaignProduct[];
  categories: { id: string; name: string }[];
  areas: DeliveryArea[];
};

const fieldClass = "mt-1 w-full rounded-md border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const bookingStatuses: { value: DiwaliBookingStatus; label: string }[] = [
  { value: "new_request", label: "New request" },
  { value: "under_review", label: "Under review" },
  { value: "availability_confirmed", label: "Availability confirmed" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

function dateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() + 330 * 60_000).toISOString().slice(0, 16);
}

function newCampaignDraft(): CampaignDraft {
  const year = Number(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", year: "numeric" }).format(new Date()));
  return {
    title: "Hosting a Diwali Party? We’ve Got Your Flowers Covered!",
    slug: "diwali",
    subtitle: "Diwali Special · Advance bookings open",
    description: "Beat the festive rush. Choose your flowers, tell us how much you need, and request your preferred delivery date with FreshFlower.zone.",
    bannerImage: "",
    status: "draft",
    active: false,
    startsAt: `${year}-10-26T00:00`,
    endsAt: `${year}-11-02T00:00`,
    productIds: [],
    categoryIds: [],
    sortOrder: 0,
    badgeText: "DIWALI SPECIAL · ADVANCE BOOKINGS OPEN",
    lastOrderByText: "",
    poojaCollection: false,
    whatsappBulkOrderEnabled: false,
    keywords: ["diwali flowers", "advance booking"],
    advanceBooking: {
      description: "Beat the festive rush. Choose your flowers, tell us how much you need, and reserve your preferred delivery date.",
      announcement: "DIWALI SPECIAL · ADVANCE BOOKINGS OPEN",
      primaryCtaLabel: "Book Your Diwali Flowers",
      secondaryCtaLabel: "Explore Diwali Collection",
      deliveryDates: [`${year}-10-30`, `${year}-10-31`, `${year}-11-01`],
      deliveryTimePreferences: ["Early morning (5 AM – 8 AM)", "Morning (8 AM – 11 AM)", "Afternoon (12 PM – 4 PM)"],
      deliveryAreaIds: [],
      dailyBookingLimit: 0,
      earlyMorningDelivery: true,
      customRequirementsEnabled: true,
      productSettings: [],
    },
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status}).`);
  return body as T;
}

function settingFor(campaign: CampaignDraft, product: CampaignProduct) {
  return campaign.advanceBooking.productSettings.find((setting) => setting.productId === product.id) ?? {
    productId: product.id,
    visible: true,
    featured: false,
    displayLabel: "",
    promotionalDescription: "",
    minQuantity: 1,
    maxQuantity: 99,
    bulkOrderEligible: false,
    eligibleVariants: (product.colorVariants ?? []).map((variant) => variant.color),
  };
}

export function DiwaliCampaignManager() {
  const [payload, setPayload] = useState<CampaignAdminPayload | null>(null);
  const [draft, setDraft] = useState<CampaignDraft>(newCampaignDraft());
  const [bookings, setBookings] = useState<DiwaliBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deliveryDateInput, setDeliveryDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryDateFilter, setDeliveryDateFilter] = useState("");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingBooking, setSavingBooking] = useState<string | null>(null);
  const [syncingBooking, setSyncingBooking] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [campaignPayload, bookingPayload] = await Promise.all([
      request<CampaignAdminPayload>("/api/admin/diwali/campaign"),
      request<DiwaliBooking[]>("/api/admin/diwali/bookings"),
    ]);
    setPayload(campaignPayload);
    setBookings(bookingPayload);
    if (campaignPayload.campaign?.advanceBooking) {
      setDraft({
        ...newCampaignDraft(),
        ...campaignPayload.campaign,
        startsAt: dateInput(campaignPayload.campaign.startsAt),
        endsAt: dateInput(campaignPayload.campaign.endsAt),
        advanceBooking: {
          ...newCampaignDraft().advanceBooking,
          ...campaignPayload.campaign.advanceBooking,
          bookingCutoffAt: dateInput(campaignPayload.campaign.advanceBooking.bookingCutoffAt),
        },
      } as CampaignDraft);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      request<CampaignAdminPayload>("/api/admin/diwali/campaign"),
      request<DiwaliBooking[]>("/api/admin/diwali/bookings"),
    ]).then(([campaignPayload, bookingPayload]) => {
      if (!active) return;
      setPayload(campaignPayload);
      setBookings(bookingPayload);
      if (campaignPayload.campaign?.advanceBooking) {
        setDraft({
          ...newCampaignDraft(),
          ...campaignPayload.campaign,
          startsAt: dateInput(campaignPayload.campaign.startsAt),
          endsAt: dateInput(campaignPayload.campaign.endsAt),
          advanceBooking: {
            ...newCampaignDraft().advanceBooking,
            ...campaignPayload.campaign.advanceBooking,
            bookingCutoffAt: dateInput(campaignPayload.campaign.advanceBooking.bookingCutoffAt),
          },
        } as CampaignDraft);
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load Diwali campaign data.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const patchDraft = (patch: Partial<CampaignDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const patchBookingSettings = (patch: Partial<CampaignDraft["advanceBooking"]>) => setDraft((current) => ({
    ...current,
    advanceBooking: { ...current.advanceBooking, ...patch },
  }));
  const productsById = useMemo(() => new Map((payload?.products ?? []).map((product) => [product.id, product])), [payload?.products]);
  const selectedProducts = draft.productIds.map((id) => productsById.get(id)).filter((product): product is CampaignProduct => Boolean(product));
  const filteredProducts = (payload?.products ?? []).filter((product) => {
    const query = productSearch.trim().toLowerCase();
    const categoryName = payload?.categories.find((category) => category.id === product.categoryId)?.name ?? "";
    const matchesQuery = !query || `${product.name} ${product.slug} ${product.sku ?? ""} ${categoryName}`.toLowerCase().includes(query);
    return matchesQuery && (categoryFilter === "all" || product.categoryId === categoryFilter);
  });
  const visibleBookings = bookings.filter((booking) => {
    const query = bookingSearch.trim().toLowerCase();
    const matchesQuery = !query || `${booking.reference} ${booking.customer.name} ${booking.customer.phone} ${booking.customer.email ?? ""}`.toLowerCase().includes(query);
    return matchesQuery
      && (statusFilter === "all" || booking.status === statusFilter)
      && (!deliveryDateFilter || booking.deliveryDate === deliveryDateFilter);
  });

  function toggleCampaignProduct(product: CampaignProduct, checked: boolean) {
    if (checked) {
      patchDraft({
        productIds: [...draft.productIds, product.id],
        advanceBooking: {
          ...draft.advanceBooking,
          productSettings: [...draft.advanceBooking.productSettings.filter((item) => item.productId !== product.id), settingFor(draft, product)],
        },
      });
    } else {
      patchDraft({
        productIds: draft.productIds.filter((id) => id !== product.id),
        advanceBooking: {
          ...draft.advanceBooking,
          productSettings: draft.advanceBooking.productSettings.filter((item) => item.productId !== product.id),
        },
      });
    }
  }

  function patchProductSetting(product: CampaignProduct, patch: Partial<(typeof draft.advanceBooking.productSettings)[number]>) {
    const next = settingFor(draft, product);
    patchBookingSettings({
      productSettings: [
        ...draft.advanceBooking.productSettings.filter((item) => item.productId !== product.id),
        { ...next, ...patch },
      ],
    });
  }

  function moveProduct(index: number, direction: -1 | 1) {
    const next = [...draft.productIds];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    patchDraft({ productIds: next });
  }

  function addDeliveryDate() {
    if (!deliveryDateInput || draft.advanceBooking.deliveryDates.includes(deliveryDateInput)) return;
    patchBookingSettings({ deliveryDates: [...draft.advanceBooking.deliveryDates, deliveryDateInput].sort() });
    setDeliveryDateInput("");
  }

  function addTimeWindow() {
    const value = timeInput.trim();
    if (!value || draft.advanceBooking.deliveryTimePreferences.includes(value)) return;
    patchBookingSettings({ deliveryTimePreferences: [...draft.advanceBooking.deliveryTimePreferences, value] });
    setTimeInput("");
  }

  async function saveCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const value = {
        ...draft,
        slug: "diwali",
        startsAt: draft.startsAt ? new Date(`${draft.startsAt}:00+05:30`).toISOString() : undefined,
        endsAt: draft.endsAt ? new Date(`${draft.endsAt}:00+05:30`).toISOString() : undefined,
        advanceBooking: {
          ...draft.advanceBooking,
          bookingCutoffAt: draft.advanceBooking.bookingCutoffAt
            ? new Date(`${draft.advanceBooking.bookingCutoffAt}:00+05:30`).toISOString()
            : undefined,
        },
      };
      await request("/api/admin/diwali/campaign", { method: "PUT", body: JSON.stringify(value) });
      await refresh();
      setSuccess("Diwali campaign settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the campaign.");
    } finally {
      setSaving(false);
    }
  }

  async function patchBooking(booking: DiwaliBooking, patch: { status?: DiwaliBookingStatus; internalNotes?: string }) {
    setSavingBooking(booking.id);
    setError("");
    try {
      const result = await request<{ booking: DiwaliBooking }>(`/api/admin/diwali/bookings/${encodeURIComponent(booking.id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setBookings((current) => current.map((item) => item.id === booking.id ? result.booking : item));
      setNotesDraft((current) => ({ ...current, [booking.id]: result.booking.internalNotes ?? "" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this booking.");
    } finally {
      setSavingBooking(null);
    }
  }

  async function syncBookingPayment(booking: DiwaliBooking) {
    setSyncingBooking(booking.id);
    setError("");
    setSuccess("");
    try {
      const result = await request<{ synced?: boolean; message?: string; paymentStatus?: string }>(`/api/admin/diwali/bookings/${encodeURIComponent(booking.id)}/sync-payment`, { method: "POST" });
      const refreshed = await request<DiwaliBooking[]>("/api/admin/diwali/bookings");
      setBookings(refreshed);
      setSuccess(result.synced ? `Payment synced · ${result.paymentStatus ?? "updated"}.` : result.message ?? "Nothing to sync yet.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sync this payment.");
    } finally {
      setSyncingBooking(null);
    }
  }

  if (loading) return <p className="rounded-xl bg-white/80 p-8 text-sm text-ink-soft">Loading Diwali campaign…</p>;

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold"><Sparkles size={13} /> Campaign management</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Diwali campaign & pre-bookings</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-soft">Configure campaign dates, catalog products, delivery eligibility, and review genuine advance-booking requests.</p>
        </div>
        <p className={`rounded-full px-3 py-1.5 text-xs font-bold ${draft.status === "published" && draft.active ? "bg-sage/40 text-sage-ink" : "bg-gold/15 text-ink-soft"}`}>
          {draft.status === "published" && draft.active ? "Campaign enabled" : "Draft / disabled"}
        </p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-md bg-blush px-4 py-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="mb-4 rounded-md bg-sage/40 px-4 py-3 text-sm text-sage-ink">{success}</p>}

      <form onSubmit={saveCampaign} className="space-y-6">
        <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm md:p-7">
          <h2 className="flex items-center gap-2 font-display text-2xl"><CalendarDays size={20} className="text-gold" /> Campaign settings</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold md:col-span-2">Campaign headline<input required maxLength={120} className={fieldClass} value={draft.title} onChange={(event) => patchDraft({ title: event.target.value })} /></label>
            <label className="text-sm font-semibold md:col-span-2">Campaign summary<textarea maxLength={500} rows={2} className={fieldClass} value={draft.subtitle ?? ""} onChange={(event) => patchDraft({ subtitle: event.target.value })} /></label>
            <label className="text-sm font-semibold md:col-span-2">Booking page description<textarea maxLength={2000} rows={3} className={fieldClass} value={draft.advanceBooking.description} onChange={(event) => patchBookingSettings({ description: event.target.value })} /></label>
            <label className="text-sm font-semibold">Announcement / eyebrow<input maxLength={240} className={fieldClass} value={draft.advanceBooking.announcement} onChange={(event) => patchBookingSettings({ announcement: event.target.value })} /></label>
            <label className="text-sm font-semibold">Collection badge<input maxLength={60} className={fieldClass} value={draft.badgeText ?? ""} onChange={(event) => patchDraft({ badgeText: event.target.value })} /></label>
            <label className="text-sm font-semibold">Urgency / cut-off message<input maxLength={160} className={fieldClass} value={draft.lastOrderByText ?? ""} onChange={(event) => patchDraft({ lastOrderByText: event.target.value })} placeholder="Shown on the homepage campaign section" /></label>
            <label className="text-sm font-semibold">Primary button label<input maxLength={60} className={fieldClass} value={draft.advanceBooking.primaryCtaLabel} onChange={(event) => patchBookingSettings({ primaryCtaLabel: event.target.value })} /></label>
            <label className="text-sm font-semibold">Secondary button label<input maxLength={60} className={fieldClass} value={draft.advanceBooking.secondaryCtaLabel} onChange={(event) => patchBookingSettings({ secondaryCtaLabel: event.target.value })} /></label>
            <label className="text-sm font-semibold">Campaign opens (India time)<input type="datetime-local" required className={fieldClass} value={draft.startsAt?.length === 16 ? draft.startsAt : dateInput(draft.startsAt)} onChange={(event) => patchDraft({ startsAt: event.target.value })} /></label>
            <label className="text-sm font-semibold">Campaign closes (exclusive, India time)<input type="datetime-local" required className={fieldClass} value={draft.endsAt?.length === 16 ? draft.endsAt : dateInput(draft.endsAt)} onChange={(event) => patchDraft({ endsAt: event.target.value })} /></label>
            <label className="text-sm font-semibold">Booking cut-off (optional, India time)<input type="datetime-local" className={fieldClass} value={draft.advanceBooking.bookingCutoffAt?.slice(0, 16) ?? ""} onChange={(event) => patchBookingSettings({ bookingCutoffAt: event.target.value || undefined })} /></label>
            <label className="text-sm font-semibold">Maximum booking requests per delivery date (0 = unlimited)<input type="number" min={0} max={10000} className={fieldClass} value={draft.advanceBooking.dailyBookingLimit ?? 0} onChange={(event) => patchBookingSettings({ dailyBookingLimit: Number(event.target.value) })} /></label>
            <label className="text-sm font-semibold">Status<select className={fieldClass} value={draft.status} onChange={(event) => patchDraft({ status: event.target.value as "draft" | "published", active: false })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold"><input type="checkbox" checked={draft.active} disabled={draft.status !== "published"} onChange={(event) => patchDraft({ active: event.target.checked })} /> Enable on the website</label>
          </div>
          <div className="mt-5"><CollectionBannerField value={draft.bannerImage ?? ""} onChange={(bannerImage) => patchDraft({ bannerImage })} /></div>
          <div className="mt-4 rounded-lg border border-gold/20 bg-ivory p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Homepage section preview</h3>
              <p className="text-xs text-ink-soft">Uses the same component visitors see. Nothing is published from this preview.</p>
            </div>
            <div className="mt-2 overflow-hidden rounded-lg">
              <DiwaliCampaignBanner campaign={draft as unknown as FestivalCollection} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm md:p-7">
          <h2 className="font-display text-2xl">Delivery dates, times & areas</h2>
          <p className="mt-1 text-sm text-ink-soft">Only these dates and windows are offered. Requests remain subject to availability confirmation.</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Add a delivery date</label>
              <div className="mt-1 flex gap-2"><input type="date" value={deliveryDateInput} onChange={(event) => setDeliveryDateInput(event.target.value)} className={fieldClass} /><button type="button" onClick={addDeliveryDate} className="rounded-md bg-ink px-4 text-sm font-semibold text-ivory">Add</button></div>
              <ul className="mt-3 flex flex-wrap gap-2">{draft.advanceBooking.deliveryDates.map((date) => <li key={date}><button type="button" onClick={() => patchBookingSettings({ deliveryDates: draft.advanceBooking.deliveryDates.filter((item) => item !== date) })} className="rounded-full bg-sage/30 px-3 py-1.5 text-xs font-semibold">{date} ×</button></li>)}</ul>
            </div>
            <div>
              <label className="text-sm font-semibold">Add a delivery time preference</label>
              <div className="mt-1 flex gap-2"><input value={timeInput} onChange={(event) => setTimeInput(event.target.value)} placeholder="e.g. Early morning (5 AM – 8 AM)" className={fieldClass} /><button type="button" onClick={addTimeWindow} className="rounded-md bg-ink px-4 text-sm font-semibold text-ivory">Add</button></div>
              <ul className="mt-3 flex flex-wrap gap-2">{draft.advanceBooking.deliveryTimePreferences.map((time) => <li key={time}><button type="button" onClick={() => patchBookingSettings({ deliveryTimePreferences: draft.advanceBooking.deliveryTimePreferences.filter((item) => item !== time) })} className="rounded-full bg-sage/30 px-3 py-1.5 text-xs font-semibold">{time} ×</button></li>)}</ul>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={draft.advanceBooking.earlyMorningDelivery} onChange={(event) => patchBookingSettings({ earlyMorningDelivery: event.target.checked })} /> Offer early-morning delivery requests</label>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={draft.advanceBooking.customRequirementsEnabled} onChange={(event) => patchBookingSettings({ customRequirementsEnabled: event.target.checked })} /> Allow custom / bulk requirements</label>
          </div>
          <fieldset className="mt-5" disabled={!payload?.areas.length}>
            <legend className="text-sm font-semibold">Eligible service areas (leave all unchecked for every active area)</legend>
            {!payload?.areas.length ? <p className="mt-2 text-sm text-ink-soft">No active delivery areas are configured.</p> : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {payload.areas.map((area) => <label key={area.id} className="flex items-center gap-2 rounded-md border border-ink/10 p-2 text-sm"><input type="checkbox" checked={draft.advanceBooking.deliveryAreaIds.includes(area.id)} onChange={(event) => patchBookingSettings({ deliveryAreaIds: event.target.checked ? [...draft.advanceBooking.deliveryAreaIds, area.id] : draft.advanceBooking.deliveryAreaIds.filter((id) => id !== area.id) })} />{area.name}</label>)}
              </div>
            )}
          </fieldset>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm md:p-7">
          <h2 className="font-display text-2xl">Choose and arrange catalog products</h2>
          <p className="mt-1 text-sm text-ink-soft">Select canonical products; their current catalog price, image, inventory and variants stay authoritative.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-ink-soft/60" /><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search product, category or SKU" className={`${fieldClass} pl-9`} /></label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={fieldClass}><option value="all">All categories</option>{payload?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          </div>
          <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-ink/10 p-2">
            {filteredProducts.map((product) => <label key={product.id} className="flex items-center gap-3 border-b border-ink/5 px-2 py-2 last:border-0"><input type="checkbox" checked={draft.productIds.includes(product.id)} onChange={(event) => toggleCampaignProduct(product, event.target.checked)} /><span className="min-w-0 flex-1 truncate text-sm">{product.name}<span className="ml-2 text-xs text-ink-soft">{payload?.categories.find((category) => category.id === product.categoryId)?.name}</span></span><span className="text-xs font-semibold">{formatINR(product.price)}</span></label>)}
            {!filteredProducts.length && <p className="p-4 text-center text-sm text-ink-soft">No catalog products match.</p>}
          </div>
          {selectedProducts.length > 0 && <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold">Selected products · order and campaign options</h3>
            {selectedProducts.map((product, index) => {
              const setting = settingFor(draft, product);
              return <article key={product.id} className="rounded-lg border border-ink/10 bg-ivory/50 p-4">
                <div className="flex flex-wrap items-center gap-2"><span className="min-w-0 flex-1 font-semibold">{index + 1}. {product.name} · {formatINR(product.price)}</span><button type="button" disabled={index === 0} onClick={() => moveProduct(index, -1)} aria-label={`Move ${product.name} up`} className="rounded border p-2 disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" disabled={index === selectedProducts.length - 1} onClick={() => moveProduct(index, 1)} aria-label={`Move ${product.name} down`} className="rounded border p-2 disabled:opacity-30"><ArrowDown size={14} /></button></div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold">Campaign display label<input value={setting.displayLabel ?? ""} maxLength={120} onChange={(event) => patchProductSetting(product, { displayLabel: event.target.value })} className={fieldClass} /></label>
                  <label className="text-xs font-semibold">Promotional description<input value={setting.promotionalDescription ?? ""} maxLength={500} onChange={(event) => patchProductSetting(product, { promotionalDescription: event.target.value })} className={fieldClass} /></label>
                  <label className="text-xs font-semibold">Minimum quantity<input type="number" min={1} max={999} value={setting.minQuantity} onChange={(event) => patchProductSetting(product, { minQuantity: Number(event.target.value) })} className={fieldClass} /></label>
                  <label className="text-xs font-semibold">Maximum quantity<input type="number" min={1} max={999} value={setting.maxQuantity} onChange={(event) => patchProductSetting(product, { maxQuantity: Number(event.target.value) })} className={fieldClass} /></label>
                </div>
                <div className="mt-3 flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={setting.visible} onChange={(event) => patchProductSetting(product, { visible: event.target.checked })} />Visible in campaign</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={setting.featured} onChange={(event) => patchProductSetting(product, { featured: event.target.checked })} />Feature product</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={setting.bulkOrderEligible} onChange={(event) => patchProductSetting(product, { bulkOrderEligible: event.target.checked })} />Bulk orders welcome</label>
                </div>
                {!!product.colorVariants?.length && <fieldset className="mt-3"><legend className="text-xs font-semibold">Eligible variants</legend><div className="mt-2 flex flex-wrap gap-3">{product.colorVariants.map((variant) => <label key={variant.color} className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={setting.eligibleVariants.includes(variant.color)} onChange={(event) => patchProductSetting(product, { eligibleVariants: event.target.checked ? [...setting.eligibleVariants, variant.color] : setting.eligibleVariants.filter((color) => color !== variant.color) })} />{variant.color}</label>)}</div></fieldset>}
              </article>;
            })}
          </div>}
        </section>
        <button type="submit" disabled={saving} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory disabled:opacity-50"><Save size={16} />{saving ? "Saving campaign…" : "Save campaign settings"}</button>
      </form>

      <section className="mt-12" aria-labelledby="diwali-bookings-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold"><ClipboardList size={13} /> Advance orders</p><h2 id="diwali-bookings-heading" className="mt-1 font-display text-3xl">Booking requests</h2><p className="mt-1 text-sm text-ink-soft">{bookings.length} saved requests · advance payments are collected via Razorpay and verified before confirmation.</p></div>
          <button type="button" onClick={() => void refresh()} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold">Refresh requests</button>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <input value={bookingSearch} onChange={(event) => setBookingSearch(event.target.value)} placeholder="Search reference, customer, phone" className={fieldClass} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={fieldClass}><option value="all">All statuses</option>{bookingStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
          <label className="text-xs font-semibold text-ink-soft">Delivery date<input type="date" value={deliveryDateFilter} onChange={(event) => setDeliveryDateFilter(event.target.value)} className={fieldClass} /></label>
        </div>
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white/80 shadow-sm">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-ivory-deep/60 text-[11px] uppercase tracking-wide text-ink-soft"><tr><th className="p-3">Reference / customer</th><th className="p-3">Delivery</th><th className="p-3">Items</th><th className="p-3">Estimate</th><th className="p-3">Payment</th><th className="p-3">Linked order</th><th className="p-3">Status</th><th className="p-3">Received</th></tr></thead>
            <tbody>{visibleBookings.map((booking) => <Fragment key={booking.id}><tr className="border-t border-ink/5 align-top">
              <td className="p-3"><button type="button" onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)} className="text-left font-semibold underline decoration-ink/20 underline-offset-2">{booking.reference}</button><span className="mt-1 block">{booking.customer.name}</span><a href={`tel:${booking.customer.phone}`} className="text-xs text-ink-soft">{booking.customer.phone}</a>{booking.customer.email && <span className="block text-xs text-ink-soft">{booking.customer.email}</span>}</td>
              <td className="p-3">{booking.deliveryDate}<span className="mt-1 block text-xs text-ink-soft">{booking.deliveryTimePreference}</span><span className="block text-xs text-ink-soft">{payload?.areas.find((area) => area.id === booking.deliveryAreaId)?.name ?? booking.deliveryAreaId}</span></td>
              <td className="p-3">{booking.items.length} item{booking.items.length === 1 ? "" : "s"}<span className="mt-1 block max-w-56 truncate text-xs text-ink-soft">{booking.items.map((item) => `${item.quantity}× ${item.name}${item.variant ? ` (${item.variant})` : ""}`).join(", ")}</span></td>
              <td className="p-3">{formatINR(booking.estimatedAmount ?? booking.paymentAmount ?? 0)}{booking.deliveryFee ? <span className="mt-1 block text-[11px] text-ink-soft">incl. {formatINR(booking.deliveryFee)} Porter delivery</span> : null}{booking.needsQuote && <span className="mt-1 block text-[11px] font-semibold text-gold">Quote pending</span>}</td>
              <td className="p-3"><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold uppercase ${booking.paymentStatus === "paid" ? "bg-sage/40 text-sage-ink" : booking.paymentStatus === "failed" ? "bg-blush text-red-800" : "bg-gold/15 text-ink-soft"}`}>{booking.paymentStatus ?? "pending"}</span>{booking.paymentAmount != null && <span className="mt-1 block text-xs font-semibold">{formatINR(booking.paymentAmount)}</span>}{booking.razorpayPaymentId && <span className="mt-1 block max-w-44 truncate font-mono text-[11px] text-ink-soft" title={booking.razorpayPaymentId}>{booking.razorpayPaymentId}</span>}{booking.razorpayPaymentMethod && <span className="block text-[11px] uppercase text-ink-soft">{booking.razorpayPaymentMethod}</span>}{booking.paidAt && <span className="block text-[11px] text-ink-soft">{new Date(booking.paidAt).toLocaleString("en-IN")}</span>}</td>
              <td className="p-3">{booking.orderId ? <><a href={`/admin/orders/${encodeURIComponent(booking.orderId)}`} className="inline-flex items-center gap-1 font-semibold text-ink underline decoration-ink/20 underline-offset-2">Order <CreditCard size={12} /></a><button type="button" disabled={syncingBooking === booking.id} onClick={() => void syncBookingPayment(booking)} className="mt-2 flex items-center gap-1 rounded-md border border-ink/10 bg-white px-2 py-1 text-[11px] font-semibold disabled:opacity-60"><RefreshCw size={11} className={syncingBooking === booking.id ? "animate-spin" : ""} />{syncingBooking === booking.id ? "Syncing…" : "Sync payment"}</button></> : <span className="text-xs text-ink-soft">Not started</span>}</td>
              <td className="p-3"><select value={booking.status} disabled={savingBooking === booking.id} onChange={(event) => void patchBooking(booking, { status: event.target.value as DiwaliBookingStatus })} className="max-w-48 rounded-md border border-ink/10 bg-white p-2 text-xs">{bookingStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td>
              <td className="p-3 text-xs text-ink-soft">{new Date(booking.createdAt).toLocaleString("en-IN")}</td>
            </tr>
              {expandedBooking === booking.id && <tr className="border-t border-ink/5"><td colSpan={8} className="bg-ivory/60 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">Delivery address</h3><p className="mt-1 text-sm">{booking.address}, {booking.locality}, {booking.pincode}</p>{booking.specialInstructions && <p className="mt-2 text-sm"><strong>Instructions:</strong> {booking.specialInstructions}</p>}{booking.customRequirements && <p className="mt-2 text-sm"><strong>Custom / bulk:</strong> {booking.customRequirements}</p>}<p className="mt-2 text-sm font-semibold">{booking.customer.whatsapp ? `WhatsApp: ${booking.customer.whatsapp}` : "WhatsApp matches mobile"}</p></div>
                  <div><h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">Requested products</h3><ul className="mt-1 space-y-1 text-sm">{booking.items.map((item, index) => <li key={`${item.productId}-${index}`}>{item.quantity} × {item.name}{item.variant ? ` · ${item.variant}` : ""} ({item.unitLabel}){item.price != null ? ` · ${formatINR(item.price)} each` : ""}</li>)}</ul><label className="mt-3 block text-xs font-semibold">Internal notes<textarea value={notesDraft[booking.id] ?? booking.internalNotes ?? ""} onChange={(event) => setNotesDraft((current) => ({ ...current, [booking.id]: event.target.value }))} maxLength={4000} rows={2} className={fieldClass} /></label><button type="button" disabled={savingBooking === booking.id} onClick={() => void patchBooking(booking, { internalNotes: notesDraft[booking.id] ?? booking.internalNotes ?? "" })} className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-ivory"><CheckCircle2 size={13} />Save notes</button></div>
                </div>
              </td></tr>}
            </Fragment>)}</tbody>
          </table>
          {!visibleBookings.length && <p className="p-8 text-center text-sm text-ink-soft">No booking requests match these filters.</p>}
        </div>
      </section>
    </main>
  );
}
