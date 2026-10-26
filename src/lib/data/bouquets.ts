import type { Bouquet } from "@/lib/types";

export const bouquets: Bouquet[] = [
  {
    id: "bq-rose-bouquet-60",
    name: "60 Rose Bouquet",
    slug: "60-rose-bouquet",
    description:
      "A classic rose arrangement for intimate gifting, birthdays, and thoughtful milestones.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 2000,
    images: ["gradient-blush"],
    occasionIds: ["occ-anniversary", "occ-birthday"],
    featured: true,
  },
  {
    id: "bq-rose-bouquet-80",
    name: "80 Rose Bouquet",
    slug: "80-rose-bouquet",
    description:
      "A fuller rose bouquet for sweet gestures, festive surprises, and premium everyday gifting.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 2500,
    images: ["gradient-blush"],
    occasionIds: ["occ-anniversary", "occ-birthday"],
    featured: true,
  },
  {
    id: "bq-rose-bouquet-100",
    name: "100 Rose Bouquet",
    slug: "100-rose-bouquet",
    description:
      "An elevated statement bouquet designed for grander celebrations and memorable gifting.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 3000,
    images: ["gradient-blush"],
    occasionIds: ["occ-anniversary", "occ-just-because"],
    featured: true,
  },
  {
    id: "bq-rose-bouquet-200",
    name: "200 Rose Bouquet",
    slug: "200-rose-bouquet",
    description:
      "A rich, high-impact bouquet crafted for décor, gifting at scale, and larger events.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 5800,
    images: ["gradient-blush"],
    occasionIds: ["occ-wedding", "occ-congratulations"],
    featured: false,
  },
  {
    id: "bq-rose-bouquet-300",
    name: "300 Rose Bouquet",
    slug: "300-rose-bouquet",
    description:
      "A premium rose arrangement built for luxe gifting and milestone moments that deserve extra impact.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 8500,
    images: ["gradient-blush"],
    occasionIds: ["occ-wedding", "occ-anniversary"],
    featured: false,
  },
  {
    id: "bq-rose-bouquet-500",
    name: "500 Rose Bouquet",
    slug: "500-rose-bouquet",
    description:
      "A dramatic floral statement with layered rose volume for event styling and large-scale gifting.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 13500,
    images: ["gradient-blush"],
    occasionIds: ["occ-wedding", "occ-just-because"],
    featured: false,
  },
  {
    id: "bq-rose-bouquet-1000",
    name: "1000 Rose Bouquet",
    slug: "1000-rose-bouquet",
    description:
      "An indulgent, large-format rose arrangement for grand celebrations, venue styling, and luxury gifting.",
    items: [
      { flowerId: "fl-bangalore-rose", quantity: 1 },
      { flowerId: "fl-babys-breath", quantity: 1 },
    ],
    price: 21000,
    images: ["gradient-blush"],
    occasionIds: ["occ-wedding", "occ-just-because"],
    featured: false,
  },
];
