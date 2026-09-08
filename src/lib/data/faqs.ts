export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const faqs: FAQ[] = [
  // ── Delivery ──
  {
    id: "faq-delivery",
    question: "When can I get my flowers delivered?",
    answer: "Choose a morning slot between 5 AM and 12 PM or a later same-day slot at checkout. We currently deliver across Delhi NCR — South Extension, Connaught Place, Vasant Kunj, Dwarka, Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad.",
    category: "Delivery",
  },
  {
    id: "faq-morning-delivery",
    question: "What is Morning Express delivery?",
    answer: "Morning Express is our earliest delivery window, typically 5 AM – 7 AM. It is ideal for surprises, puja preparations, and office flowers that need to be in place before the workday starts. Morning Express slots are limited and subject to availability in your area.",
    category: "Delivery",
  },
  {
    id: "faq-same-day",
    question: "Can I get same-day delivery?",
    answer: "Yes, subject to slot availability. Order as early as possible — our morning slots fill up quickly. Same-day delivery depends on the flower, your delivery area, the date, and open slot capacity. If a slot is full, we will show the next available option.",
    category: "Delivery",
  },
  {
    id: "faq-cutoff",
    question: "What is the order cutoff time?",
    answer: "For same-day morning delivery, order before the available slots fill up. For next-day delivery, you can book up to the evening before. Large or wedding orders should be placed at least 3–5 days in advance so we can source the right stems.",
    category: "Delivery",
  },
  {
    id: "faq-delivery-areas",
    question: "Which areas in Delhi NCR do you deliver to?",
    answer: "We serve South Extension, Connaught Place, Vasant Kunj, Dwarka, Gurgaon (DLF Phase 1–5), Noida (Sector 15–62), Greater Noida, Ghaziabad, and Faridabad. We are actively expanding — contact us if your area is not listed and we will try to accommodate your order.",
    category: "Delivery",
  },
  {
    id: "faq-delivery-charges",
    question: "What do delivery charges cost?",
    answer: "Flower prices are shown on each product. Delivery charges vary by area — from ₹99 for nearby locations like South Extension and Connaught Place to ₹149 for Gurgaon and Noida. The exact fee is confirmed at checkout based on your address.",
    category: "Delivery",
  },
  // ── Porter ──
  {
    id: "faq-porter",
    question: "Who pays the Porter charge?",
    answer: "Porter charges are payable by the customer at delivery. The amount is separate from the flower total and can vary based on distance, time of day, demand, and vehicle availability. We use Porter for reliable last-mile delivery across all our service areas.",
    category: "Delivery",
  },
  {
    id: "faq-porter-amount",
    question: "How much is the Porter charge typically?",
    answer: "Porter charges depend on the distance between our preparation point and your delivery address, plus demand and time-of-day factors. They typically range from ₹50–₹200 for standard deliveries. You will pay the Porter rider directly at the time of delivery.",
    category: "Delivery",
  },
  // ── Freshness & Quality ──
  {
    id: "faq-freshness",
    question: "How fresh are the flowers?",
    answer: "Every order is prepared close to dispatch from flowers sourced for the day. We work with trusted growers and market partners to select stems for freshness, colour, and the way they will open over the days ahead. We include simple care guidance so your blooms last longer.",
    category: "Freshness & Quality",
  },
  {
    id: "faq-care",
    question: "How should I care for my flowers after delivery?",
    answer: "Trim the stems at a 45-degree angle, place them in clean water, and change the water every 2 days. Keep flowers away from direct sunlight, fans, and ripening fruit (which releases ethylene gas). Each order includes a care card with specific tips for your flower variety.",
    category: "Freshness & Quality",
  },
  {
    id: "faq-availability",
    question: "Why is a flower marked pre-order?",
    answer: "Pre-order means the flower is not part of today's ready stock. It may be a seasonal variety that needs to be sourced specifically for your date. We will confirm the best sourcing and delivery timeline with you after you place the enquiry.",
    category: "Freshness & Quality",
  },
  // ── Pricing & Payment ──
  {
    id: "faq-payment",
    question: "Can I pay online and at delivery?",
    answer: "This preview supports the complete ordering flow with payment integration to be connected in the next phase. In the final version, you will be able to pay online via UPI, cards, or net banking, or choose cash-on-delivery where available.",
    category: "Pricing & Payment",
  },
  {
    id: "faq-pricing",
    question: "How are flower prices determined?",
    answer: "Prices reflect the variety, stem count, seasonality, and sourcing effort. Seasonal flowers like roses and marigolds are priced lower, while imported or rare varieties like orchids command a premium. All prices are inclusive of preparation and wrapping — delivery charges are shown separately.",
    category: "Pricing & Payment",
  },
  {
    id: "faq-coupons",
    question: "Do you offer discounts or coupon codes?",
    answer: "We occasionally run promotional offers and coupon codes. Check the homepage or your email for current deals. You can apply a coupon code at checkout — the discount will be reflected in your order total before payment.",
    category: "Pricing & Payment",
  },
  // ── Booking & Orders ──
  {
    id: "faq-booking",
    question: "How far ahead can I book?",
    answer: "Choose an available date and slot during checkout. For same-day and next-day orders, book as early as possible. For weddings, corporate events, and recurring requirements, contact us at least 3–5 days in advance so we can plan the right supply.",
    category: "Booking & Orders",
  },
  {
    id: "faq-custom",
    question: "Can you make a custom bouquet or wholesale order?",
    answer: "Absolutely. Visit our Wholesale page or Wedding & Events page to describe what you need — flower types, colours, quantities, occasion, and delivery details. We will come back with a tailored quote within 24 hours.",
    category: "Booking & Orders",
  },
  {
    id: "faq-cancellation",
    question: "Can I cancel or modify my order?",
    answer: "Please contact us as soon as possible. If the flowers have not yet entered preparation or dispatch, we will cancel or modify the order and arrange any applicable refund. Same-day orders have a shorter window — call us directly for the fastest help.",
    category: "Booking & Orders",
  },
  {
    id: "faq-track",
    question: "How do I track my order?",
    answer: "After placing an order, you will receive updates via WhatsApp or SMS at each stage — confirmed, preparing, out for delivery, and delivered. For any concerns, reach out to us on WhatsApp or call during business hours.",
    category: "Booking & Orders",
  },
  // ── Wholesale ──
  {
    id: "faq-wholesale",
    question: "Do you support recurring wholesale supply?",
    answer: "Yes. Hotels, restaurants, decorators, florists, offices, and venues can request a recurring or event-specific quote. We offer flexible scheduling — daily, weekly, or on-demand — with dedicated account support for regular clients.",
    category: "Wholesale",
  },
  {
    id: "faq-wholesale-min",
    question: "Is there a minimum order for wholesale?",
    answer: "Minimums depend on the flower variety and delivery logistics. For regular supply arrangements, we typically start from 50 stems or 10 bunches. For one-time events, smaller quantities may be possible. Fill in the wholesale enquiry form and we will advise on the best options.",
    category: "Wholesale",
  },
  {
    id: "faq-wholesale-pricing",
    question: "How does wholesale pricing work?",
    answer: "Wholesale pricing is volume-based — the more you order, the better the per-stem rate. Pricing depends on variety, seasonality, and delivery frequency. We provide transparent quotes with no hidden charges. Porter charges for wholesale deliveries are confirmed upfront.",
    category: "Wholesale",
  },
  {
    id: "faq-corporate",
    question: "Do you handle corporate gifting and office flowers?",
    answer: "Yes. We work with companies for regular office flower arrangements, festive gifting (Diwali, Christmas, New Year), and event florals. We can set up recurring weekly deliveries or create custom gift boxes for clients and employees.",
    category: "Wholesale",
  },
  // ── Wedding & Events ──
  {
    id: "faq-wedding",
    question: "How do I plan flowers for my wedding?",
    answer: "Start by visiting our Wedding & Events page and filling in the quote request form with your date, venue, guest count, and any vision or palette ideas. We will schedule a consultation to discuss the mandap, stage, aisle, bridal bouquet, table arrangements, and everything in between.",
    category: "Wedding & Events",
  },
  {
    id: "faq-wedding-budget",
    question: "What is the typical budget for wedding flowers?",
    answer: "Wedding floral budgets vary widely based on scale, venue, and flower choices. A intimate celebration might start from ₹15,000–₹25,000, while a grand multi-day wedding can go significantly higher. We work within your budget to create the maximum impact.",
    category: "Wedding & Events",
  },
  {
    id: "faq-wedding-timeline",
    question: "How early should I book wedding flowers?",
    answer: "We recommend booking at least 2–4 weeks before the event for small weddings, and 4–8 weeks for large celebrations with elaborate installations. Peak wedding season (October–March) fills up quickly, so earlier is always better.",
    category: "Wedding & Events",
  },
];
