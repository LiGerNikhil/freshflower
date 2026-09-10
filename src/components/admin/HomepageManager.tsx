"use client";

import { useMemo, useState } from "react";
import { Check, Home, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { useCatalog } from "@/components/providers/CatalogContext";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { reviews } from "@/lib/data/reviews";
import type { OfferBanner } from "@/lib/types";

/**
 * /admin/homepage — live controls for the public homepage. Every save bumps
 * the HomepageConfig in the Phase 16 store, so a visitor reload sees the new
 * hero, featured flowers, offers and testimonials immediately.
 */
export function HomepageManager() {
  const { homepage, setHomepage } = useSiteContent();
  const { products } = useCatalog();
  const [saved, setSaved] = useState(false);

  const patchHero = (patch: Partial<typeof homepage.hero>) =>
    setHomepage({ ...homepage, hero: { ...homepage.hero, ...patch } });

  const toggleFlower = (id: string) => {
    const selected = homepage.featuredFlowerIds.includes(id)
      ? homepage.featuredFlowerIds.filter((value) => value !== id)
      : [...homepage.featuredFlowerIds, id];
    setHomepage({ ...homepage, featuredFlowerIds: selected });
  };

  const toggleTestimonial = (id: string) => {
    const selected = homepage.testimonialReviewIds.includes(id)
      ? homepage.testimonialReviewIds.filter((value) => value !== id)
      : [...homepage.testimonialReviewIds, id];
    setHomepage({ ...homepage, testimonialReviewIds: selected });
  };

  const updateOffer = (index: number, patch: Partial<OfferBanner>) => {
    const offers = homepage.offers.map((offer, i) =>
      i === index ? { ...offer, ...patch } : offer,
    );
    setHomepage({ ...homepage, offers });
  };

  const addOffer = () => {
    const offer: OfferBanner = {
      id: `off-${Date.now().toString(36)}`,
      badge: "New offer",
      title: "Give a headline to this offer",
      copy: "One line of supporting copy.",
      ctaLabel: "Shop now",
      ctaHref: "/flowers",
    };
    setHomepage({ ...homepage, offers: [...homepage.offers, offer] });
  };

  const removeOffer = (index: number) => {
    const offers = homepage.offers.filter((_, i) => i !== index);
    setHomepage({ ...homepage, offers });
  };

  const approvedReviews = useMemo(
    () =>
      reviews.filter(
        (review) =>
          review.status === "approved" || review.status === "featured",
      ),
    [],
  );

  const update = (patch: Partial<typeof homepage>) =>
    setHomepage({ ...homepage, ...patch });

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Home size={13} /> Homepage Management
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Homepage controls
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Changes save to the Phase 16 store and show up on the live
            homepage on the next load.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Check size={15} /> {saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hero */}
        <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
            <Sparkles size={16} className="text-gold" /> Hero banner
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Eyebrow
              </label>
              <input
                type="text"
                value={homepage.hero.eyebrow}
                onChange={(event) => patchHero({ eyebrow: event.target.value })}
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Headline lines (one per input)
              </label>
              <div className="space-y-2">
                {homepage.hero.titleLines.map((line, index) => (
                  <input
                    key={index}
                    type="text"
                    value={line}
                    onChange={(event) => {
                      const titleLines = [...homepage.hero.titleLines];
                      titleLines[index] = event.target.value;
                      patchHero({ titleLines });
                    }}
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Gold italic line #{" "}
                <select
                  value={homepage.hero.accentLineIndex}
                  onChange={(event) =>
                    patchHero({
                      accentLineIndex: Number(event.target.value),
                    })
                  }
                  className="rounded-md border border-ink/10 bg-white px-2 py-1 text-xs font-semibold text-ink"
                >
                  {homepage.hero.titleLines.map((_, index) => (
                    <option key={index} value={index}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Subtitle
              </label>
              <textarea
                value={homepage.hero.subtitle}
                onChange={(event) => patchHero({ subtitle: event.target.value })}
                rows={2}
                className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Primary CTA label
                </label>
                <input
                  type="text"
                  value={homepage.hero.ctaPrimaryLabel}
                  onChange={(event) =>
                    patchHero({ ctaPrimaryLabel: event.target.value })
                  }
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Primary CTA link
                </label>
                <input
                  type="text"
                  value={homepage.hero.ctaPrimaryHref}
                  onChange={(event) =>
                    patchHero({ ctaPrimaryHref: event.target.value })
                  }
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Secondary CTA label
                </label>
                <input
                  type="text"
                  value={homepage.hero.ctaSecondaryLabel}
                  onChange={(event) =>
                    patchHero({ ctaSecondaryLabel: event.target.value })
                  }
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Secondary CTA link
                </label>
                <input
                  type="text"
                  value={homepage.hero.ctaSecondaryHref}
                  onChange={(event) =>
                    patchHero({ ctaSecondaryHref: event.target.value })
                  }
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured flowers */}
        <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="mb-1 font-display text-xl">Featured flowers</h2>
          <p className="mb-4 text-xs text-ink-soft">
            Pick up to 4 — shown in the &quot;Best sellers&quot; grid on the
            homepage.
          </p>
          <div className="grid max-h-96 gap-2 overflow-y-auto pr-1">
            {products.map((flower) => {
              const selected = homepage.featuredFlowerIds.includes(flower.id);
              return (
                <button
                  key={flower.id}
                  type="button"
                  onClick={() => toggleFlower(flower.id)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    selected
                      ? "border-gold bg-gold/10"
                      : "border-ink/10 bg-white hover:border-gold/50"
                  }`}
                >
                  <AdminThumb token={flower.images?.[0]} name={flower.name} className="h-9 w-9 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {flower.name}
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      ₹{flower.price} · {flower.unit}
                    </p>
                  </div>
                  {selected && <Check size={16} className="shrink-0 text-gold" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Offers */}
        <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Offers / banners</h2>
            <button
              type="button"
              onClick={addOffer}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-ink/20 px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
            >
              <Plus size={12} /> Add offer
            </button>
          </div>
          <div className="space-y-4">
            {homepage.offers.map((offer, index) => (
              <div
                key={offer.id}
                className="space-y-3 rounded-lg border border-ink/10 bg-ivory-deep/40 p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={offer.badge}
                    onChange={(event) =>
                      updateOffer(index, { badge: event.target.value })
                    }
                    placeholder="Badge"
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink shadow-sm focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeOffer(index)}
                    aria-label={`Remove offer ${index + 1}`}
                    className="shrink-0 rounded-md p-2 text-ink-soft transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={offer.title}
                  onChange={(event) =>
                    updateOffer(index, { title: event.target.value })
                  }
                  placeholder="Headline"
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
                <input
                  type="text"
                  value={offer.copy ?? ""}
                  onChange={(event) =>
                    updateOffer(index, { copy: event.target.value })
                  }
                  placeholder="Supporting copy (optional)"
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={offer.ctaLabel}
                    onChange={(event) =>
                      updateOffer(index, { ctaLabel: event.target.value })
                    }
                    placeholder="CTA label"
                    className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={offer.ctaHref}
                    onChange={(event) =>
                      updateOffer(index, { ctaHref: event.target.value })
                    }
                    placeholder="/flowers"
                    className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                </div>
              </div>
            ))}
            {homepage.offers.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-soft">
                No offers. The offers strip is hidden until you add one.
              </p>
            )}
          </div>
        </section>

        {/* Testimonials + toggle */}
        <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="mb-1 font-display text-xl">Testimonials</h2>
          <p className="mb-4 text-xs text-ink-soft">
            Pick up to 3 approved reviews for the &quot;What our customers
            say&quot; grid.
          </p>
          <div className="grid max-h-96 gap-2 overflow-y-auto pr-1">
            {approvedReviews.map((review) => {
              const selected = homepage.testimonialReviewIds.includes(review.id);
              return (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => toggleTestimonial(review.id)}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    selected
                      ? "border-gold bg-gold/10"
                      : "border-ink/10 bg-white hover:border-gold/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-xs font-bold text-ink">
                      <Star size={11} className="text-gold" /> {review.rating}.0
                      <span className="ml-1 font-semibold text-ink-soft">
                        · {review.customerName}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                      {review.comment}
                    </p>
                  </div>
                  {selected && <Check size={16} className="mt-1 shrink-0 text-gold" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                &quot;Today&apos;s fresh flowers&quot; section
              </p>
              <p className="text-xs text-ink-soft">
                Show or hide the fresh-harvest grid on the homepage.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={homepage.showsFreshToday}
              aria-label="Toggle fresh today section"
              onClick={() =>
                update({ showsFreshToday: !homepage.showsFreshToday })
              }
              className={`flex h-7 w-12 items-center rounded-full px-1 transition ${
                homepage.showsFreshToday ? "bg-sage" : "bg-ink/20"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  homepage.showsFreshToday ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}