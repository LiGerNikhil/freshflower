"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Layers,
  MapPin,
  Plus,
  Tags,
  Trash2,
  Truck,
} from "lucide-react";
import { useOperations } from "@/components/providers/OperationsContext";
import { slotUsageBySlot } from "@/lib/delivery";
import { formatINR } from "@/lib/admin/analytics";
import { isoDay } from "@/lib/utils";

type Tab = "areas" | "slots" | "coverage";

const TABS: { value: Tab; label: string; icon: typeof MapPin }[] = [
  { value: "areas", label: "Areas", icon: MapPin },
  { value: "slots", label: "Slots", icon: Tags },
  { value: "coverage", label: "Coverage", icon: BarChart3 },
];

const inputClass =
  "w-full rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition ${
        checked ? "bg-sage" : "bg-ink/15"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-4.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
      {children}
    </p>
  );
}

export function DeliveryManager() {
  const [tab, setTab] = useState<Tab>("areas");
  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          <Truck size={13} /> Operations
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Delivery</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Manage serviceable areas, per-slot order caps, and NCR coverage.
          Slot caps feed the checkout “Available / Full” logic; area changes
          feed the pincode check.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === value
                ? "bg-ink text-ivory"
                : "bg-white/70 text-ink-soft hover:text-ink"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "areas" && <DeliveryAreasManager />}
      {tab === "slots" && <DeliverySlotsManager />}
      {tab === "coverage" && <AreasCoverageView />}
    </div>
  );
}

