import type { MetadataRoute } from "next";
import { blogs, bouquets, occasions } from "@/lib/data";
import { citySeoPages, occasionSeoPages } from "@/lib/data/seoPages";
import {
  getCategories,
  getLiveFestivalCollections,
  getPublishedFlowers,
} from "@/lib/db/repositories";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [collections, flowers, categories] = await Promise.all([
    getLiveFestivalCollections(now),
    getPublishedFlowers(),
    getCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/flowers",
    "/bouquets",
    "/collections",
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

  const collectionRoutes: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: SITE_URL + `/collections/${collection.slug}`,
      lastModified: collection.updatedAt
        ? new Date(collection.updatedAt)
        : now,
      changeFrequency: "daily",
      priority: 0.8,
    }),
  );

  return [
    ...staticRoutes,
    ...productRoutes,
    ...bouquetRoutes,
    ...categoryRoutes,
    ...occasionRoutes,
    ...blogRoutes,
    ...collectionRoutes,
  ];
}