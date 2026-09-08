// Preview-only content for the local SEO landing pages.
// Every page has genuinely distinct intro copy, local details, and FAQ copy —
// not simply a swapped city name. Swappable for CMS content in a later phase.

export interface SeoAreaChip {
  name: string;
  pincodes: string[];
  fee: number;
  eta: number;
}

export interface CitySeoPage {
  slug: string;
  route: string;
  city: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  highlights: string[];
  areas: SeoAreaChip[];
  flowerIds: string[];
  faqs: { question: string; answer: string }[];
  tone: string;
  nearby: { label: string; href: string }[];
}

export interface OccasionSeoPage {
  slug: string;
  route: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  highlights: string[];
  occasionId: string;
  faqs: { question: string; answer: string }[];
  tone: string;
  nearby: { label: string; href: string }[];
}

export const citySeoPages: CitySeoPage[] = [
  {
    slug: "delhi",
    route: "/flower-delivery-delhi",
    city: "Delhi",
    eyebrow: "Delhi flower delivery",
    title: "Flower delivery across Delhi, before the day starts.",
    metaTitle: "Flower Delivery in Delhi | Same-Day & Morning Flowers | FreshFlower.zone",
    metaDescription: "Fresh flower delivery in Delhi — South Extension, Connaught Place, Vasant Kunj & Dwarka. Morning slots from ₹99, same-day options, puja & gifting ready.",
    intro: [
      "Delhi runs on early starts — puja before sunrise, offices that should look fresh before the first guest, and gifting that works best when it is already there. Our Delhi delivery footprint is built around those hours: flowers selected at dawn, handed over in the morning window you choose.",
      "From the lanes of South Extension to the business calm of Connaught Place and the spread of Vasant Kunj and Dwarka, we focus on a serviceable core rather than spreading thin across the whole map. That focus is what lets us promise a reliable morning handoff.",
    ],
    highlights: [
      "Morning windows from 5 AM suit puja, office desks, and early surprises",
      "Same-day delivery available before the day's slots fill",
      "Porter-based last-mile delivery with charges settled at the door",
      "Fees from ₹99 in nearby areas like South Extension and Connaught Place",
    ],
    areas: [
      { name: "South Extension", pincodes: ["110049"], fee: 99, eta: 90 },
      { name: "Connaught Place", pincodes: ["110001"], fee: 99, eta: 75 },
      { name: "Vasant Kunj", pincodes: ["110070"], fee: 129, eta: 100 },
      { name: "Dwarka", pincodes: ["110075"], fee: 129, eta: 100 },
    ],
    flowerIds: [
      "fl-red-rose-bunch",
      "fl-mogra-string",
      "fl-rajnigandha-bunch",
      "fl-gerbera-mixed",
      "fl-sunflower-bunch",
      "fl-lily-pink",
    ],
    faqs: [
      {
        question: "Do you deliver home addresses in South Delhi?",
        answer: "Yes — South Extension, Connaught Place, Vasant Kunj, and Dwarka are our core Delhi areas. We also do best-effort deliveries elsewhere in the city; contact us and we will check the slot.",
      },
      {
        question: "Can you deliver flowers to a Delhi office early?",
        answer: "Yes. Morning Express slots run 5–7 AM and are ideal for reception desks and lobbies. Leave a note at the front desk if required and we will hand over through the received contact.",
      },
      {
        question: "Is same-day delivery available across Delhi?",
        answer: "Same-day delivery is subject to open slots. Order as early as possible — morning windows across Delhi book out fastest.",
      },
      {
        question: "What are the delivery charges within Delhi?",
        answer: "From ₹99 in South Extension and Connaught Place to ₹129 in Vasant Kunj and Dwarka. The exact fee is confirmed at checkout from your pincode.",
      },
    ],
    tone: "blush",
    nearby: [
      { label: "Gurgaon", href: "/flower-delivery-gurgaon" },
      { label: "Noida", href: "/flower-delivery-noida" },
      { label: "Birthday flowers", href: "/birthday-flowers" },
      { label: "Anniversary flowers", href: "/anniversary-flowers" },
    ],
  },
  {
    slug: "gurgaon",
    route: "/flower-delivery-gurgaon",
    city: "Gurgaon",
    eyebrow: "Gurgaon flower delivery",
    title: "Flowers for Gurgaon, timed around your day.",
    metaTitle: "Flower Delivery in Gurgaon | DLF Phase 1–5 Same-Day | FreshFlower.zone",
    metaDescription: "Reliable flower delivery in Gurgaon — DLF Phase 1–5, offices & residences. Same-day and morning delivery from ₹149, corporate-friendly.",
    intro: [
      "Gurgaon's days are dictated by commute schedules, meetings, and the occasional small business milestone worth marking with flowers. We deliver across the DLF Phase 1–5 corridor and nearby residential sectors, with morning windows that fit an office day and same-day options when the thought strikes late.",
      "Corporate clients appreciate the consistency — a tidy arrangement that arrives before the first external guest, on a schedule they can plan around. For homes, the same reliability means your Gurgaon surprise lands while the morning is still quiet.",
    ],
    highlights: [
      "DLF Phase 1–5 delivery plus surrounding sectors",
      "Morning windows that suit commuter-family schedules",
      "Corporate gifting handled on a dependable recurring schedule",
      "Delivery fee ₹149 with Porter last-mile",
    ],
    areas: [
      { name: "Gurgaon (DLF Phase 1–5)", pincodes: ["122002", "122009"], fee: 149, eta: 120 },
    ],
    flowerIds: [
      "fl-orchid-phalaenopsis",
      "fl-red-rose-bunch",
      "fl-lily-pink",
      "fl-gerbera-mixed",
      "fl-sunflower-bunch",
      "fl-babys-breath-bunch",
    ],
    faqs: [
      {
        question: "Which Gurgaon areas do you cover?",
        answer: "Our core Gurgaon footprint is the DLF Phase 1–5 corridor with pincodes 122002 and 122009. For other sectors we usually manage — contact us with your address to confirm.",
      },
      {
        question: "Can you deliver to my Gurgaon office?",
        answer: "Yes, office delivery is a regular part of our Gurgaon service. Morning Express slots get arrangements to receptions before the workday begins.",
      },
      {
        question: "Will the flowers survive the Gurgaon commute?",
        answer: "Flowers travel in short, direct runs from our preparation point, packed to avoid heat and handling. The rest is on the vase — our care guide covers keeping them fresh longer.",
      },
      {
        question: "Do you set up recurring corporate flower deliveries?",
        answer: "We handle recurring schedules for Gurgaon offices and hotels — weekly reception stems, event decor, and client gifting. Talk to us about a consolidated monthly arrangement.",
      },
    ],
    tone: "sage",
    nearby: [
      { label: "Delhi", href: "/flower-delivery-delhi" },
      { label: "Noida", href: "/flower-delivery-noida" },
      { label: "Wholesale flowers", href: "/wholesale" },
      { label: "Wedding flowers", href: "/wedding-flowers" },
    ],
  },
  {
    slug: "noida",
    route: "/flower-delivery-noida",
    city: "Noida",
    eyebrow: "Noida flower delivery",
    title: "Flowers in Noida, at their freshest and on time.",
    metaTitle: "Flower Delivery in Noida | Sec 15–62 Morning & Same-Day | FreshFlower.zone",
    metaDescription: "Same-day and morning flower delivery in Noida (Sector 15–62). Fragrant gifting for festivals, birthdays & homes — delivery fee ₹149.",
    intro: [
      "Noida is a family-city — birthday mornings, housewarmings, and festival gatherings where the flowers should carry tradition as well as sparkle. Our Noida service spans Sectors 15 to 62, delivering fragrant stems like mogra and rajnigandha alongside bright festival-ready bunches.",
      "The Noida delivery runs are scheduled for the morning hours when someone is home to receive them, and slots are timed to keep the flowers out of the midday heat. Same-day options cover the occasions that come together at short notice.",
    ],
    highlights: [
      "Sector 15–62 coverage with a family-friendly handoff rhythm",
      "Festival and puja favourites delivered morning-fresh",
      "Same-day delivery for last-minute celebrations",
      "Delivery fee ₹149, paid to the Porter at your door",
    ],
    areas: [
      { name: "Noida (Sector 15–62)", pincodes: ["201301"], fee: 149, eta: 120 },
    ],
    flowerIds: [
      "fl-gerbera-mixed",
      "fl-mogra-string",
      "fl-rajnigandha-bunch",
      "fl-carnation-pastel",
      "fl-babys-breath-bunch",
      "fl-red-rose-bunch",
    ],
    faqs: [
      {
        question: "Do you deliver across all of Noida?",
        answer: "Our core coverage is Sectors 15–62 (pincode 201301). We routinely manage other sectors too — share your address and we will confirm a slot.",
      },
      {
        question: "Can I get festival flowers like mogra delivered?",
        answer: "Yes — mogra gajras and rajnigandha bunches are morning items in our Noida area and arrive ready for puja and festive decor.",
      },
      {
        question: "How do birthdays usually get delivered in Noida?",
        answer: "Most people choose a morning window so the flowers are there for breakfast and the first surprise of the day. Evening same-day slots work for parties starting later.",
      },
      {
        question: "What does Noida delivery cost?",
        answer: "The flower booking does not include delivery — a Porter charge of around ₹149 is payable to the rider at delivery. Final amount depends on distance and demand at dispatch.",
      },
    ],
    tone: "lavender",
    nearby: [
      { label: "Greater Noida", href: "/flower-delivery-greater-noida" },
      { label: "Delhi", href: "/flower-delivery-delhi" },
      { label: "Birthday flowers", href: "/birthday-flowers" },
      { label: "Wedding flowers", href: "/wedding-flowers" },
    ],
  },
  {
    slug: "greater-noida",
    route: "/flower-delivery-greater-noida",
    city: "Greater Noida",
    eyebrow: "Greater Noida flower delivery",
    title: "Flowers for Greater Noida, where the city is still new.",
    metaTitle: "Flower Delivery in Greater Noida | Same-Day & Morning | FreshFlower.zone",
    metaDescription: "Fresh flower delivery in Greater Noida — Alpha/Beta/Gamma sectors, Pari Chowk & beyond. Morning and same-day delivery from ₹159.",
    intro: [
      "Greater Noida is Delhi NCR's newest chapter — wide roads, fresh apartment towers, university life, and a growing strip of homes and cafés. It is exactly the kind of place where a well-timed flower delivery makes a new address feel settled.",
      "Our Greater Noida runs cover the Alpha, Beta, and Gamma sectors, around Pari Chowk and the institutional belt. Being a farther leg of the network, we time the slots to keep flowers cool and fresh for the journey.",
    ],
    highlights: [
      "Sector coverage around Pari Chowk and the Alpha–Gamma belts",
      "Slots planned to keep flowers cool on the longer run",
      "Same-day delivery subject to slot availability",
      "Delivery fee ₹159 via Porter",
    ],
    areas: [
      { name: "Greater Noida", pincodes: ["201310", "201306"], fee: 159, eta: 140 },
    ],
    flowerIds: [
      "fl-orchid-phalaenopsis",
      "fl-sunflower-bunch",
      "fl-gerbera-mixed",
      "fl-red-rose-bunch",
      "fl-lily-pink",
      "fl-carnation-red",
    ],
    faqs: [
      {
        question: "Which parts of Greater Noida do you serve?",
        answer: "Our coverage centres on Alpha, Beta, and Gamma sectors and the Pari Chowk area, pincodes 201310 and 201306. Contact us for addresses further out and we will try to arrange it.",
      },
      {
        question: "Is same-day delivery possible in Greater Noida?",
        answer: "Yes, subject to open slots for your sector and date. Because of the distance, we recommend ordering early in the day for same-day.",
      },
      {
        question: "Do you deliver to universities and hostels?",
        answer: "We regularly deliver to hostels and institutions around the university belt — mornings work best for parcels that need to reach reception or a room door.",
      },
      {
        question: "Why is the delivery fee slightly higher here?",
        answer: "Greater Noida is the farthest leg of our network. The ₹159 base fee reflects the longer route, and the exact Porter amount is confirmed at dispatch.",
      },
    ],
    tone: "sage",
    nearby: [
      { label: "Noida", href: "/flower-delivery-noida" },
      { label: "Ghaziabad", href: "/flower-delivery-ghaziabad" },
      { label: "Anniversary flowers", href: "/anniversary-flowers" },
      { label: "Birthday flowers", href: "/birthday-flowers" },
    ],
  },
  {
    slug: "ghaziabad",
    route: "/flower-delivery-ghaziabad",
    city: "Ghaziabad",
    eyebrow: "Ghaziabad flower delivery",
    title: "Flowers in Ghaziabad, steeped in tradition and prompt.",
    metaTitle: "Flower Delivery in Ghaziabad | Gifting & Festivals | FreshFlower.zone",
    metaDescription: "Same-day & morning flower delivery in Ghaziabad — Kaushambi, Indirapuram, Vaishali & nearby. Festival-ready mogra & gifting bouquets from ₹149.",
    intro: [
      "Ghaziabad sits deep in the NCR's family belt, a place where festivals, gifting, and daily puja keep flowers in constant, gentle demand. Our Ghaziabad runs cover Kaushambi, Indirapuram, and Vaishali, carrying the city's favourites — fragrant mogra, rajnigandha, and bright celebration bunches.",
      "Because much of Ghaziabad's gifting is time-bound — a festival morning, a haldi, a religious function — we schedule these slots around the hours the family is together and ready to receive.",
    ],
    highlights: [
      "Kaushambi, Indirapuram & Vaishali plus nearby localities",
      "Festival and puja-ready mogra and rajnigandha",
      "Gifting bunches timed for family gatherings",
      "Delivery fee ₹149 via Porter",
    ],
    areas: [
      { name: "Ghaziabad", pincodes: ["201001", "201010"], fee: 149, eta: 135 },
    ],
    flowerIds: [
      "fl-mogra-string",
      "fl-rajnigandha-bunch",
      "fl-carnation-pastel",
      "fl-gerbera-mixed",
      "fl-sunflower-bunch",
      "fl-lily-white",
    ],
    faqs: [
      {
        question: "Do you deliver in Indirapuram and Vaishali?",
        answer: "Yes — Kaushambi, Indirapuram, and Vaishali are part of our Ghaziabad coverage, with pincodes 201010 and 201001 across the area.",
      },
      {
        question: "Can you get flowers to me before a festival puja?",
        answer: "Festival mornings run on early slots. Morning Express (5–7 AM) is ideal for puja-ready mogra and rajnigandha — book a day ahead where possible.",
      },
      {
        question: "Are gifting bunches wrapped for travel?",
        answer: "Yes — every gifting bunch is conditioned and wrapped to survive a Ghaziabad commute, and fragile blooms are packed with extra care.",
      },
      {
        question: "What are the Ghaziabad delivery charges?",
        answer: "A Porter delivery charge around ₹149 is payable at the door; the exact amount is confirmed at dispatch based on route and demand.",
      },
    ],
    tone: "ivory-deep",
    nearby: [
      { label: "Delhi", href: "/flower-delivery-delhi" },
      { label: "Faridabad", href: "/flower-delivery-faridabad" },
      { label: "Wedding flowers", href: "/wedding-flowers" },
      { label: "Anniversary flowers", href: "/anniversary-flowers" },
    ],
  },
  {
    slug: "faridabad",
    route: "/flower-delivery-faridabad",
    city: "Faridabad",
    eyebrow: "Faridabad flower delivery",
    title: "Fresh flowers in Faridabad, hands on time.",
    metaTitle: "Flower Delivery in Faridabad | NIT, Sector 16–21 | FreshFlower.zone",
    metaDescription: "Same-day & morning flower delivery in Faridabad — NIT, Sectors 16–21 & nearby. Romantic roses, cheerful gerberas from ₹149 delivery.",
    intro: [
      "Faridabad is a city of milestones — engagements, housewarmings, long-awaited birthdays — where flowers carry real sentiment. We cover the NIT area and Sectors 16 through 21, delivering everything from romantic rose bunches to bright gerbera gifts at the moment they matter.",
      "Our Faridabad runs are timed around evenings and rapid mornings equally, so whether the occasion is a dinner surprise or a dawn celebration, there is a slot that fits.",
    ],
    highlights: [
      "NIT and Sector 16–21 coverage plus nearby localities",
      "Romantic and celebratory bunches for milestone days",
      "Same-day delivery for evening surprises",
      "Delivery fee ₹149 via Porter",
    ],
    areas: [
      { name: "Faridabad", pincodes: ["121001", "121003"], fee: 149, eta: 130 },
    ],
    flowerIds: [
      "fl-red-rose-bunch",
      "fl-gerbera-mixed",
      "fl-lily-pink",
      "fl-mogra-string",
      "fl-carnation-red",
      "fl-sunflower-bunch",
    ],
    faqs: [
      {
        question: "Where in Faridabad do you deliver?",
        answer: "Our coverage includes the NIT area and Sectors 16–21, pincodes 121001 and 121003. Many other localities are manageable — confirm with us against your address.",
      },
      {
        question: "Can I order roses for an anniversary in Faridabad?",
        answer: "Absolutely — rose bunches are our most-ordered anniversary gift in Faridabad, and we can time the delivery for the morning or evening surprise.",
      },
      {
        question: "Is same-day delivery available?",
        answer: "Yes, when slots are open. For evening occasions in Faridabad, a later same-day slot works well; morning windows suit early celebrations.",
      },
      {
        question: "How much is delivery to Faridabad?",
        answer: "Around ₹149, payable to the Porter at your door. The flower price is shown at checkout and does not include this fee.",
      },
    ],
    tone: "blush",
    nearby: [
      { label: "Delhi", href: "/flower-delivery-delhi" },
      { label: "Ghaziabad", href: "/flower-delivery-ghaziabad" },
      { label: "Birthday flowers", href: "/birthday-flowers" },
      { label: "Wedding flowers", href: "/wedding-flowers" },
    ],
  },
];

