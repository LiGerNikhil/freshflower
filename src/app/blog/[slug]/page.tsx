import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Feather } from "lucide-react";
import { ArtCover } from "@/components/sections/ArtCover";
import { ShareButtons } from "@/components/sections/ShareButtons";
import { JsonLd } from "@/components/ui/JsonLd";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/db/repositories";
import { formatPostDate, readingMinutes, relatedPosts } from "@/lib/blog";
import { buildBreadcrumb, canonical, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found | FreshFlower.zone" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: canonical(`/blog/${post.slug}`) },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonical(`/blog/${post.slug}`),
      siteName: "FreshFlower.zone",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const blogs = await getBlogPosts();
  const related = relatedPosts(blogs, post);

  const postingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${SITE_URL}/blog/${post.slug}/cover`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: post.author, url: SITE_URL },
    publisher: { "@type": "Organization", name: "FreshFlower.zone", url: SITE_URL },
    mainEntityOfPage: canonical(`/blog/${post.slug}`),
  };

  return (
    <main className="bg-ivory">
      <JsonLd
        data={[
          postingLd,
          buildBreadcrumb([
            { name: "Home", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: post.title, href: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 pt-10 md:px-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden="true" /> All posts
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          {post.category} · {post.author}
        </p>
        <h1 className="mt-3 text-4xl leading-tight md:text-6xl">{post.title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            {formatPostDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden="true" />
            {readingMinutes(post)} min read
          </span>
          <ShareButtons
            title={post.title}
            url={canonical(`/blog/${post.slug}`)}
          />
        </div>
      </section>

      <ArtCover
        token={post.coverImage}
        name={post.title}
        size={140}
        className="mx-auto mt-10 aspect-[2/1] max-w-5xl md:rounded-xl"
      />

      <article className="mx-auto max-w-3xl px-5 py-14 md:px-10">
        <p className="text-lg font-medium leading-8 text-ink">{post.content}</p>
        <div className="mt-10 space-y-10">
          {post.sections.map((section, index) => (
            <section key={section.heading ?? index}>
              {section.heading && (
                <h2 className="text-3xl">{section.heading}</h2>
              )}
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-[15px] leading-8 text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-5 grid gap-3">
                  {section.bullets.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg bg-white/70 p-4 text-sm leading-6 text-ink"
                    >
                      <Feather
                        size={15}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-gold"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-ivory-deep px-5 py-16 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-ink">
              Keep reading
            </p>
            <h2 className="mt-2 text-3xl">Related posts</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-xl bg-white/70 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <ArtCover
                    token={item.coverImage}
                    name={item.title}
                    size={64}
                    className="aspect-[16/9] w-full"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sage-ink">
                      {item.category}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug text-ink transition group-hover:text-gold">
                      {item.title}
                    </h3>
                    <p className="mt-auto pt-4 text-xs text-ink-soft">
                      {formatPostDate(item.publishedAt)} ·{" "}
                      {readingMinutes(item)} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}