function DeliverySlotsManager() {
  const { slotList, orders, setSlotConfig } = useOperations();
  const usageBySlot = useMemo(
    () => slotUsageBySlot(isoDay(), orders),
    [orders],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            <th className="px-4 py-3">Slot</th>
            <th className="px-4 py-3">Enabled</th>
            <th className="px-4 py-3">Max orders</th>
            <th className="px-4 py-3">Today</th>
            <th className="px-4 py-3">State</th>
          </tr>
        </thead>
        <tbody>
          {slotList.map((slot) => {
            const usage = usageBySlot[slot.id] ?? 0;
            const state: "open" | "full" | "disabled" = slot.enabled
              ? usage >= slot.maxOrders
                ? "full"
                : "open"
              : "disabled";
            const chip =
              state === "open"
                ? "bg-sage/60 text-sage-ink"
                : state === "full"
                  ? "bg-blush text-ink"
                  : "bg-ink/10 text-ink-soft";
            return (
              <tr
                key={slot.id}
                data-slot-row={slot.id}
                className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{slot.label}</p>
                  {slot.isMorningExpress && (
                    <span className="mt-0.5 inline-block text-[11px] text-gold">
                      Morning express
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={slot.enabled}
                    onChange={(next) =>
                      setSlotConfig(slot.id, { enabled: next })
                    }
                    label={`Toggle ${slot.label}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={slot.maxOrders}
                    onChange={(event) =>
                      setSlotConfig(slot.id, {
                        maxOrders: Math.max(0, Number(event.target.value)),
                      })
                    }
                    aria-label={`Max orders for ${slot.label}`}
                    className="w-20 rounded-md border border-ink/10 bg-white/70 px-3 py-1.5 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {usage} / {slot.maxOrders}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${chip}`}
                  >
                    {state === "open"
                      ? "Open"
                      : state === "full"
                        ? "Full"
                        : "Disabled"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-ink/10 px-4 py-3 text-xs text-ink-soft">
        “Today” counts non-cancelled orders due today. Setting Max orders equal
        to the count marks the slot Full in the public checkout.
      </p>
    </div>
  );
}

function DeliveryAreasManager() {
  const { areas, upsertArea, deleteArea } = useOperations();
  const [draft, setDraft] = useState({
    name: "",
    pincodes: "",
    fee: 99,
    minutes: 90,
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const parsePincodes = (raw: string) =>
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

  const addArea = () => {
    if (!draft.name.trim()) return;
    upsertArea({
      id: `area-${Date.now().toString(36)}`,
      name: draft.name.trim(),
      pincode: parsePincodes(draft.pincodes),
      deliveryFee: draft.fee,
      estimatedMinutes: draft.minutes,
      active: true,
    });
    setDraft({ name: "", pincodes: "", fee: 99, minutes: 90 });
  };

  return (
    <div>
      <div className="mb-4 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Add area
        </p>
        <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Area name"
            aria-label="Area name"
            className={inputClass}
          />
          <input
            value={draft.pincodes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                pincodes: event.target.value,
              }))
            }
            placeholder="Pincodes, comma separated"
            aria-label="Pincodes"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            value={draft.fee}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                fee: Number(event.target.value),
              }))
            }
            aria-label="Delivery fee"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            value={draft.minutes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                minutes: Number(event.target.value),
              }))
            }
            aria-label="Minutes"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addArea}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {areas.map((area) => (
          <div
            key={area.id}
            data-area-row={area.id}
            className={`rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm ${
              area.active ? "" : "bg-ink/[0.02] opacity-70"
            }`}
          >
            <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr_1fr_auto_auto]">
              <div>
                <SectionLabel>Name</SectionLabel>
                <input
                  value={area.name}
                  onChange={(event) =>
                    upsertArea({ ...area, name: event.target.value })
                  }
                  aria-label={`Name for ${area.name}`}
                  className={inputClass}
                />
              </div>
              <div>
                <SectionLabel>Pincodes</SectionLabel>
                <input
                  value={area.pincode.join(", ")}
                  onChange={(event) =>
                    upsertArea({
                      ...area,
                      pincode: parsePincodes(event.target.value),
                    })
                  }
                  aria-label={`Pincodes for ${area.name}`}
                  className={inputClass}
                />
              </div>
              <div>
                <SectionLabel>Fee (INR)</SectionLabel>
                <input
                  type="number"
                  min={0}
                  value={area.deliveryFee}
                  onChange={(event) =>
                    upsertArea({
                      ...area,
                      deliveryFee: Number(event.target.value),
                    })
                  }
                  aria-label={`Fee for ${area.name}`}
                  className={inputClass}
                />
              </div>
              <div>
                <SectionLabel>Minutes</SectionLabel>
                <input
                  type="number"
                  min={0}
                  value={area.estimatedMinutes}
                  onChange={(event) =>
                    upsertArea({
                      ...area,
                      estimatedMinutes: Number(event.target.value),
                    })
                  }
                  aria-label={`Minutes for ${area.name}`}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end pb-2">
                <Toggle
                  checked={area.active}
                  onChange={(next) => upsertArea({ ...area, active: next })}
                  label={`Toggle active ${area.name}`}
                />
              </div>
              <div className="flex items-end pb-1">
                {confirmDeleteId === area.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteArea(area.id);
                      setConfirmDeleteId(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-blush px-3 py-2 text-xs font-bold text-ink transition hover:opacity-80"
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(area.id)}
                    aria-label={`Delete ${area.name}`}
                    title={`Delete ${area.name}`}
                    className="rounded-md border border-ink/10 p-2 text-ink-soft transition hover:border-blush hover:text-ink"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreasCoverageView() {
  const { areas, slotList, orders } = useOperations();
  const today = isoDay();
  const usageBySlot = useMemo(
    () => slotUsageBySlot(today, orders),
    [orders, today],
  );

  const activeAreas = areas.filter((area) => area.active);
  const pincodes = new Set(
    areas.flatMap((area) => (area.active ? area.pincode : [])),
  );
  const fullSlots = slotList.filter(
    (slot) =>
      slot.enabled && (usageBySlot[slot.id] ?? 0) >= slot.maxOrders,
  ).length;
  const disabledSlots = slotList.filter((slot) => !slot.enabled).length;
  const pct = areas.length
    ? Math.round((activeAreas.length / areas.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total areas", value: `${areas.length}`, note: "on the book" },
          { label: "Active", value: `${activeAreas.length}`, note: "serviceable" },
          { label: "Pincodes", value: `${pincodes.size}`, note: "in NCR" },
          {
            label: "Slots today",
            value: `${fullSlots} full · ${disabledSlots} off`,
            note: "checkout reflects this",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl text-ink">{stat.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="font-display text-lg text-ink">NCR coverage</p>
          <span className="text-sm font-semibold text-ink-soft">{pct}% active</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-sage transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {areas.map((area) => (
            <div
              key={area.id}
              data-area-card={area.id}
              className={`rounded-lg border px-4 py-3 ${
                area.active
                  ? "border-ink/10 bg-white/60"
                  : "border-ink/5 bg-ink/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink">{area.name}</p>
                <span
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold ${
                    area.active
                      ? "bg-sage/60 text-sage-ink"
                      : "bg-ink/10 text-ink-soft"
                  }`}
                >
                  {area.active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {area.pincode.map((pincode) => (
                  <span
                    key={pincode}
                    className="rounded-sm bg-ivory-deep px-1.5 py-0.5 text-[11px] font-mono text-ink-soft"
                  >
                    {pincode}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {formatINR(area.deliveryFee)} fee · ~{area.estimatedMinutes} min
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}