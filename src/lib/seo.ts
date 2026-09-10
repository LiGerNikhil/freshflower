export const SITE_URL = "https://freshflower.zone";

/** Canonical public Instagram profile (no tracking params). */
export const INSTAGRAM_URL = "https://www.instagram.com/freshflower.zone/";
/** Google Maps listing share link (office: Ghazipur Flower Market). */
export const GOOGLE_MAPS_URL = "https://share.google/DyRUEeYiTtzBUQCWm";

export const DEFAULT_KEYWORDS = [
  "flower delivery Delhi NCR",
  "flower delivery Delhi",
  "bouquet delivery Gurgaon Noida",
  "order flowers online Delhi",
  "same day flower delivery Delhi",
  "wedding flowers Delhi NCR",
  "wholesale flowers Delhi",
  "flower market Ghazipur",
  "freshflowers delivery Delhi NCR",
].join(", ");

export function canonical(path = "") {
  return new URL(path, SITE_URL).toString();
}

export function openGraphImage() {
  return [
    {
      url: new URL("/opengraph-image", SITE_URL).toString(),
      width: 1200,
      height: 630,
      alt: "FreshFlower.zone — premium flowers in Delhi NCR",
    },
  ];
}

export function buildBreadcrumb(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function faqLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "FreshFlower.zone",
  alternateName: "FreshFlower",
  url: SITE_URL,
  logo: new URL("/og/default.png", SITE_URL).toString(),
  image: new URL("/opengraph-image", SITE_URL).toString(),
  telephone: "+91-85069-51873",
  email: "hello@freshflower.zone",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Flower Market, Ghazipur Village, Ghazipur",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110096",
    addressCountry: "IN",
  },
  sameAs: [INSTAGRAM_URL, GOOGLE_MAPS_URL],
};

const FLORIST = {
  "@type": "Florist",
  "@id": `${SITE_URL}/#florist`,
  name: "FreshFlower.zone",
  url: SITE_URL,
  telephone: "+91-85069-51873",
  email: "hello@freshflower.zone",
  priceRange: "₹₹–₹₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
  description:
    "FreshFlower.zone — premium flower delivery in Delhi NCR. Bouquets, puja flowers, gifting, wedding and wholesale floral design with morning and same-day delivery windows.",
  image: new URL("/opengraph-image", SITE_URL).toString(),
  address: {
    "@type": "PostalAddress",
    streetAddress: "Flower Market, Ghazipur Village, Ghazipur",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110096",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "06:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "06:00",
      closes: "20:00",
    },
  ],
  areaServed: [
    "South Extension",
    "Connaught Place",
    "Vasant Kunj",
    "Dwarka",
    "Gurgaon",
    "Noida",
    "Greater Noida",
    "Ghaziabad",
    "Faridabad",
  ],
};

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@graph": [
    ORGANIZATION,
    FLORIST,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "FreshFlower.zone",
      inLanguage: "en-IN",
      description:
        "Premium flower delivery, bouquets, and floral design across Delhi NCR — morning and same-day slots, gifting, weddings, and wholesale.",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};