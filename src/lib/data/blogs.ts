import type { BlogPost } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview. Swap for `BlogPost.find()` etc.
export const blogs: BlogPost[] = [
  {
    id: "blog-1",
    title: "Best Flowers for Birthday Surprises in Delhi NCR",
    slug: "best-flowers-birthday",
    excerpt: "Bright, personal, and a little unexpected — the flowers that make a birthday feel like theirs.",
    content:
      "A birthday bunch should feel chosen for the person, not pulled from a generic list. The right flowers add colour to the day and say a bit about who they are — and with same-morning delivery across Delhi NCR, the surprise can happen before the day properly starts.",
    coverImage: "gradient-gold",
    author: "FreshFlower Team",
    category: "Guides",
    publishedAt: "2026-08-14T08:00:00.000Z",
    tags: ["birthday", "gifting", "guides"],
    sections: [
      {
        heading: "Match the flower to the birthday energy",
        paragraphs: [
          "For a big, generous celebration, gerberas and sunflowers carry an unmistakable cheer — open-faced colour that asks for attention. For someone quieter, roses, lilies, and baby's breath make a softer, more considered statement.",
          "The happy birthday rule of thumb: if they are loud and laugh loud, choose loud. If they are calm and particular, choose something simpler with better stems.",
        ],
        bullets: [
          "Sunflowers and gerbera daisies — bright, photogenic, celebratory",
          "Roses and pink lilies — romantic and classic for partners",
          "Baby's breath — delicate clouds that suit minimal, beautiful rooms",
        ],
      },
      {
        heading: "Colour does the talking",
        paragraphs: [
          "Yellow and orange read as pure joy. Pink leans warm and affectionate. White and ivory feel elegant and understated. Mix them deliberately — a bunch in two complementary colours often photographs better than a rainbow.",
        ],
      },
      {
        heading: "Timing the surprise",
        paragraphs: [
          "A morning delivery lands the flowers while the birthday breakfast is happening, before plans take over. If you are celebrating in the evening instead, pick a later same-day slot and let the flowers arrive as the party starts.",
        ],
      },
      {
        heading: "Small touches that count",
        paragraphs: [
          "Add a short note in the card, choose a vase-friendly stem count, and check the address a day before. On a birthday, the flowers are only half the message — the fact that you planned them is the rest.",
        ],
      },
    ],
  },
  {
    id: "blog-2",
    title: "How to Keep Roses Fresh at Home",
    slug: "how-to-keep-roses-fresh",
    excerpt: "A handful of simple habits that stretch a rose's vase life from days into more days.",
    content:
      "Roses are tougher than they look — with the right water, cut, and spot, a fresh bunch stays beautiful for well over a week. Here is the routine we use before dispatch, and the one worth repeating at home.",
    coverImage: "gradient-blush",
    author: "FreshFlower Team",
    category: "Care Tips",
    publishedAt: "2026-07-22T08:00:00.000Z",
    tags: ["roses", "care-tips"],
    sections: [
      {
        heading: "Start with a clean vase and the right water",
        paragraphs: [
          "Wash the vase thoroughly — leftover bacteria shorten vase life more than anything else. Fill it with room-temperature water, and use flower food if it came with the bunch.",
        ],
      },
      {
        heading: "Cut the stems properly",
        paragraphs: [
          "Trim about a centimetre at a 45-degree angle under running water. The angled cut opens more drinking surface and the underwater snip stops an air bubble forming in the stem.",
        ],
        bullets: [
          "Recut the stems every two days",
          "Remove any leaves that would sit below the waterline",
          "Keep the water level topped up — roses drink steadily",
        ],
      },
      {
        heading: "Find the flowers the right spot",
        paragraphs: [
          "Keep roses away from direct sun, heaters, AC vents, and the fruit bowl — ripening fruit gives off ethylene that ages cut flowers faster. A cool, shaded corner is ideal, especially through Delhi's hot season.",
        ],
      },
      {
        heading: "Revive a tired bunch",
        paragraphs: [
          "If blooms are drooping, recut the stems and plunge them into deep, cool water for a few hours. Roses are good at coming back from a slump once they have water and shade.",
        ],
      },
    ],
  },
  {
    id: "blog-3",
    title: "Best Flowers for Wedding Decoration",
    slug: "best-flowers-wedding-decoration",
    excerpt: "From mandap to tables, the stems that carry a wedding's mood and the ones that will still look fresh at 11 pm.",
    content:
      "Wedding flowers need to outlast the ceremony, the photos, and a long evening. Choosing the right varieties — not just the prettiest ones — is what keeps a mandap or a table looking as curated at the end of the night as it did for the pheras.",
    coverImage: "gradient-lavender",
    author: "FreshFlower Team",
    category: "Weddings",
    publishedAt: "2026-06-30T08:00:00.000Z",
    tags: ["wedding", "decor"],
    sections: [
      {
        heading: "Build around hardy, full-bodied flowers",
        paragraphs: [
          "Orchids, roses, and lilies hold up for hours of heat and handling. Carnations are the underrated workhorse of Indian wedding decor — long-lasting, textured, and available in colours that match any palette.",
        ],
        bullets: [
          "Phalaenopsis orchids — architectural, elegant, long-lived",
          "Roses and carnations — dependable volume with clean colour",
          "Rajnigandha and mogra — fragrance that anchors the mood",
        ],
      },
      {
        heading: "Layer fragrance with structure",
        paragraphs: [
          "Traditional Indian weddings lean on fragrant stems — mogra, rajnigandha, and jasmine carry scent across a venue in a way visual flowers cannot. Pair them with structural blooms so the arrangement has both smell and shape.",
        ],
      },
      {
        heading: "Plan for the hours, not just the look",
        paragraphs: [
          "Ask about conditioning when you book — flowers that are cut and hydrated close to load-in stay fresher through the evening. And keep a small backup of filler stems and water for quick touch-ups between ceremonies.",
        ],
      },
      {
        heading: "Tables, stages, and mandaps need different weights",
        paragraphs: [
          "Low centerpieces suit guested dinner tables; tall stems suit stage edges; mandap pillars want trailing greens and dangling blooms. Give the florist your layout and the rough number of tables and they can balance the spend where guests actually look.",
        ],
      },
    ],
  },
  {
    id: "blog-4",
    title: "Morning Flower Delivery in Delhi NCR",
    slug: "morning-flower-delivery-delhi",
    excerpt: "Why the 5 AM – 12 PM window matters, and how to make the most of an early doorstep surprise.",
    content:
      "Flowers are at their brightest in the early hours — petals turgid, fragrance intact, stems freshly cut. A morning delivery means your flowers arrive at their peak and spend the whole day opening, not recovering from a hot afternoon journey.",
    coverImage: "gradient-sage",
    author: "FreshFlower Team",
    category: "Delivery",
    publishedAt: "2026-06-05T08:00:00.000Z",
    tags: ["delivery", "delhi-ncr", "mornings"],
    sections: [
      {
        heading: "Why morning delivery is better for the flowers",
        paragraphs: [
          "Cut flowers are hydrating and turgid at dawn, having absorbed water overnight at the market. Handled well, they arrive to you in that same fresh state — before the sun and traffic have done their work on the city.",
        ],
      },
      {
        heading: "What Morning Express means",
        paragraphs: [
          "Our earliest slots run 5 AM – 7 AM and are marked Morning Express. They are ideal for puja preparations, office lobbies that should be fresh before the first guest, and surprises that work because the recipient is still home.",
        ],
        bullets: [
          "5 AM – 7 AM — Morning Express, limited each day",
          "7 AM – 12 PM — standard morning windows",
          "Same-day — order early, choose an open slot at checkout",
        ],
      },
      {
        heading: "Places we reach",
        paragraphs: [
          "We deliver across a focused Delhi NCR footprint — South Extension, Connaught Place, Vasant Kunj, Dwarka, Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad — with fees starting at ₹99.",
        ],
      },
      {
        heading: "Tips for a smooth early delivery",
        paragraphs: [
          "Share a delivery pair's phone number if you can, and hand the flowers through at the address. For office or hotel deliveries, leave a note at the front desk. Early windows book out fastest, so choose a slot as soon as you are ready.",
        ],
      },
    ],
  },
  {
    id: "blog-5",
    title: "Rose Varieties Guide: From Classic Red to Unfolding Casablanca White",
    slug: "rose-varieties-guide",
    excerpt: "The shapes, scents, and strengths of the roses you can actually order — and how to choose between them.",
    content:
      "Not all roses are one rose. Premium long-stem reds, spray roses, garden roses, and fragrant white lilies that seem rose-like all behave very differently — in looks, in scent, and in how long they stay on the stem.",
    coverImage: "gradient-ivory",
    author: "FreshFlower Team",
    category: "Guides",
    publishedAt: "2026-05-10T08:00:00.000Z",
    tags: ["roses", "guides"],
    sections: [
      {
        heading: "The classic red rose",
        paragraphs: [
          "Our most-gifted bunch — 12 premium long-stem red roses, hand-tied with eucalyptus. Deep colour, generous heads, and a vase life of a week when cared for. The default for anniversaries and romantic gestures.",
        ],
      },
      {
        heading: "White and ivory roses",
        paragraphs: [
          "Quieter and more formal, white roses suit weddings, condolences, and elegant everyday gestures. They also pair beautifully with green foliage for a cleaner, more modern arrangement.",
        ],
      },
      {
        heading: "Beyond roses: similar moods, different staying power",
        paragraphs: [
          "If you like the romance but want something longer-lasting or more budget-friendly, carnations and lilies hold their shape beautifully. Casablanca lilies, in particular, open slowly for several days — a bunch that keeps changing and surprising.",
        ],
      },
      {
        heading: "Choosing by stem count",
        paragraphs: [
          "A 6-stem bunch suits a casual thank-you; 10 is the everyday romantic standard; 12 long-stems make a statement. When in doubt, choose fewer, better stems — conditioning quality matters more than sheer number.",
        ],
      },
    ],
  },
  {
    id: "blog-6",
    title: "How to Make Your Bouquet Last Longer in Delhi's Heat",
    slug: "make-bouquet-last-longer-delhi-heat",
    excerpt: "Simple care tips to keep cut flowers fresh through Delhi's warmer months.",
    content:
      "Delhi's heat is tough on cut flowers, but a few habits make a real difference: change the water every two days, trim stems at an angle under running water, keep arrangements away from direct sun and AC vents, and mist delicate blooms like roses in the evening.",
    coverImage: "gradient-gold",
    author: "FreshFlower Team",
    category: "Care Tips",
    publishedAt: "2026-06-01T08:00:00.000Z",
    tags: ["care-tips", "delhi-heat"],
    sections: [
      {
        heading: "Water is the whole game in summer",
        paragraphs: [
          "In heat, flowers drink fast. Check the level daily, top up with room-temperature water, and change it completely every two days. A clean vase with fresh water beats fancy additives.",
        ],
        bullets: [
          "Change water every 2 days",
          "Always recut stems before placing in new water",
          "Keep the vase out of afternoon sun and AC airflow",
        ],
      },
      {
        heading: "Mist like Delhi florists do",
        paragraphs: [
          "A light mist over the blooms in the evening mimics the dewy conditions flowers love. It is especially helpful for roses and hydrangea-like heads that lose moisture fast in dry heat.",
        ],
      },
      {
        heading: "Know when to say goodbye",
        paragraphs: [
          "Some flowers are at their best for four days in summer and that is fine. Timing your order for when you actually need the bunch — not earlier — is the simplest way to always have fresh flowers.",
        ],
      },
    ],
  },
  {
    id: "blog-7",
    title: "Why Mogra Is Delhi's Most-Loved Everyday Flower",
    slug: "mogra-delhis-most-loved-everyday-flower",
    excerpt: "The story and tradition behind the city's favourite fragrant bloom.",
    content:
      "Walk past any Delhi flower market at dawn and you'll catch the scent of mogra before you see it. Strung into gajras or scattered loose, it is woven into the city's daily rituals — a small everyday luxury that outranks any imported bloom for sentiment.",
    coverImage: "gradient-ivory",
    author: "FreshFlower Team",
    category: "Tradition",
    publishedAt: "2026-03-05T08:00:00.000Z",
    tags: ["mogra", "tradition"],
    sections: [
      {
        heading: "A bloom for every morning",
        paragraphs: [
          "Mogra appears at temples, in braids, over decor, and in the corner of a living room where it fills a whole afternoon with scent. It is democracy in flower form — affordable, fragrant, and everywhere.",
        ],
      },
      {
        heading: "How to keep a gajra fresh",
        paragraphs: [
          "Store it in the fridge drawer wrapped in a damp cloth overnight, and mist it lightly in the evening. A fresh string stays fragrant for a day or two — that is the deal with honesty in flowers.",
        ],
      },
      {
        heading: "Why it pairs with everything",
        paragraphs: [
          "Mogra's quiet white fragrance sits alongside bold decor, festive plates, and gift hampers without ever competing. It is why it endures as the city's default scent of goodwill.",
        ],
      },
    ],
  },
  {
    id: "blog-8",
    title: "A Guide to Choosing Flowers by Occasion",
    slug: "guide-choosing-flowers-by-occasion",
    excerpt: "From condolence to celebration — which blooms suit which moment.",
    content:
      "Not every occasion calls for the same flower. White lilies and roses suit condolence arrangements with their quiet dignity, while sunflowers and gerbera bring the right energy to birthdays.",
    coverImage: "gradient-lavender",
    author: "FreshFlower Team",
    category: "Guides",
    publishedAt: "2026-04-18T08:00:00.000Z",
    tags: ["guide", "occasions"],
    sections: [
      {
        heading: "Celebrations want colour",
        paragraphs: [
          "Birthdays, congratulations, and get-well gestures suit bright, open flowers — gerberas, sunflowers, and mixed pastels carry happiness without needing a written explanation.",
        ],
      },
      {
        heading: "Romance wants intention",
        paragraphs: [
          "Roses stay the language of anniversaries and Valentine's gestures for a reason. If the relationship is newer or quieter, lilies or a single elegant stem often lands better than a loud arrangement.",
        ],
      },
      {
        heading: "Formal moments want restraint",
        paragraphs: [
          "Condolence and corporate gestures favour white, ivory, and green — lilies, white roses, and clean foliage. The flowers should express care without demanding attention.",
        ],
      },
      {
        heading: "Everyday sends its own message",
        paragraphs: [
          "Just-because flowers are the most personal of all — a fragrant mogra string or a handful of sunflowers says you were thinking of them with no special date needed.",
        ],
      },
    ],
  },
];