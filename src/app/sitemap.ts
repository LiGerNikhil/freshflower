import type { MetadataRoute } from "next";
import { blogs, bouquets, categories, flowers, occasions } from "@/lib/data";
import { citySeoPages, occasionSeoPages } from "@/lib/data/seoPages";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/flowers",
    "/bouquets",
    "/categories",
    "/occasions",
    "/blog",
    "/about",
    "/contact",
    "/delivery",
    "/faq",
    "/reviews",
    "/wholesale",
    "/wedding-events",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
    "/delivery-policy",
    ...citySeoPages.map((page) => page.route),
    ...occasionSeoPages.map((page) => page.route),
  ].map((path) => ({
    url: SITE_URL + path,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = flowers.map((flower) => ({
    url: SITE_URL + `/flowers/${flower.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const bouquetRoutes: MetadataRoute.Sitemap = bouquets.map((bouquet) => ({
    url: SITE_URL + `/bouquets/${bouquet.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: SITE_URL + `/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const occasionRoutes: MetadataRoute.Sitemap = occasions.map((occasion) => ({
    url: SITE_URL + `/occasions/${occasion.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((post) => ({
    url: SITE_URL + `/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...bouquetRoutes,
    ...categoryRoutes,
    ...occasionRoutes,
    ...blogRoutes,
  ];
}