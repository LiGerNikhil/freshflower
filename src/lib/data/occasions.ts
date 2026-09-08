import type { Occasion } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
export const occasions: Occasion[] = [
  { id: "occ-anniversary", name: "Anniversary", slug: "anniversary", description: "Celebrate another year of love." },
  { id: "occ-birthday", name: "Birthday", slug: "birthday", description: "Bright blooms for a bright day." },
  { id: "occ-wedding", name: "Wedding", slug: "wedding", description: "Florals for the big day, big or small." },
  { id: "occ-valentines-day", name: "Valentine's Day", slug: "valentines-day", description: "A little more romance, wrapped beautifully." },
  { id: "occ-mothers-day", name: "Mother's Day", slug: "mothers-day", description: "For the person who made everything feel like home." },
  { id: "occ-romantic", name: "Romantic", slug: "romantic", description: "Quiet gestures, unmistakable feeling." },
  { id: "occ-corporate", name: "Corporate", slug: "corporate", description: "Polished flowers for desks, launches, and teams." },
  { id: "occ-condolence", name: "Condolence", slug: "condolence", description: "Gentle arrangements to express sympathy." },
  { id: "occ-pooja", name: "Pooja & Festivals", slug: "pooja-festivals", description: "Traditional flowers for daily worship and festivals." },
  { id: "occ-congratulations", name: "Congratulations", slug: "congratulations", description: "Mark a milestone or achievement." },
  { id: "occ-get-well", name: "Get Well Soon", slug: "get-well-soon", description: "Cheerful blooms for a speedy recovery." },
  { id: "occ-just-because", name: "Just Because", slug: "just-because", description: "No occasion needed." },
];
