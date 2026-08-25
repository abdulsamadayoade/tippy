import { SITE_URL, isProductionSite } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Login/register stay crawlable on purpose: their meta noindex only
      // works if crawlers can fetch the page.
      disallow: [
        "/api/",
        "/overview",
        "/tips",
        "/payouts",
        "/settings",
        "/onboarding",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
