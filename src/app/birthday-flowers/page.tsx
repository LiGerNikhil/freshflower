import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { SeoLandingPage } from "@/components/sections/SeoLandingPage";
import { flowers, occasions } from "@/lib/data";
import { occasionSeoPages } from "@/lib/data/seoPages";
import { baseCatalogState } from "@/lib/catalog";
import { buildBreadcrumb, canonical, faqLd } from "@/lib/seo";

const page = occasionSeoPages.find((item) => item.slug === "birthday")!;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: { canonical: canonical(page.route) },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    url: canonical(page.route),
    type: "website",
  },
};

export default function BirthdayFlowersPage() {
  const birthday = occasions.find((item) => item.id === page.occasionId);
  const birthdayFlowers = birthday
    ? flowers.filter((flower) => flower.occasionIds.includes(birthday.id))
    : flowers;
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Home", href: "/" },
            { name: "Occasions", href: "/occasions" },
            { name: "Birthday flowers", href: page.route },
          ]),
          faqLd(page.faqs),
        ]}
      />
      <SeoLandingPage
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        highlights={page.highlights}
        flowers={birthdayFlowers}
        initialState={baseCatalogState({ occasionIds: [page.occasionId] })}
        productLabel="Birthday favourites"
        faqs={page.faqs}
        tone={page.tone}
        nearby={page.nearby}
      />
    </>
  );
}