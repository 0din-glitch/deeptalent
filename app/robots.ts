import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://deeptalent.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep authenticated, transactional, and API surfaces out of search results.
        disallow: [
          "/admin",
          "/dashboard",
          "/interview",
          "/api/",
          "/auth/",
          "/companies/hire/pay",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
