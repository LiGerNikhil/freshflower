import type { HomepageConfig } from "@/lib/types";

// PHASE 16 ADMIN CONTROLS — the homepage marketeer can override these from
// /admin/homepage. Values persist to localStorage under "ff-phase16-v1" and
// the live homepage (HomepageClient) re-renders from this single source.
export const DEFAULT_HOMEPAGE: HomepageConfig = {
  hero: {
    eyebrow: "Same morning flower delivery · Delhi NCR",
    titleLines: [
      "Fresh Flowers.",
      "Fresh Mornings.",
      "Delivered to Your Door.",
    ],
    accentLineIndex: 1,
    subtitle:
      "Thoughtfully gathered blooms, delivered across Delhi NCR while the city is still waking up.",
    ctaPrimaryLabel: "Shop Flowers",
    ctaPrimaryHref: "#shop",
    ctaSecondaryLabel: "Collections",
    ctaSecondaryHref: "/collections",
  },
  announcementText: "",
  featuredFlowerIds: [
    "fl-red-rose-bunch",
    "fl-mogra-string",
    "fl-gerbera-mixed",
    "fl-sunflower-bunch",
  ],
  showsFreshToday: true,
  offers: [
    {
      id: "off-wholesale",
      badge: "For hotels, offices & celebrations",
      title: "A lot of flowers? Let's make it effortless.",
      copy: "Event-scale orders, one dedicated point of contact, transparent bulk pricing.",
      ctaLabel: "Request a quote",
      ctaHref: "/wholesale",
    },
  ],
  testimonialReviewIds: ["rev-1", "rev-6", "rev-8"],
};

export function mergeHomepageConfig(
  config?: Partial<HomepageConfig> | null,
): HomepageConfig {
  return {
    ...DEFAULT_HOMEPAGE,
    ...config,
    hero: { ...DEFAULT_HOMEPAGE.hero, ...config?.hero },
    featuredFlowerIds:
      config?.featuredFlowerIds ?? DEFAULT_HOMEPAGE.featuredFlowerIds,
    showsFreshToday: config?.showsFreshToday ?? DEFAULT_HOMEPAGE.showsFreshToday,
    offers: config?.offers ?? DEFAULT_HOMEPAGE.offers,
    testimonialReviewIds:
      config?.testimonialReviewIds ?? DEFAULT_HOMEPAGE.testimonialReviewIds,
  };
}