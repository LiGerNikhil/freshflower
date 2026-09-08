"use client";

import { useMemo, useState } from "react";
import { Quote, Star, Filter, X } from "lucide-react";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Flower, Review } from "@/lib/types";

export function ReviewsClient({
  reviews,
  flowers,
}: {
  reviews: Review[];
  flowers: Flower[];
}) {
  const [rating, setRating] = useState("all");
  const [product, setProduct] = useState("all");

  const productMap = useMemo(
    () => new Map(flowers.map((flower) => [flower.id, flower.name])),
    [flowers],
  );

  const filtered = reviews.filter(
    (review) =>
      (rating === "all" || String(review.rating) === rating) &&
      (product === "all" || review.productId === product),
  );

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const fiveStarCount = useMemo(
    () => reviews.filter((r) => r.rating === 5).length,
    [reviews],
  );

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="bg-lavender px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lavender-ink">
            Kind words
          </p>
          <h1 className="text-5xl md:text-7xl">Flowers, according to you.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft">
            Real notes from people who invited FreshFlower.zone into
            anniversaries, early mornings, new homes, and ordinary Tuesdays.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-8">
            <div className="rounded-lg bg-white/60 px-6 py-4">
              <p className="text-3xl font-display">{avgRating}</p>
              <div className="mt-1 flex items-center gap-1 text-gold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={s <= Math.round(Number(avgRating)) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Average rating
              </p>
            </div>
            <div className="rounded-lg bg-white/60 px-6 py-4">
              <p className="text-3xl font-display">{reviews.length}</p>
              <p className="mt-1 text-xs text-ink-soft">Total reviews</p>
            </div>
            <div className="rounded-lg bg-white/60 px-6 py-4">
              <p className="text-3xl font-display">{fiveStarCount}</p>
              <p className="mt-1 text-xs text-ink-soft">5-star reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + reviews */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-ink-soft" />
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="rounded-md border border-ink/10 bg-white/70 px-4 py-3 text-sm"
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
          </select>
          <select
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            className="rounded-md border border-ink/10 bg-white/70 px-4 py-3 text-sm"
          >
            <option value="all">All products</option>
            {flowers.map((flower) => (
              <option key={flower.id} value={flower.id}>
                {flower.name}
              </option>
            ))}
          </select>
          {(rating !== "all" || product !== "all") && (
            <button
              type="button"
              onClick={() => {
                setRating("all");
                setProduct("all");
              }}
              className="flex items-center gap-1 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-gold"
            >
              <X size={12} /> Clear filters
            </button>
          )}
          <span className="text-xs text-ink-soft">
            Showing {filtered.length} of {reviews.length} reviews
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg bg-white/70 p-12 text-center">
            <p className="font-display text-2xl text-ink-soft">
              No reviews match your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setRating("all");
                setProduct("all");
              }}
              className="mt-4 text-sm font-semibold underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((review) => (
              <article
                key={review.id}
                className="rounded-lg bg-white/70 p-7"
              >
                <Quote className="mb-6 text-gold" size={22} />
                <div className="flex items-center gap-1 text-gold">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-5 font-display text-2xl leading-snug">
                  &quot;{review.comment}&quot;
                </p>

                {/* Review photo */}
                {review.photoUrl && (
                  <div
                    className="mt-5 h-40 overflow-hidden rounded-lg"
                    style={{
                      background: GRADIENT_TOKENS[review.photoUrl]
                        ? GRADIENT_TOKENS[review.photoUrl]
                        : `url(${review.photoUrl}) center/cover`,
                    }}
                    aria-label="Customer photo"
                  />
                )}

                <div className="mt-7 flex justify-between border-t border-ink/10 pt-4 text-xs">
                  <div>
                    <span className="font-semibold">{review.customerName}</span>
                    {review.verifiedPurchase && (
                      <span className="ml-2 inline-flex items-center rounded-sm bg-sage/60 px-2 py-0.5 text-[10px] font-semibold text-sage-ink">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-ink-soft">
                    {productMap.get(review.productId) ??
                      "FreshFlower arrangement"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