export const occasionSeoPages: OccasionSeoPage[] = [
  {
    slug: "birthday",
    route: "/birthday-flowers",
    eyebrow: "Birthday flowers",
    title: "Birthday flowers that arrive like a head start on the day.",
    metaTitle: "Birthday Flowers Delhi NCR | Same-Day & Morning Delivery | FreshFlower.zone",
    metaDescription: "Birthday flowers for Delhi NCR — bright gerberas, sunflowers & roses with morning and same-day delivery. Fresh, personal, and on time.",
    intro: [
      "A birthday bunch should feel chosen for the person — not lifted from a generic list. We lean on colour as the shortcut: sunflowers and gerbera for the loud-and-proud crowd, roses and lilies for the romantics, and delicate baby's breath for the quiet ones who notice details.",
      "Timing does half the work on a birthday. A morning delivery lands the surprise at breakfast, before plans take over the day; a later same-day slot brings the flowers in as the party begins.",
    ],
    highlights: [
      "Colour-led bunches sorted by who you are buying for",
      "Morning delivery for breakfast surprises",
      "Same-day delivery for last-minute plans",
      "Add a note — the card is half the message",
    ],
    occasionId: "occ-birthday",
    faqs: [
      {
        question: "What are the best birthday flowers?",
        answer: "Sunflowers and gerbera daisies for bold celebrations, roses and pink lilies for romantic gestures, and baby's breath for a delicate, personal touch. Colour and personality matter more than price.",
      },
      {
        question: "Can you deliver birthday flowers today?",
        answer: "Same-day delivery is available when slots are open — order early in the day to secure a morning or evening window for your city.",
      },
      {
        question: "How far in advance should I order?",
        answer: "A day ahead is safest for morning windows. For same-day, order as early as possible — birthday mornings book out fastest.",
      },
      {
        question: "Which city areas do you cover for birthdays?",
        answer: "Delhi (South Extension, Connaught Place, Vasant Kunj, Dwarka), Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad.",
      },
    ],
    tone: "gold-soft",
    nearby: [
      { label: "Anniversary flowers", href: "/anniversary-flowers" },
      { label: "Wedding flowers", href: "/wedding-flowers" },
      { label: "Flower delivery in Delhi", href: "/flower-delivery-delhi" },
      { label: "All occasions", href: "/occasions" },
    ],
  },
  {
    slug: "anniversary",
    route: "/anniversary-flowers",
    eyebrow: "Anniversary flowers",
    title: "Anniversary flowers for another year of choosing each other.",
    metaTitle: "Anniversary Flowers Delhi NCR | Roses, Lilies & More | FreshFlower.zone",
    metaDescription: "Send anniversary flowers across Delhi NCR — classic roses, fragrant lilies & elegant white blooms with morning and same-day delivery.",
    intro: [
      "Anniversaries are the quiet holiday of marriage — no calendar pressure, just the private joy of marking another year. Flowers are the natural shorthand, and roses are the default for a reason: they say the same thing in any language.",
      "But the anniversary edit goes beyond a dozen reds. Fragrant pink lilies bring romance with a softer register, and ivory and white stems suit the pairs who prefer elegant restraint. Whatever the register, a morning delivery makes the gesture feel thoughtful rather than performed.",
    ],
    highlights: [
      "Classic roses for the traditional declaration",
      "Lilies and white stems for quieter pairings",
      "Morning delivery — thoughtful, not performative",
      "Same-day slots for the resolve that arrives late",
    ],
    occasionId: "occ-anniversary",
    faqs: [
      {
        question: "What flowers say anniversary best?",
        answer: "Roses are the classic choice — 10 to a dozen premium stems carry the message well. Pink lilies and white casablanca add romance or elegance when red feels too loud.",
      },
      {
        question: "Can I get anniversary flowers delivered the same day?",
        answer: "Yes, when slots are open in your area. For an evening dinner surprise, a later same-day slot is ideal; mornings suit quiet breakfast gestures.",
      },
      {
        question: "Do you deliver to both homes and restaurants?",
        answer: "We deliver to homes, offices, and venue addresses across our Delhi NCR areas. For restaurants, share the table or reservation name and a waiter number where possible.",
      },
      {
        question: "What is the order cutoff for the next morning?",
        answer: "Order by the previous evening to secure a morning window. Same-day morning delivery works if you order before the slots for your area fill.",
      },
    ],
    tone: "blush",
    nearby: [
      { label: "Birthday flowers", href: "/birthday-flowers" },
      { label: "Wedding flowers", href: "/wedding-flowers" },
      { label: "Flower delivery in Gurgaon", href: "/flower-delivery-gurgaon" },
      { label: "All occasions", href: "/occasions" },
    ],
  },
  {
    slug: "wedding",
    route: "/wedding-flowers",
    eyebrow: "Wedding flowers",
    title: "Wedding flowers for the big day and everything around it.",
    metaTitle: "Wedding Flowers Delhi NCR | Decor, Bridal & Gifting | FreshFlower.zone",
    metaDescription: "Wedding flowers in Delhi NCR — mandap, stage, bridal bunches, and table florals with event planning, bulk pricing, and morning delivery.",
    intro: [
      "Wedding florals have to outlast the ceremony, the photographs, and a long evening — which is why variety choice matters more than abundance. Orchids, roses, and carnations carry the hours; mogra and rajnigandha carry the scent that anchors the mood.",
      "From a single bridal bouquet to venue-wide decor, we plan around your layout, your palettes, and the hours your vendors need. Scheduled across Delhi NCR venues, the flowers arrive conditioned and ready for load-in, with morning timing that keeps them fresh the whole day.",
    ],
    highlights: [
      "Bridal, mandap, stage, and table florals",
      "Hardy stems chosen for hours of heat and handling",
      "Venue-aware planning with load-in timing",
      "Bulk and wholesale pricing for large events",
    ],
    occasionId: "occ-wedding",
    faqs: [
      {
        question: "How far in advance should I book wedding flowers?",
        answer: "We recommend 3–5 days for clearances and sourcing, and longer for out-of-season varieties or large venue-dressing. Rush orders are possible for smaller floral needs.",
      },
      {
        question: "What flowers last through a whole wedding day?",
        answer: "Orchids, roses, and carnations hold up best in heat and handling. Pair them with mogra or rajnigandha for fragrance, and keep back-up stems for touch-ups between ceremonies.",
      },
      {
        question: "Can you handle both venue decor and bridal flowers?",
        answer: "Yes — we plan mandap, stage, table, and bridal/groom florals together so the palette stays coherent and the budget lands where guests actually look.",
      },
      {
        question: "Do you deliver to wedding venues across Delhi NCR?",
        answer: "We serve venues in Delhi, Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad. Share the venue and timeline and we will plan load-in around your vendors.",
      },
    ],
    tone: "lavender",
    nearby: [
      { label: "Anniversary flowers", href: "/anniversary-flowers" },
      { label: "Birthday flowers", href: "/birthday-flowers" },
      { label: "Wedding & events", href: "/wedding-events" },
      { label: "Wholesale flowers", href: "/wholesale" },
    ],
  },
];