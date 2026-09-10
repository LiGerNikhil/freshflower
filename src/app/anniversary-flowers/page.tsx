import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { SeoLandingPage } from "@/components/sections/SeoLandingPage";
import { getFlowers, getOccasions } from "@/lib/db/repositories";
import { occasionSeoPages } from "@/lib/data/seoPages";
import { baseCatalogState } from "@/lib/catalog";
import { buildBreadcrumb, canonical, faqLd } from "@/lib/seo";

const page = occasionSeoPages.find((item) => item.slug === "anniversary")!;

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

export const dynamic = "force-dynamic";

export default async function AnniversaryFlowersPage() {
  const occasions = await getOccasions();
  const flowers = await getFlowers();
  const anniversary = occasions.find((item) => item.id === page.occasionId);
  const anniversaryFlowers = anniversary
    ? flowers.filter((flower) => flower.occasionIds.includes(anniversary.id))
    : flowers;
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Home", href: "/" },
            { name: "Occasions", href: "/occasions" },
            { name: "Anniversary flowers", href: page.route },
          ]),
          faqLd(page.faqs),
        ]}
      />
      <SeoLandingPage
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        highlights={page.highlights}
        flowers={anniversaryFlowers}
        initialState={baseCatalogState({ occasionIds: [page.occasionId] })}
        productLabel="Anniversary favourites"
        faqs={page.faqs}
        tone={page.tone}
        nearby={page.nearby}
      />
    </>
  );
}