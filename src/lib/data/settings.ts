import type { BusinessSettings } from "@/lib/types";

// PHASE 16 BUSINESS SETTINGS — single source of truth for contact/delivery
// details. Edited from /admin/settings; consumed by the floating WhatsApp
// button, site nav, footer, contact page and the cart/checkout Porter note.
export const DEFAULT_SETTINGS: BusinessSettings = {
  phoneNumber: "+91 85069 51873",
  whatsappNumber: "+91 85069 51873",
  email: "hello@freshflower.zone",
  addressLine: "Flower Market, Ghazipur Village, Ghazipur, New Delhi, Delhi 110096",
  businessHours: [
    { label: "Mon – Sat", value: "6:00 AM – 9:00 PM" },
    { label: "Sunday", value: "6:00 AM – 8:00 PM" },
  ],
  porterNote:
    "Orders are delivered by Porter. If you can't take the delivery, we'll contact you to pick a safe spot.",
  deliveryChargeNote: "Free delivery on orders above ₹599 · ₹49 flat otherwise",
  instagramHandle: "@freshflower.zone",
  instagramUrl: "https://www.instagram.com/freshflower.zone?stkn=MTJxZmQ1NDAxdGJwbw==",
};