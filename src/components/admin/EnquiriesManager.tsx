"use client";

import { useMemo, useState } from "react";
import {
  Inbox,
  MessageSquare,
  Tag,
  User,
} from "lucide-react";
import { usePhase15 } from "@/components/providers/Phase15Provider";
import type {
  ContactEnquiry,
  EnquiryStatus,
  WholesaleEnquiry,
  WeddingEnquiry,
} from "@/lib/types";

const KIND_OPTIONS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "contact", label: "Contact" },
  { key: "wholesale", label: "Wholesale" },
  { key: "wedding", label: "Wedding" },
];

const STATUS_OPTIONS: EnquiryStatus[] = [
  "new",
  "contacted",
  "inDiscussion",
  "converted",
  "closed",
];

const STATUS_LABELS: Record<
  EnquiryStatus,
  { tone: string; label: string }
> = {
  new: { tone: "bg-gold/15 text-gold", label: "New" },
  contacted: { tone: "bg-blush text-ink", label: "Contacted" },
  inDiscussion: {
    tone: "bg-lavender/60 text-lavender-ink",
    label: "In Discussion",
  },
  converted: { tone: "bg-sage text-sage-ink", label: "Converted" },
  closed: { tone: "bg-ink/10 text-ink-soft", label: "Closed" },
};

function kindLabel(kind: KindFilter): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

type KindFilter = "all" | "wholesale" | "wedding" | "contact";

export function EnquiriesManager() {
  const {
    wholesaleEnquiries,
    weddingEnquiries,
    contactEnquiries,
    updateEnquiryStatus,
    deleteEnquiry,
  } = usePhase15();
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<EnquiryStatus | "all">("all");

  const items = useMemo(() => {
    let result: Array<{
      kind: KindFilter;
      enquiry: WholesaleEnquiry | WeddingEnquiry | ContactEnquiry;
    }> = [];
    const push = (
      kind: KindFilter,
      e: WholesaleEnquiry | WeddingEnquiry | ContactEnquiry,
    ) => {
      if (kindFilter !== "all" && kind !== kindFilter) return;
      if (
        statusFilter !== "all" &&
        e.status !== statusFilter
      )
        return;
      result.push({ kind, enquiry: e });
    };
    wholesaleEnquiries.forEach((e) => push("wholesale", e));
    weddingEnquiries.forEach((e) => push("wedding", e));
    contactEnquiries.forEach((e) => push("contact", e));
    // newest first
    result.sort(
      (a, b) =>
        new Date(b.enquiry.createdAt).getTime() -
        new Date(a.enquiry.createdAt).getTime(),
    );
    return result;
  }, [
    wholesaleEnquiries,
    weddingEnquiries,
    contactEnquiries,
    kindFilter,
    statusFilter,
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          <Inbox size={13} /> Enquiries
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          Unified inbox
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Contact, wholesale, and wedding enquiries ·{" "}
          {items.length} total.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {[
            { key: "all", label: "All" },
            { key: "contact", label: "Contact" },
            { key: "wholesale", label: "Wholesale" },
            { key: "wedding", label: "Wedding" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setKindFilter(opt.key as KindFilter)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                kindFilter === opt.key
                  ? "bg-ink text-ivory"
                  : "bg-white/70 text-ink-soft hover:bg-ivory-deep/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as EnquiryStatus | "all",
            )
          }
          aria-label="Filter by status"
          className="rounded-md border border-ink/10 bg-white/70 px-3 py-1.5 text-xs text-ink outline-none focus:border-gold"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ kind, enquiry }) => (
          <article
            key={enquiry.id}
            className="rounded-xl border border-ink/10 bg-white/80 p-5"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  STATUS_LABELS[enquiry.status]?.tone ??
                  "bg-ink/10 text-ink-soft"
                }`}
              >
                {STATUS_LABELS[enquiry.status]?.label ??
                  enquiry.status}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-lavender-ink">
                <Tag size={11} /> {kindLabel(kind)}
              </span>
            </div>
            <p className="mt-3 font-semibold">
              {kind === "wholesale"
                ? (enquiry as WholesaleEnquiry).businessName
                : kind === "wedding"
                  ? (enquiry as WeddingEnquiry).clientName
                  : (enquiry as ContactEnquiry).name}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {(enquiry as { email: string }).email}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-soft line-clamp-3">
              {(enquiry as { message: string }).message}
            </p>
            <p className="mt-3 text-[10px] text-ink-soft">
              {new Date(enquiry.createdAt).toLocaleDateString(
                "en-IN",
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (kind === "all") return;
                    updateEnquiryStatus(
                      kind as "wholesale" | "wedding" | "contact",
                      enquiry.id,
                      s,
                    );
                  }}
                  disabled={enquiry.status === s}
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                    enquiry.status === s
                      ? "bg-ink text-ivory"
                      : "bg-white/70 text-ink-soft hover:bg-ivory-deep/30"
                  }`}
                >
                  {STATUS_LABELS[s].label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (kind === "all") return;
                  deleteEnquiry(
                    kind as "wholesale" | "wedding" | "contact",
                    enquiry.id,
                  );
                }}
                aria-label={`Delete ${enquiry.id}`}
                className="ml-auto rounded px-2 py-0.5 text-[10px] font-semibold text-ink-soft transition hover:bg-blush-deep"
              >
                <MessageSquare size={11} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-14 text-center">
          <p className="font-display text-lg text-ink-soft">
            No enquiries match.
          </p>
        </div>
      )}
    </div>
  );
}