export const SITE_URL = "https://freshflower.zone";

export function canonical(path = "") {
  return new URL(path, SITE_URL).toString();
}

export function openGraphImage() {
  return [{ url: new URL("/og/default.png", SITE_URL).toString(), width: 1200, height: 630, alt: "FreshFlower.zone — premium flowers in Delhi NCR" }];
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

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "FreshFlower.zone",
      url: SITE_URL,
      telephone: "+91-99999-99999",
      email: "hello@freshflower.zone",
      address: {
        "@type": "PostalAddress",
        addressLocality: "New Delhi",
        addressRegion: "Delhi",
        postalCode: "110001",
        addressCountry: "IN",
      },
      sameAs: [],
    },
    {
      "@type": "Florist",
      "@id": `${SITE_URL}/#florist`,
      name: "FreshFlower.zone",
      url: SITE_URL,
      telephone: "+91-99999-99999",
      email: "hello@freshflower.zone",
      priceRange: "₹₹",
      image: new URL("/og/default.png", SITE_URL).toString(),
      address: {
        "@type": "PostalAddress",
        addressLocality: "New Delhi",
        addressRegion: "Delhi",
        postalCode: "110001",
        addressCountry: "IN",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "06:00",
          closes: "20:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Sunday",
          opens: "07:00",
          closes: "14:00",
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
    },
  ],
};