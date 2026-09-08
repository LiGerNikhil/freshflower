import type {
  ContactEnquiry,
  WeddingEnquiry,
  WholesaleEnquiry,
} from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
export const wholesaleEnquiries: WholesaleEnquiry[] = [
  {
    id: "weq-2001",
    businessName: "The Ivory Hotel, Saket",
    contactName: "Nikhil Arora",
    phone: "+91 98111 10101",
    email: "nikhil@ivoryhotel.example",
    monthlyVolumeEstimate: "10,000+ stems",
    message:
      "We need a reliable daily rose and lily supply for lobby arrangements and guest suites.",
    createdAt: "2026-09-07T16:20:00.000Z",
    status: "new",
  },
  {
    id: "weq-2002",
    businessName: "Café Bouquet, Hauz Khas",
    contactName: "Tara Iyer",
    phone: "+91 98222 20202",
    email: "tara@cafebouquet.example",
    monthlyVolumeEstimate: "1,000–2,000 stems",
    message:
      "Weekly table flowers for a 40-seat café, plus seasonal window displays.",
    createdAt: "2026-09-05T11:05:00.000Z",
    status: "contacted",
  },
  {
    id: "weq-2003",
    businessName: "Bloom & Co. Florists, Gurgaon",
    contactName: "Dev Malhotra",
    phone: "+91 98333 30303",
    email: "dev@bloomandco.example",
    monthlyVolumeEstimate: "5,000+ stems",
    message: "Wholesale sourcing for our retail counter — mixed bunches weekly.",
    createdAt: "2026-08-28T09:40:00.000Z",
    status: "closed",
  },
];

export const weddingEnquiries: WeddingEnquiry[] = [
  {
    id: "weq-3001",
    clientName: "Ishita & Arjun",
    phone: "+91 98444 40404",
    email: "ishita.arjun.events@example.com",
    eventDate: "2026-11-14",
    venue: "The Leela Palace, Chanakyapuri",
    guestCount: 400,
    budgetRange: "₹6–8L",
    message:
      "Full mandap, aisle, stage, and reception floral decor. We'd love a site visit.",
    createdAt: "2026-09-08T08:15:00.000Z",
    status: "new",
  },
  {
    id: "weq-3002",
    clientName: "Meghna Bose",
    phone: "+91 98555 50505",
    email: "meghna.bose@example.com",
    eventDate: "2026-12-05",
    venue: "Farmhouse, Chattarpur",
    guestCount: 180,
    budgetRange: "₹3–4L",
    message: "Intimate garden wedding — table florals and a simple arch.",
    createdAt: "2026-09-06T13:25:00.000Z",
    status: "new",
  },
  {
    id: "weq-3003",
    clientName: "The Mehta Family",
    phone: "+91 98666 60606",
    email: "mehta.family@example.com",
    eventDate: "2027-01-20",
    venue: "ITC Maurya, Chanakyapuri",
    guestCount: 600,
    budgetRange: "₹10L+",
    message: "Three-day event — sangeet, wedding, reception. Coordinated team needed.",
    createdAt: "2026-08-30T10:00:00.000Z",
    status: "contacted",
  },
];

export const contactEnquiries: ContactEnquiry[] = [
  {
    id: "ceq-4001",
    name: "Ritika Jain",
    phone: "+91 98777 70707",
    email: "ritika.jain@example.com",
    subject: "Custom colour for a proposal",
    message:
      "I want a custom cream-and-peach arrangement next Saturday — can you match a dress swatch?",
    createdAt: "2026-09-08T09:50:00.000Z",
    status: "new",
  },
  {
    id: "ceq-4002",
    name: "Farhan Qureshi",
    phone: "+91 98888 80808",
    email: "farhan.q@example.com",
    subject: "Same-day delivery timing",
    message:
      "Do you still have a 5–7 AM express slot open tomorrow for South Extension?",
    createdAt: "2026-09-06T18:30:00.000Z",
    status: "new",
  },
  {
    id: "ceq-4003",
    name: "Lakshmi Iyer",
    phone: "+91 98999 90909",
    email: "lakshmi.iyer@example.com",
    subject: "Corporate monthly subscription",
    message:
      "Monthly desk florals for our Noida office — 15 locations. Please share options.",
    createdAt: "2026-08-27T12:10:00.000Z",
    status: "responded",
  },
];