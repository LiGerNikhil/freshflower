// Route registry used by /admin/seo. Each entry describes a public route's
// current machine-readable metadata; the SEO Manager stores per-route
// overrides (title/description/keywords) under the same `path` key.
export interface SeoRouteEntry {
  path: string;
  label: string;
  group: string;
  title: string;
  description: string;
  keywords?: string;
}

export const ROUTE_GROUPS = [
  "Home & catalog",
  "SEO landing pages",
  "Content",
  "Conversion pages",
  "Legal & support",
] as const;

export const ROUTE_REGISTRY: SeoRouteEntry[] = [
  {
    path: "/",
    label: "Home",
    group: "Home & catalog",
    title: "FreshFlower.zone — Same-morning flower delivery in Delhi NCR",
    description:
      "Fresh flowers delivered across Delhi NCR while the city wakes up. Roses, mogra, gerberas & bouquets — puja-ready, gifting-ready, delivered by Porter before 9 AM.",
    keywords: "flower delivery delhi, same day flower delivery, morning delivery, fresh roses, mogra garland",
  },
  {
    path: "/flowers",
    label: "All flowers",
    group: "Home & catalog",
    title: "All flowers | FreshFlower.zone",
    description:
      "Shop fresh-cut flowers — roses, mogra, gerberas, sunflowers, orchids — ready for puja and gifting. Same-morning delivery across Delhi NCR.",
    keywords: "buy flowers online, fresh flowers delhi, flower delivery near me",
  },
  {
    path: "/bouquets",
    label: "Bouquets",
    group: "Home & catalog",
    title: "Bouquets | FreshFlower.zone",
    description:
      "Hand-tied bouquets for birthdays, anniversaries and apologies. Delivered fresh in the morning across Delhi NCR.",
    keywords: "bouquet delivery delhi, hand tied bouquet, flower bouquet online",
  },
  {
    path: "/categories",
    label: "Flower varieties",
    group: "Home & catalog",
    title: "Flower varieties | FreshFlower.zone",
    description:
      "Browse flowers by variety — roses, lilies, orchids, mogra and more. Each listed with stem counts, unit pricing and morning delivery options.",
  },
  {
    path: "/occasions",
    label: "Occasions & gifting",
    group: "Home & catalog",
    title: "Occasions & gifting | FreshFlower.zone",
    description:
      "Flowers picked for the occasion — birthdays, anniversaries, housewarmings, puja and sympathy. Same-morning delivery across Delhi NCR.",
  },
  {
    path: "/flower-delivery-delhi",
    label: "Delhi flower delivery",
    group: "SEO landing pages",
    title: "Flower Delivery in Delhi | Same-Day & Morning Flowers | FreshFlower.zone",
    description:
      "Fresh flower delivery in Delhi — South Extension, Connaught Place, Vasant Kunj & Dwarka. Morning slots from ₹99, same-day options, puja & gifting ready.",
    keywords: "flower delivery delhi, same day flower delivery delhi, florist south extension",
  },
  {
    path: "/flower-delivery-noida",
    label: "Noida flower delivery",
    group: "SEO landing pages",
    title: "Flower Delivery in Noida | Morning & Same-Day | FreshFlower.zone",
    description:
      "Fresh flower delivery in Noida — Sector 18, Sec 62, Indirapuram & Greater Noida. Morning windows, Porter handoff and puja-ready stems.",
  },
  {
    path: "/flower-delivery-gurgaon",
    label: "Gurgaon flower delivery",
    group: "SEO landing pages",
    title: "Flower Delivery in Gurgaon | Morning & Same-Day | FreshFlower.zone",
    description:
      "Fresh flower delivery in Gurgaon — DLF Phase 1-5, Cyber City & Golf Course Road. Early-morning slots and same-day bouquets.",
  },
  {
    path: "/flower-delivery-anniversary",
    label: "Anniversary flower delivery",
    group: "SEO landing pages",
    title: "Anniversary Flowers | First-Morning Delivery | FreshFlower.zone",
    description:
      "Anniversary flowers delivered before the day begins. Roses, lilies and hand-tied bouquets across Delhi NCR — gift-ready by 6–9 AM.",
  },
  {
    path: "/flower-delivery-birthday",
    label: "Birthday flower delivery",
    group: "SEO landing pages",
    title: "Birthday Flowers | Morning Delivery | FreshFlower.zone",
    description:
      "Birthday flower delivery across Delhi NCR — bright, fresh and on the doorstep before the day starts. Same-day slots available.",
  },
  {
    path: "/flower-delivery-puja",
    label: "Puja flower delivery",
    group: "SEO landing pages",
    title: "Puja Flowers | Mogra, Rajnigandha & Marigold | FreshFlower.zone",
    description:
      "Puja-ready flowers delivered at dawn — mogra strings, rajnigandha and marigold. Reliable morning slots across Delhi NCR.",
  },
  {
    path: "/blog",
    label: "Blog",
    group: "Content",
    title: "Flower blog | FreshFlower.zone",
    description:
      "Guides on flower care, vase life, puja traditions and gifting etiquette from the FreshFlower.zone team.",
    keywords: "flower care guide, flower vase life, flower care tips",
  },
  {
    path: "/blog/[slug]",
    label: "Blog post (dynamic)",
    group: "Content",
    title: "«Post title» | FreshFlower.zone",
    description:
      "Care guides, puja traditions and gifting notes from the FreshFlower.zone team. Overrides here apply to every blog post.",
  },
  {
    path: "/reviews",
    label: "Customer reviews",
    group: "Content",
    title: "Customer reviews | FreshFlower.zone",
    description:
      "Read verified customer reviews about FreshFlower.zone flowers and delivery.",
  },
  {
    path: "/wholesale",
    label: "Wholesale",
    group: "Conversion pages",
    title: "Wholesale flowers | FreshFlower.zone",
    description:
      "Bulk flower supply for hotels, offices, events and vendors — transparent pricing, dawn sourcing and one dedicated point of contact.",
    keywords: "wholesale flowers delhi, bulk flowers supply, florist wholesale",
  },
  {
    path: "/wedding-events",
    label: "Wedding & events",
    group: "Conversion pages",
    title: "Wedding & events flowers | FreshFlower.zone",
    description:
      "Wedding and event floral design across Delhi NCR — mandaps, table centres, backdrops and bulk stems with a single coordinator.",
  },
  {
    path: "/contact",
    label: "Contact",
    group: "Conversion pages",
    title: "Contact us | FreshFlower.zone",
    description:
      "Call or WhatsApp FreshFlower.zone for same-morning flower delivery across Delhi NCR. Email, phone and delivery-area details here.",
  },
  {
    path: "/delivery",
    label: "Delivery information",
    group: "Legal & support",
    title: "Delivery information | FreshFlower.zone",
    description:
      "Morning and same-day flower delivery slots, delivery areas, Porter charges and fees across Delhi NCR.",
  },
  {
    path: "/faq",
    label: "FAQ",
    group: "Legal & support",
    title: "FAQ | FreshFlower.zone",
    description:
      "Common questions about ordering, delivery windows, Porter charges, flower care and returns at FreshFlower.zone.",
  },
  {
    path: "/track-order",
    label: "Track order",
    group: "Legal & support",
    title: "Track your order | FreshFlower.zone",
    description:
      "Enter your order number to see live delivery status — confirmed, preparing, out for delivery or delivered.",
  },
  {
    path: "/cart",
    label: "Cart",
    group: "Legal & support",
    title: "Your cart | FreshFlower.zone",
    description: "Review the flowers and bouquets in your FreshFlower.zone cart before checkout.",
  },
  {
    path: "/checkout",
    label: "Checkout",
    group: "Legal & support",
    title: "Checkout | FreshFlower.zone",
    description: "Secure checkout for FreshFlower.zone — choose a delivery slot and pay on delivery.",
  },
  {
    path: "/account",
    label: "My account",
    group: "Legal & support",
    title: "My account | FreshFlower.zone",
    description: "Your orders, saved addresses, reviews and preferences on FreshFlower.zone.",
  },
  {
    path: "/terms",
    label: "Terms of service",
    group: "Legal & support",
    title: "Terms of service | FreshFlower.zone",
    description: "The terms that apply when you order from FreshFlower.zone.",
  },
];