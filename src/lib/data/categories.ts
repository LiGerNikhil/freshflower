import type { Category } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview. Swap the export below for a
// Mongoose query (e.g. `Category.find()`) without touching any component.
export const categories: Category[] = [
  {
    id: "cat-roses",
    name: "Roses",
    slug: "roses",
    description: "Classic, romantic, and always in season.",
    heroImage: "gradient-blush",
    imageUrl:
      "https://api.floraindia.com/upload/a2vEVMcJyR1742619520381.webp",
  },
  {
    id: "cat-gerbera",
    name: "Gerbera",
    slug: "gerbera",
    description: "Bright, cheerful daisies for everyday joy.",
    heroImage: "gradient-gold",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcY4wxqURkdIRA6WUsYle_q9d50sMYTDtDmm_NMh-atfzSjX839aBmeZA&s=10",
  },
  {
    id: "cat-mogra",
    name: "Mogra",
    slug: "mogra",
    description: "Fragrant jasmine, a Delhi favourite for pooja and gifting.",
    heroImage: "gradient-ivory",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqdiPpcc6mdA5PSdUAJhDQpqDL0Koh2_lhp3bAJkCfX8Uo5yT3S7R8OAE&s=10",
  },
  {
    id: "cat-sunflower",
    name: "Sunflower",
    slug: "sunflower",
    description: "Bold and radiant, a statement in every room.",
    heroImage: "gradient-gold",
    imageUrl:
      "https://www.gardendesign.com/pictures/images/675x529Max/site_3/ring-of-fire-sunflower-bicolor-sunflower-all-america-selections_12080.jpg",
  },
  {
    id: "cat-carnations",
    name: "Carnations",
    slug: "carnations",
    description: "Long-lasting ruffled blooms in soft, layered colour.",
    heroImage: "gradient-lavender",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1lDOloGCIwv0_ElH5h6tkeTmGFB_Tc8Wz47hd6HmVLM7ckPmgiJ0VY5SD&s=10",
  },
  {
    id: "cat-orchid",
    name: "Orchid",
    slug: "orchid",
    description: "Exotic and architectural — the premium gifting choice.",
    heroImage: "gradient-lavender",
    imageUrl: "https://m.media-amazon.com/images/I/71dUMvEfW7L.jpg",
  },
  {
    id: "cat-lily",
    name: "Lily",
    slug: "lily",
    description: "Elegant, fragrant stems for milestone occasions.",
    heroImage: "gradient-blush",
  },
  {
    id: "cat-rajnigandha",
    name: "Rajnigandha",
    slug: "rajnigandha",
    description: "Tuberose — a fragrant, traditional favourite.",
    heroImage: "gradient-sage",
  },
  {
    id: "cat-babys-breath",
    name: "Baby's Breath",
    slug: "babys-breath",
    description: "Delicate filler blooms, perfect for soft arrangements.",
    heroImage: "gradient-ivory",
  },
  {
    id: "cat-strings",
    name: "Strings",
    slug: "strings",
    description: "Fresh flower strings and traditional garlands for rituals, gifting, and décor.",
    heroImage: "gradient-ivory",
  },
  {
    id: "cat-fresh-loose-flowers",
    name: "Fresh Loose Flowers",
    slug: "fresh-loose-flowers",
    description: "Loose blooms selected fresh for pooja, temple offerings, and everyday floral use.",
    heroImage: "gradient-gold",
  },
  {
    id: "cat-exotic-premium-flowers",
    name: "Exotic Premium Flowers",
    slug: "exotic-premium-flowers",
    description: "Statement blooms with rich texture, premium detailing, and a luxury finish.",
    heroImage: "gradient-lavender",
  },
  {
    id: "cat-leaves-farm-grasses",
    name: "Leaves Farm & Grasses",
    slug: "leaves-farm-grasses",
    description: "Leafy fillers, farm greens, and grasses for luxury arrangements and event styling.",
    heroImage: "gradient-sage",
  },
  {
    id: "cat-malas-wedding-jaymalas",
    name: "Malas and Wedding Jaymalas",
    slug: "malas-and-wedding-jaymalas",
    description: "Wedding garlands, malas, and ceremonial flower pieces crafted for sacred and festive moments.",
    heroImage: "gradient-blush",
  },
  {
    id: "cat-rose-bouquet",
    name: "Rose Bouquet",
    slug: "rose-bouquet",
    description: "Signature rose arrangements in curated bouquet counts for gifting and celebration.",
    heroImage: "gradient-blush",
  },
];
