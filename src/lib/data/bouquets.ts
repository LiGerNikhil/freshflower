import type { Bouquet } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
export const bouquets: Bouquet[] = [
  {
    id: "bq-blush-romance",
    name: "Blush Romance",
    slug: "blush-romance",
    description:
      "Red roses, pink lilies, and baby's breath, hand-arranged in a blush wrap — our signature anniversary bouquet.",
    items: [
      { flowerId: "fl-red-rose-bunch", quantity: 1 },
      { flowerId: "fl-lily-pink", quantity: 1 },
      { flowerId: "fl-babys-breath-bunch", quantity: 1 },
    ],
    price: 2999,
    images: ["gradient-blush"],
    occasionIds: ["occ-anniversary"],
    featured: true,
  },
  {
    id: "bq-sunny-cheer",
    name: "Sunny Cheer",
    slug: "sunny-cheer",
    description:
      "Sunflowers and mixed gerbera daisies for a burst of colour that's impossible not to smile at.",
    items: [
      { flowerId: "fl-sunflower-bunch", quantity: 1 },
      { flowerId: "fl-gerbera-mixed", quantity: 1 },
    ],
    price: 1699,
    images: ["gradient-gold"],
    occasionIds: ["occ-birthday", "occ-get-well"],
    featured: true,
  },
  {
    id: "bq-serene-white",
    name: "Serene White",
    slug: "serene-white",
    description:
      "White roses and Casablanca lilies, arranged simply for condolence or quiet, dignified gifting.",
    items: [
      { flowerId: "fl-white-rose-bunch", quantity: 1 },
      { flowerId: "fl-lily-white", quantity: 1 },
    ],
    price: 2199,
    images: ["gradient-ivory"],
    occasionIds: ["occ-condolence"],
    featured: false,
  },
];
