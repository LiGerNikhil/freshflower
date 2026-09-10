"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FilePenLine,
  Plus,
  Search,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { formatPostDate } from "@/lib/blog";
import { slugify, GRADIENT_TOKENS } from "@/lib/utils";
import type { BlogPost, BlogSection } from "@/lib/types";

const BLOG_CATEGORIES = [
  "Guides",
  "Care Tips",
  "Weddings",
  "Delivery",
  "Tradition",
];
const COVER_TOKEN_KEYS = Object.keys(GRADIENT_TOKENS);

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export function BlogsManager() {
  const { blogPosts, deleteBlogPost } = useSiteContent();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts
      .filter((post) => {
        if (statusFilter === "draft" && post.status !== "draft") return false;
        if (statusFilter === "published" && post.status === "draft") return false;
        if (!q) return true;
        return (
          post.title.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }, [blogPosts, query, statusFilter]);

  const publishedCount = blogPosts.filter((post) => post.status !== "draft").length;
  const draftCount = blogPosts.filter((post) => post.status === "draft").length;

  const handleDelete = (post: BlogPost) => {
    if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      deleteBlogPost(post.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <BookOpen size={13} /> Blog / CMS
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Blog posts</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {blogPosts.length} posts · {publishedCount} published ·{" "}
            {draftCount} draft. Drafts stay hidden from the public blog.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Plus size={15} /> New post
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, category or author…"
            aria-label="Search posts"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
        {(["all", "published", "draft"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              statusFilter === filter
                ? "border-ink bg-ink text-ivory"
                : "border-ink/10 bg-white/70 text-ink-soft hover:border-gold/60"
            }`}
          >
            {filter === "all" ? "All" : filter === "published" ? "Published" : "Drafts"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <ul className="divide-y divide-ink/5">
          {filtered.map((post) => (
            <li key={post.id} className="flex items-center gap-4 p-4 hover:bg-ivory-deep/30">
              <AdminThumb token={post.coverImage} name={post.title} className="h-14 w-20 rounded-md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="font-semibold text-ink transition hover:text-gold"
                  >
                    {post.title}
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      post.status === "draft"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-sage text-sage-ink"
                    }`}
                  >
                    {post.status === "draft" ? "Draft" : "Published"}
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                  <span className="font-semibold text-ink-soft">{post.category}</span>
                  <span>by {post.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {formatPostDate(post.publishedAt)}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  aria-label={`Edit ${post.title}`}
                  className="rounded-md p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                >
                  <FilePenLine size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(post)}
                  aria-label={`Delete ${post.title}`}
                  className="rounded-md p-2 text-ink-soft transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-10 text-center text-sm text-ink-soft">
              No posts match your filters.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Create / edit form                                                          */
/* -------------------------------------------------------------------------- */

interface FormErrors {
  title?: string;
  slug?: string;
  category?: string;
  publishedAt?: string;
}

export function BlogForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const resolvedId = postId ?? params?.id;
  const { blogPosts, addBlogPost, updateBlogPost } = useSiteContent();

  const existing = useMemo(
    () => blogPosts.find((post) => post.id === resolvedId),
    [blogPosts, resolvedId],
  );

  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState(existing?.category ?? BLOG_CATEGORIES[0]);
  const [author, setAuthor] = useState(existing?.author ?? "FreshFlower.zone");
  const [status, setStatus] = useState<"draft" | "published">(
    existing?.status ?? "draft",
  );
  const [publishedAt, setPublishedAt] = useState(
    (existing?.publishedAt ?? new Date().toISOString()).slice(0, 10),
  );
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? COVER_TOKEN_KEYS[0]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [seoTitle, setSeoTitle] = useState(existing?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(existing?.metaDescription ?? "");
  const [keywords, setKeywords] = useState((existing?.keywords ?? []).join(", "));
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [sections, setSections] = useState<BlogSection[]>(
    existing?.sections ?? [],
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  if (resolvedId && !existing) {
    return (
      <div className="rounded-xl border border-ink/10 bg-white/80 p-10 text-center shadow-sm">
        <p className="font-display text-xl text-ink">Post not found.</p>
        <p className="mt-1 text-sm text-ink-soft">
          It may have been deleted in this session.
        </p>
        <Link
          href="/admin/blog"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-ivory hover:bg-ink-soft"
        >
          <ArrowLeft size={14} /> Back to posts
        </Link>
      </div>
    );
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required.";
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) next.slug = "A valid slug is required.";
    else if (
      blogPosts.some((post) => post.slug === finalSlug && post.id !== resolvedId)
    ) {
      next.slug = `Slug "${finalSlug}" is already in use.`;
    }
    if (!category.trim()) next.category = "Category is required.";
    if (!publishedAt) next.publishedAt = "Choose a publish date.";
    return next;
  };

  const updateSection = (index: number, patch: Partial<BlogSection>) => {
    setSections((current) =>
      current.map((section, i) => (i === index ? { ...section, ...patch } : section)),
    );
  };

  const uploadCoverFile = async (file: File | null) => {
    if (!file) return;
    setUploadingCover(true);
    setCoverError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Upload failed");
      }
      const { secureUrl } = (await res.json()) as { secureUrl: string };
      setCoverImage(secureUrl);
    } catch (err) {
      setCoverError(
        err instanceof Error ? err.message : "Something went wrong, please try again.",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    const parsed = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      category: category.trim(),
      author: author.trim() || "FreshFlower.zone",
      status,
      publishedAt: `${publishedAt}T00:00:00.000Z`,
      coverImage: coverImage.trim() || COVER_TOKEN_KEYS[0],
      excerpt: excerpt.trim(),
      content: content.trim(),
      seoTitle: seoTitle.trim(),
      metaDescription: metaDescription.trim(),
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sections: sections.map((section) => ({
        heading: section.heading?.trim() || undefined,
        paragraphs: section.paragraphs,
        bullets: section.bullets,
      })),
    };

    if (resolvedId) {
      updateBlogPost(resolvedId, parsed);
    } else {
      addBlogPost({
        id: `post-${Date.now().toString(36)}`,
        ...parsed,
      });
    }
    setSaved(true);
    window.setTimeout(() => router.push("/admin/blog"), 500);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <BookOpen size={13} /> Blog / CMS
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            {resolvedId ? "Edit post" : "New post"}
          </h1>
        </div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white/70 px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-gold hover:text-ink"
        >
          <ArrowLeft size={14} /> Back to posts
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Eye size={15} />
        One-click generate prose from the title isn&apos;t wired yet — write
        the excerpt, lead and sections below. Draft posts stay hidden from the
        public blog; publishing makes them appear on /blog immediately.
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Main content */}
          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl">Content</h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (!slugTouched) {
                      setSlug(slugify(event.target.value));
                    }
                  }}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="How long do roses actually last?"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(event) => {
                      setSlug(slugify(event.target.value));
                      setSlugTouched(true);
                    }}
                    aria-invalid={Boolean(errors.slug)}
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                    placeholder="how-long-do-roses-last"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="blog-categories"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                  <datalist id="blog-categories">
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={2}
                  className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="A 1–2 sentence summary shown in cards and search."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Lead paragraph (article intro)
                </label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="The opening paragraph readers see right under the title."
                />
              </div>

              {/* Sections repeater */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Body sections
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSections((current) => [
                        ...current,
                        { heading: "", paragraphs: [], bullets: [] },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-ink/20 px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
                  >
                    <Plus size={12} /> Add section
                  </button>
                </div>
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-ink/10 bg-ivory-deep/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={section.heading ?? ""}
                          onChange={(event) =>
                            updateSection(index, { heading: event.target.value })
                          }
                          placeholder="Section heading (optional)"
                          className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSections((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                          aria-label={`Remove section ${index + 1}`}
                          className="shrink-0 rounded-md p-2 text-ink-soft transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        value={section.paragraphs.join("\n\n")}
                        onChange={(event) =>
                          updateSection(index, {
                            paragraphs: event.target.value
                              .split(/\n{2,}/)
                              .map((p) => p.trim())
                              .filter(Boolean),
                          })
                        }
                        rows={3}
                        placeholder="Paragraphs — separate each with a blank line."
                        className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                      />
                      <textarea
                        value={section.bullets?.join("\n") ?? ""}
                        onChange={(event) =>
                          updateSection(index, {
                            bullets: event.target.value
                              .split("\n")
                              .map((b) => b.trim())
                              .filter(Boolean),
                          })
                        }
                        rows={2}
                        placeholder="Bullets — one per line (optional)."
                        className="mt-2 w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl">SEO (optional)</h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  SEO title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder={`${title || "Your title"} | FreshFlower.zone`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Meta description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(event) => setMetaDescription(event.target.value)}
                  rows={2}
                  className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="A 150-character summary for search results."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Keywords
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="rose care, vase life, flower delivery"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl">Publishing</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("published")}
                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      status === "published"
                        ? "border-sage bg-sage text-sage-ink"
                        : "border-ink/10 bg-white text-ink-soft hover:border-sage"
                    }`}
                  >
                    <Eye size={14} /> Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      status === "draft"
                        ? "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-ink/10 bg-white text-ink-soft hover:border-amber-400"
                    }`}
                  >
                    <EyeOff size={14} /> Draft
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Publish date *
                </label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
                {errors.publishedAt && (
                  <p className="mt-1 text-xs text-red-600">{errors.publishedAt}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="rose care, vase, morning delivery"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl">Featured image</h2>
            <AdminThumb token={coverImage} name={title || "Post cover"} className="mb-3 h-32 w-full rounded-lg" />
            <div className="mb-2 flex flex-wrap gap-2">
              {COVER_TOKEN_KEYS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => setCoverImage(token)}
                  aria-label={`Use ${token} artwork`}
                  className={`h-8 w-8 rounded-md border-2 transition ${
                    coverImage === token
                      ? "border-gold"
                      : "border-ink/10 hover:border-ink/30"
                  }`}
                  style={{ background: GRADIENT_TOKENS[token] }}
                />
              ))}
            </div>
            <label className="mb-1 mt-2 block text-xs font-bold uppercase tracking-wider text-ink-soft">
              Upload from device
            </label>
            {coverError && (
              <p role="alert" className="mb-2 rounded-md bg-blush px-3 py-2 text-sm text-red-700">
                {coverError}
              </p>
            )}
            <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-ink/25 px-4 py-2 text-sm font-semibold text-ink-soft hover:border-gold hover:text-ink">
              {uploadingCover ? "Uploading…" : "Choose file"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploadingCover}
                onChange={(event) => {
                  void uploadCoverFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </label>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
              Cover URL (optional, overrides swatch)
            </label>
            <input
              type="url"
              value={coverImage.startsWith("http") ? coverImage : ""}
              onChange={(event) => {
                const value = event.target.value;
                setCoverImage(
                  value.trim() ? value.trim() : COVER_TOKEN_KEYS[0],
                );
              }}
              className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
              placeholder="https://… (remote photography)"
            />
          </section>

          <button
            type="submit"
            disabled={saved}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft disabled:opacity-60"
          >
            <Save size={15} /> {saved ? "Saved ✓" : resolvedId ? "Save changes" : "Publish post"}
          </button>
        </div>
      </form>
    </div>
  );
}