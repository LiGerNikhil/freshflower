import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { SeoLandingPage } from "@/components/sections/SeoLandingPage";
import { flowers } from "@/lib/data";
import { citySeoPages } from "@/lib/data/seoPages";
import { baseCatalogState, pickFlowersOrdered } from "@/lib/catalog";
import { buildBreadcrumb, canonical, faqLd } from "@/lib/seo";

const page = citySeoPages.find((item) => item.slug === "greater-noida")!;

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

export default function FlowerDeliveryGreaterNoidaPage() {
  const cityFlowers = pickFlowersOrdered(flowers, page.flowerIds);
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Home", href: "/" },
            { name: "Flower delivery", href: "/delivery" },
            { name: "Greater Noida", href: page.route },
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