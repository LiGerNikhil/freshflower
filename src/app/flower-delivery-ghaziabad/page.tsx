import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { SeoLandingPage } from "@/components/sections/SeoLandingPage";
import { getFlowers } from "@/lib/db/repositories";
import { citySeoPages } from "@/lib/data/seoPages";
import { baseCatalogState, pickFlowersOrdered } from "@/lib/catalog";
import { buildBreadcrumb, canonical, faqLd } from "@/lib/seo";

const page = citySeoPages.find((item) => item.slug === "ghaziabad")!;

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

export default async function FlowerDeliveryGhaziabadPage() {
  const flowers = await getFlowers();
  const cityFlowers = pickFlowersOrdered(flowers, page.flowerIds);
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Home", href: "/" },
            { name: "Flower delivery", href: "/delivery" },
            { name: "Ghaziabad", href: page.route },
          ]),
          faqLd(page.faqs),
        ]}
      />
      <SeoLandingPage
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        highlights={page.highlights}
        areas={page.areas}
        flowers={cityFlowers}
        initialState={baseCatalogState()}
        productLabel={`Popular flowers in ${page.city}`}
        faqs={page.faqs}
        tone={page.tone}
        nearby={page.nearby}
      />
    </>
  );
}