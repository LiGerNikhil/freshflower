import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilteredFlowerCollection } from "@/components/sections/FilteredFlowerCollection";
import { JsonLd } from "@/components/ui/JsonLd";
import { flowers, occasions } from "@/lib/data";
import { parseList, type CatalogState } from "@/lib/catalog";
import { buildBreadcrumb, canonical, openGraphImage } from "@/lib/seo";

interface OccasionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
const copy: Record<string, string> = {
  birthday:
    "Make the day feel unmistakably theirs with colour, fragrance, and a bunch that arrives before the candles are out. These are bright flowers for generous celebrations.",
  anniversary:
    "For another year, another chapter, and the quiet joy of choosing each other again. Find romantic stems and arrangements that say more than a message can.",
  wedding:
    "From intimate tables to the big yes, wedding flowers should feel like part of the story. Browse graceful stems for ceremonies, gifting, and the days around them.",
  "valentines-day":
    "Skip the predictable and choose something with presence. Our Valentine's edit pairs romantic colour with the ease of a beautifully timed Delhi NCR delivery.",
  "mothers-day":
    "For the person who made ordinary days feel cared for, choose flowers with warmth, fragrance, and a little lasting beauty.",
  romantic:
    "Some gestures are better when they arrive quietly. These flowers are for the note left on the table, the unexpected visit, and every version of I was thinking of you.",
  "get-well-soon":
    "A room feels lighter with something living in it. Send cheerful, easy-to-love blooms to make recovery days feel less ordinary.",
  congratulations:
    "Mark the new job, new home, new beginning, or hard-won milestone with flowers that look as happy as the news feels.",
  "pooja-festivals":
    "Fragrant, traditional blooms for rituals, festivals, and the small daily ceremonies that make a home feel rooted.",
  corporate:
    "Polished flowers for reception desks, client gifting, launches, and teams worth thanking. Considered arrangements, delivered on a dependable schedule.",
};
function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function stateFromParams(
  params: Record<string, string | string[] | undefined>,
  occasionId: string,
): CatalogState {
  const sortValue = first(params.sort);
  const sort = ["popular", "price-asc", "price-desc", "new"].includes(
    sortValue ?? "",
  )
    ? (sortValue as CatalogState["sort"])
    : "popular";
  const min = Math.max(0, Number(first(params.min)) || 0);
  const max = Math.min(3000, Number(first(params.max)) || 3000);
  return {
    query: first(params.q) ?? "",
    categoryIds: parseList(params.category),
    sort,
    availability: parseList(
      params.availability,
    ) as CatalogState["availability"],
    occasionIds: [occasionId],
    minPrice: Math.min(min, max - 50),
    maxPrice: Math.max(max, min + 50),
    units: parseList(params.unit) as CatalogState["units"],
    page: Math.max(1, Number(first(params.page)) || 1),
  };
}
export function generateStaticParams() {
  return occasions.map((occasion) => ({ slug: occasion.slug }));
}
export async function generateMetadata({
  params,
}: OccasionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const occasion = occasions.find((item) => item.slug === slug);
  if (!occasion) {
    return {
      title: "Occasion not found | FreshFlower.zone",
      description: "Find flowers for every occasion.",
    };
  }
  const url = canonical(`/occasions/${occasion.slug}`);
  const description = copy[slug] ?? occasion.description;
  return {
    title: `${occasion.name} flowers | FreshFlower.zone`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${occasion.name} flowers | FreshFlower.zone`,
      description,
      url,
      type: "website",
      images: openGraphImage(),
    },
  };
}
export default async function OccasionPage({
  params,
  searchParams,
}: OccasionPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const occasion = occasions.find((item) => item.slug === slug);
  if (!occasion) notFound();
  const occasionFlowers = flowers.filter((flower) =>
    flower.occasionIds.includes(occasion.id),
  );
  const breadcrumb = buildBreadcrumb([
    { name: "Home", href: "/" },
    { name: "Occasions & gifting", href: "/occasions" },
    { name: occasion.name, href: `/occasions/${occasion.slug}` },
  ]);
  return (
    <main className="bg-ivory">
      <JsonLd data={breadcrumb} />
      <section className="bg-lavender px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lavender-ink">
            Flowers by occasion
          </p>
          <h1 className="text-5xl md:text-7xl">{occasion.name}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft">
            {copy[slug] ?? occasion.description}
          </p>
        </div>
      </section>
      <FilteredFlowerCollection
        flowers={occasionFlowers}
        initialState={stateFromParams(query, occasion.id)}
      />
    </main>
  );
}
