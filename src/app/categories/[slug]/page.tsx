import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilteredFlowerCollection } from "@/components/sections/FilteredFlowerCollection";
import { JsonLd } from "@/components/ui/JsonLd";
import { getCategoryBySlug, getCategories, getFlowers } from "@/lib/db/repositories";
import { parseList, type CatalogState } from "@/lib/catalog";
import { buildBreadcrumb, canonical, openGraphImage } from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const copy: Record<string, string> = {
  roses:
    "Our rose collection moves from classic red romance to quiet ivory elegance, with premium stems selected for generous heads and a vase life worth lingering over.",
  gerbera:
    "Bright, open-faced gerberas bring an instant lift to a room. Choose a cheerful mix for birthdays, thank-yous, or a colour-first morning at home.",
  mogra:
    "Mogra is the scent of Delhi mornings: soft, unmistakable, and woven into everyday rituals. Our fresh gajras arrive ready for pooja, gifting, or a beautiful pause.",
  sunflower:
    "Sunflowers do the talking before anyone else enters the room. These radiant bunches are wrapped simply, so their warmth and scale stay centre stage.",
  carnations:
    "Ruffled, long-lasting carnations bring texture without fuss. Discover soft pastels and deep reds that hold their shape beautifully through a week of ordinary days.",
  orchid:
    "Architectural and quietly luxurious, our orchids make a lasting impression. They are considered gifts for desks, homes, milestones, and the people who have everything.",
  lily: "Fragrant lilies open gradually, making a bunch feel new for several mornings. Find graceful stems for anniversaries, congratulations, and rooms that need a little light.",
  rajnigandha:
    "Rajnigandha carries a familiar Indian fragrance with an effortless elegance. A traditional favourite for homes, festivities, and generous everyday gestures.",
  "babys-breath":
    "Airy baby's breath softens a room with almost no visual weight. Keep it simple in a vase or pair it with a bolder bloom for a cloud-like arrangement.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function stateFromParams(
  params: Record<string, string | string[] | undefined>,
  categoryId: string,
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
    categoryIds: [categoryId],
    sort,
    availability: parseList(
      params.availability,
    ) as CatalogState["availability"],
    occasionIds: parseList(params.occasion),
    minPrice: Math.min(min, max - 50),
    maxPrice: Math.max(max, min + 50),
    units: parseList(params.unit) as CatalogState["units"],
    page: Math.max(1, Number(first(params.page)) || 1),
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return {
      title: "Category not found | FreshFlower.zone",
      description: "Explore FreshFlower.zone categories.",
    };
  }
  const url = canonical(`/categories/${category.slug}`);
  const description = copy[slug] ?? category.description;
  return {
    title: `${category.name} flowers | FreshFlower.zone`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${category.name} flowers | FreshFlower.zone`,
      description,
      url,
      type: "website",
      images: openGraphImage(),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const categories = await getCategories();
  const flowers = await getFlowers();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const categoryFlowers = flowers.filter(
    (flower) => flower.categoryId === category.id,
  );
  const breadcrumb = buildBreadcrumb([
    { name: "Home", href: "/" },
    { name: "Flower varieties", href: "/categories" },
    { name: category.name, href: `/categories/${category.slug}` },
  ]);
  return (
    <main className="bg-ivory">
      <JsonLd data={breadcrumb} />
      <section className="bg-ivory-deep px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            Flower category
          </p>
          <h1 className="text-5xl md:text-7xl">{category.name}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft">
            {copy[slug] ?? category.description}
          </p>
        </div>
      </section>
      <FilteredFlowerCollection
        flowers={categoryFlowers}
        initialState={stateFromParams(query, category.id)}
      />
    </main>
  );
}
