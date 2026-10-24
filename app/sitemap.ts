import type { MetadataRoute } from "next";
import { getActivities } from "@/lib/data/public";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/about-us/", priority: 0.9 },
    { path: "/what-we-do/", priority: 0.9 },
    { path: "/gallery/", priority: 0.8 },
    { path: "/get-involved/", priority: 0.8 },
    { path: "/donate/", priority: 0.8 },
    { path: "/contact/", priority: 0.7 },
    { path: "/privacy-policy/", priority: 0.2 },
  ];
  const activities = await getActivities();
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p.path}`, priority: p.priority })),
    ...activities.map((a) => ({
      url: `${SITE_URL}/gallery/${a.slug}/`,
      lastModified: a.activity_date,
      priority: 0.6,
    })),
  ];
}
