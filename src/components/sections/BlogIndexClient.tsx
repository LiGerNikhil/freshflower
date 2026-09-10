"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Search } from "lucide-react";
import { ArtCover } from "@/components/sections/ArtCover";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { formatPostDate, readingMinutes } from "@/lib/blog";
import type { BlogPost } from "@/lib/types";

export function BlogIndexClient({
  initialTag,
  initialCategory = "All",
}: {
  initialTag?: string;
  initialCategory?: string;
}) {
  // The CMS store (seeded with the same posts as the server page, so SSR is
  // hydration-safe) is the single source of truth; drafts stay hidden and
  // posts published from /admin/blog appear here immediately.
  const { blogPosts } = useSiteContent();

  const posts = useMemo<BlogPost[]>(
    () =>
      [...blogPosts]
        .filter((post) => post.status !== "draft")
        .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)),
    [blogPosts],
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category))).sort()],
    [posts],
  );
  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts],
  );

  const [category, setCategory] = useState(() =>
    categories.includes(initialCategory ?? "All") ? (initialCategory ?? "All") : "All",
  );
  const [tag, setTag] = useState<string | null>(() =>
    initialTag && tags.includes(initialTag) ? initialTag : null,
  );
  const [query, setQuery] = useState("");

  const filtered = posts.filter((post) => {
    const matchesCategory = category === "All" || post.category === category;
    const matchesTag = !tag || post.tags.includes(tag);
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      post.title.toLowerCase().includes(needle) ||
      post.excerpt.toLowerCase().includes(needle) ||
      post.tags.some((t) => t.includes(needle));
    return matchesCategory && matchesTag && matchesQuery;
  });

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  category === cat
                    ? "bg-ink text-ivory"
                    : "bg-white/70 text-ink-soft hover:bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="relative flex items-center">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 text-ink-soft"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts"
              className="w-full rounded-full border border-ink/10 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-gold md:w-56"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTag(tag === item ? null : item)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                tag === item
                  ? "border-gold bg-gold-soft/30 text-ink"
                  : "border-ink/10 text-ink-soft hover:border-gold/60"
              }`}
            >
              #{item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <p className="text-4xl">No posts found</p>
          <p className="mt-3 text-sm text-ink-soft">
            Try a different category, tag, or search term.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("All");
              setTag(null);
              setQuery("");
            }}
            className="mt-6 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-ivory"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-2 md:px-10 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-xl bg-white/70 transition hover:-translate-y-1 hover:shadow-md"
            >
              <ArtCover
                token={post.coverImage}
                name={post.title}
                size={96}
                className="aspect-[16/9] w-full"
              />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-sage-ink">
                  <span>{post.category}</span>
                  <span className="text-ink/10">·</span>
                  <span className="flex items-center gap-1 normal-case tracking-normal text-ink-soft">
                    <CalendarDays size={11} aria-hidden="true" />
                    {formatPostDate(post.publishedAt)}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl leading-snug text-ink transition group-hover:text-gold">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <p className="flex items-center gap-1 text-xs text-ink-soft">
                    <Clock3 size={12} aria-hidden="true" />
                    {readingMinutes(post)} min read
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                    Read more
                    <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}