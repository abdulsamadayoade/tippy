import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

// Rendered per request: a build-time snapshot would freeze the creator list
// (new pages invisible, suspended ones never removed until a redeploy).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const creators = await db
    .select({ username: creator.username, updatedAt: creator.updatedAt })
    .from(creator)
    .where(eq(creator.suspended, false));

  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...["/support", "/status", "/privacy", "/terms", "/refunds"].map(
      (path) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      }),
    ),
    ...creators.map(({ username, updatedAt }) => ({
      url: `${SITE_URL}/${username}`,
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
