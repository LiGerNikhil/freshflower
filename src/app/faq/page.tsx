import type { Metadata } from "next";
import { faqs } from "@/lib/data";
import type { FAQ } from "@/lib/data/faqs";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { canonical, faqLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ | FreshFlower.zone",
  description:
    "Answers about flower freshness, delivery areas, timing, pricing, booking, Porter charges, cancellation, wholesale orders, and wedding planning.",
  alternates: { canonical: canonical("/faq") },
  openGraph: {
    title: "FAQ | FreshFlower.zone",
    description:
      "Answers about flower freshness, delivery areas, timing, pricing, booking, Porter charges, and wedding planning.",
    url: canonical("/faq"),
    type: "website",
  },
};

export default function FAQRoute() {
  const categories = Array.from(
    new Set(faqs.map((f) => f.category ?? "General")),
  );

  return (
    <main className="bg-ivory">
      <JsonLd data={faqLd(faqs)} />
      <EditorialHeader
        eyebrow="Need to know"
        title="Answers before you order."
        copy="A clear answer is part of a good delivery. Here is what to expect from FreshFlower.zone."
      />
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-10 md:py-24">
        {/* Category filter tabs (client-side) */}
        <FAQPageInner faqs={faqs} categories={categories} />
      </section>
    </main>
  );
}

function FAQPageInner({
  faqs: allFaqs,
  categories,
}: {
  faqs: FAQ[];
  categories: string[];
}) {
  return (
    <div>
      {categories.map((cat) => {
        const items = allFaqs.filter(
          (f) => (f.category ?? "General") === cat,
        );
        if (items.length === 0) return null;
        return (
          <div key={cat} className="mb-12 last:mb-0">
            <h2 className="mb-2 font-display text-3xl text-ink">{cat}</h2>
            <div className="border-t border-ink/10">
              <FAQAccordion items={items} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
