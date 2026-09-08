import type { BlogPost } from "@/lib/types";

export function readingMinutes(post: BlogPost) {
  const parts = [
    post.content,
    ...post.sections.flatMap((section) => [
      section.heading ?? "",
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
  ];
  const words = parts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 180));
}

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function postsByCategory(posts: BlogPost[]) {
  return Array.from(new Set(posts.map((post) => post.category))).sort();
}

export function allTags(posts: BlogPost[]) {
  return Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
}

export function relatedPosts(posts: BlogPost[], current: BlogPost, limit = 3) {
  const scored = posts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      let score = 0;
      if (post.category === current.category) score += 3;
      const sharedTags = post.tags.filter((tag) =>
        current.tags.includes(tag),
      ).length;
      score += sharedTags;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored
    .concat(posts.filter((post) => post.id !== current.id).map((post) => ({ post, score: -1 })))
    .filter(
      (entry, index, all) =>
        all.findIndex((item) => item.post.id === entry.post.id) === index,
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}