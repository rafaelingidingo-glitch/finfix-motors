import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

/** Dynamic sitemap: static routes + every vehicle details page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/inventory`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/services`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    const vehicles = await db.vehicle.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 2000,
    });

    const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
      url: `${siteUrl}/vehicles/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...vehicleRoutes];
  } catch (error) {
    console.error("Sitemap: failed to load vehicles", error);
    return staticRoutes;
  }
}
