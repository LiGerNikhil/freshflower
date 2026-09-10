"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Flag,
  Star,
  Trash2,
} from "lucide-react";
import { usePhase15 } from "@/components/providers/Phase15Provider";
import type { Review } from "@/lib/types";

const STATUS_LABELS: Record<
  string,
  { tone: string; label: string }
> = {
  pending: { tone: "bg-gold/15 text-gold", label: "Pending" },
  approved: { tone: "bg-sage text-sage-ink", label: "Approved" },
  rejected: { tone: "bg-ink/10 text-ink-soft", label: "Rejected" },
  featured: { tone: "bg-blush text-ink", label: "Featured" },
};

export function ReviewsManager() {
  const { reviews, updateReviewStatus } = usePhase15();
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter(
        (r) => r.status === "approved" || r.status === "featured",
      ).length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    }),
    [reviews],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Flag size={13} /> Reviews
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Moderation queue
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {counts.pending} pending · {counts.approved} approved ·{" "}
            {counts.rejected} rejected. Only approved reviews appear
            on the public site.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "all", label: `All (${counts.all})` },
          { key: "pending", label: `Pending (${counts.pending})` },
          { key: "approved", label: `Approved (${counts.approved})` },
          { key: "rejected", label: `Rejected (${counts.rejected})` },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setFilter(opt.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              filter === opt.key
                ? "bg-ink text-ivory"
                : "bg-white/70 text-ink-soft hover:bg-ivory-deep/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr
                  key={review.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30"
                >
                  <td className="px-4 py-3 font-semibold">
                    {review.customerName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < review.rating ? "currentColor" : "none"}
                          className="text-gold"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {review.productId}
                  </td>
                  <td className="px-4 py-3 text-sm leading-5 text-ink-soft line-clamp-2 max-w-xs">
                    {review.comment}
                  </td>
                  <td className="px-4 py-3 text-ink-soft text-xs">
                    {new Date(review.createdAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${
                        STATUS_LABELS[review.status ?? "pending"]?.tone ??
                        "bg-ink/10 text-ink-soft"
                      }`}
                    >
                      {STATUS_LABELS[review.status ?? "pending"]?.label ??
                        review.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {review.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateReviewStatus(review.id, "approved")
                          }
                          aria-label={`Approve ${review.id}`}
                          className="rounded-md bg-sage px-2 py-1 text-xs font-semibold text-sage-ink transition hover:opacity-80"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      {review.status !== "featured" &&
                        review.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateReviewStatus(review.id, "featured")
                            }
                            aria-label={`Feature ${review.id}`}
                            className="rounded-md bg-blush px-2 py-1 text-xs font-semibold text-ink transition hover:opacity-80"
                          >
                            <Star size={13} />
                          </button>
                        )}
                      {review.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateReviewStatus(review.id, "rejected")
                          }
                          aria-label={`Reject ${review.id}`}
                          className="rounded-md bg-ink/10 px-2 py-1 text-xs font-semibold text-ink-soft transition hover:opacity-80"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          updateReviewStatus(review.id, "pending")
                        }
                        aria-label={`Reset ${review.id}`}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-ink-soft transition hover:bg-ink/5"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateReviewStatus(review.id, "pending")
                        }
                        aria-label={`Delete ${review.id}`}
                        className="rounded-md p-2 text-ink-soft transition hover:bg-blush-deep hover:text-ink"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-display text-lg text-ink-soft">
              No reviews match this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}