import { citySeoPages, occasionSeoPages } from "@/lib/data/seoPages";
import type { SearchDoc } from "@/lib/search/types";

const CORE_PAGES: SearchDoc[] = [
  {
    id: "page-flowers",
    entity: "page",
    title: "All flowers",
    href: "/flowers",
    subtitle: "Browse the full FreshFlower.zone flower catalogue",
    description:
      "Fresh roses, mogra, lilies, gerberas, marigold, exotic stems and loose flowers delivered across Delhi NCR.",
    keywords: ["shop", "catalogue", "catalog", "buy flowers", "fresh flowers"],
  },
  {
    id: "page-bouquets",
    entity: "page",
    title: "Bouquets",
    href: "/bouquets",
    subtitle: "Hand-tied bouquets and custom arrangements",
    description:
      "Rose bouquets, hand-tied arrangements and custom floral gifts delivered across Delhi NCR.",
    keywords: ["rose bouquet", "flower bouquet", "bunch", "gift"],
  },
  {
    id: "page-collections",
    entity: "page",
    title: "Flower collections",
    href: "/collections",
    subtitle: "Seasonal and festival edits",
    description:
      "Curated festival, pooja and seasonal flower collections from FreshFlower.zone.",
    keywords: ["festival flowers", "pooja flowers", "seasonal collection"],
  },
  {
    id: "page-categories",
    entity: "page",
    title: "Flower types",
    href: "/categories",
    subtitle: "Browse flowers by variety",
    description:
      "Roses, gerbera, mogra, lilies, orchids, marigold and more flower categories.",
    keywords: ["flower categories", "flower types", "varieties"],
  },
  {
    id: "page-occasions",
    entity: "page",
    title: "Flowers by occasion",
    href: "/occasions",
    subtitle: "Birthday, anniversary, wedding and more",
    description:
      "Find flowers for birthdays, anniversaries, weddings, pooja, corporate gifting and everyday moments.",
    keywords: ["occasion flowers", "gifting", "celebration"],
  },
  {
    id: "page-delivery",
    entity: "page",
    title: "Flower delivery information",
    href: "/delivery",
    subtitle: "Areas, morning slots and Porter charges",
    description:
      "Delivery areas, morning delivery windows, same-day cutoffs and Porter charges across Delhi NCR.",
    keywords: ["delivery", "same day", "morning delivery", "pincode", "porter"],
  },
  {
    id: "page-blog",
    entity: "page",
    title: "Flower care & gifting journal",
    href: "/blog",
    subtitle: "Guides, ideas and flower care",
    description:
      "Flower care guides, gifting ideas, rose varieties and seasonal inspiration.",
    keywords: ["blog", "guide", "flower care", "gifting ideas"],
  },
  {
    id: "page-reviews",
    entity: "page",
    title: "Customer reviews",
    href: "/reviews",
    subtitle: "What customers say",
    description:
      "Verified customer reviews for FreshFlower.zone flower delivery and bouquets.",
    keywords: ["reviews", "ratings", "testimonials"],
  },
  {
    id: "page-faq",
    entity: "page",
    title: "Frequently asked questions",
    href: "/faq",
    subtitle: "Delivery, freshness, payments and orders",
    description:
      "Answers about flower delivery, freshness, payments, cancellations and custom orders.",
    keywords: ["faq", "help", "questions", "support"],
  },
  {
    id: "page-wholesale",
    entity: "page",
    title: "Wholesale flowers",
    href: "/wholesale",
    subtitle: "Bulk supply for hotels, cafés and florists",
    description:
      "Regular wholesale flower supply for hotels, restaurants, florists, event decorators and corporates.",
    keywords: ["wholesale", "bulk", "hotel flowers", "corporate supply"],
  },
  {
    id: "page-wedding",
    entity: "page",
    title: "Wedding & event flowers",
    href: "/wedding-events",
    subtitle: "Mandap, stage and venue florals",
    description:
      "Wedding and event flower design, mandap decor, stage florals and venue styling.",
    keywords: ["wedding", "event", "mandap", "decor", "venue"],
  },
  {
    id: "page-about",
    entity: "page",
    title: "About FreshFlower.zone",
    href: "/about",
    subtitle: "Our story and sourcing",
    description:
      "FreshFlower.zone is a Delhi NCR florist focused on fresh sourcing and reliable morning delivery.",
    keywords: ["about", "story", "florist", "delhi"],
  },
  {
    id: "page-contact",
    entity: "page",
    title: "Contact FreshFlower.zone",
    href: "/contact",
    subtitle: "Call, WhatsApp or email us",
    description:
      "Contact the FreshFlower.zone team for orders, delivery help, wholesale and wedding enquiries.",
    keywords: ["contact", "phone", "whatsapp", "email", "support"],
  },
  {
    id: "page-track-order",
    entity: "page",
    title: "Track your order",
    href: "/track-order",
    subtitle: "Check an existing flower order",
    description:
      "Look up your FreshFlower.zone order using the order number and checkout phone.",
    keywords: ["track", "order status", "delivery status"],
  },
];

const CITY_PAGES: SearchDoc[] = citySeoPages.map((page) => ({
  id: `page-city-${page.slug}`,
  entity: "page",
  title: `Flower delivery in ${page.city}`,
  href: page.route,
  subtitle: page.eyebrow,
  description: [page.metaDescription, ...page.intro].join(" "),
  keywords: [
    page.city,
    "flower delivery",
    "same day",
    "morning delivery",
    ...page.areas.map((area) => area.name),
    ...page.areas.flatMap((area) => area.pincodes),
  ],
}));

const OCCASION_PAGES: SearchDoc[] = occasionSeoPages.map((page) => ({
  id: `page-occasion-${page.slug}`,
  entity: "page",
  title: page.eyebrow,
  href: page.route,
  subtitle: page.title,
  description: [page.metaDescription, ...page.intro].join(" "),
  keywords: [
    page.slug,
    page.eyebrow,
    "flowers",
    "delivery",
    "gift",
  ],
}));

export function buildPageDocs(): SearchDoc[] {
  return [...CORE_PAGES, ...CITY_PAGES, ...OCCASION_PAGES];
}
