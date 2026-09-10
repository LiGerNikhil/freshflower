import type { Metadata } from "next";
import { BlogIndexClient } from "@/components/sections/BlogIndexClient";
import { EditorialHeader } from "@/components/sections/ContentPages";
import { JsonLd } from "@/components/ui/JsonLd";
import { getBlogPosts } from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

interface BlogIndexPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Flower blog | FreshFlower.zone",
  description:
    "Guides, care tips, and stories about flowers in Delhi NCR — bouquet care, wedding decor, rose varieties, and morning delivery.",
  alternates: { canonical: canonical("/blog") },
  openGraph: {
    title: "FreshFlower.zone blog — care tips & guides",
    description:
      "Guides, care tips, and stories about flowers, delivery, and decor in Delhi NCR.",
    url: canonical("/blog"),
    type: "website",
  },
};
export const dynamic = "force-dynamic";

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  const blogs = await getBlogPosts();
  const query = await searchParams;
  const requestedTag = Array.isArray(query.tag) ? query.tag[0] : query.tag;
  const requestedCategory = Array.isArray(query.category)
    ? query.category[0]
    : query.category;

  const categories = Array.from(
    new Set(blogs.map((post) => post.category)),
  ).sort();

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FreshFlower.zone blog",
    url: canonical("/blog"),
    description:
      "Guides, care tips, and stories about flowers in Delhi NCR.",
    blogPost: blogs.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: canonical(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
      author: { "@type": "Organization", name: post.author },
    })),
  };

  return (
    <main className="bg-ivory">
      <JsonLd data={blogLd} />
      <EditorialHeader
        eyebrow="The journal"
        title="Flower stories, picked fresh."
        copy="Care tips, wedding decor ideas, delivery know-how, and the small traditions that make flowers feel like part of everyday life in Delhi NCR."
        video="/assets/video/bg2.mp4"
      />
      <div className="mx-auto max-w-7xl pb-8 md:pb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-10 md:px-10">
          <h2 className="text-3xl">Latest posts</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-ink">
            {blogs.length} posts · {categories.length} categories
          </p>
        </div>
      </div>
      <BlogIndexClient
        initialTag={requestedTag}
        initialCategory={requestedCategory}
      />
    </main>
  );
}