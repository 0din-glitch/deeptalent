import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SALARY_SCALE } from "@/lib/salary/scale";
import { ROLE_CONTENT } from "@/lib/roles/content";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://deeptalent.app";

export const revalidate = 3600;

async function fetchInsightSlugs(): Promise<{ slug: string; updated: string | null }[]> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await sb
      .from("blog_posts")
      .select("slug,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(500);
    return (data ?? []).map((r: { slug: string; published_at: string | null }) => ({
      slug: r.slug,
      updated: r.published_at,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Public, indexable static routes with hand-tuned priorities.
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/companies", priority: 0.9, changeFrequency: "weekly" },
    { path: "/talents", priority: 0.9, changeFrequency: "weekly" },
    { path: "/consulting", priority: 0.8, changeFrequency: "monthly" },
    { path: "/roles", priority: 0.8, changeFrequency: "weekly" },
    { path: "/insights", priority: 0.8, changeFrequency: "daily" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/companies/hire", priority: 0.7, changeFrequency: "monthly" },
    { path: "/talents/apply", priority: 0.7, changeFrequency: "monthly" },
    { path: "/nysc/training", priority: 0.6, changeFrequency: "monthly" },
    { path: "/nysc/roles", priority: 0.6, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${APP_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // One entry per role landing page that has editorial content.
  const roleEntries: MetadataRoute.Sitemap = SALARY_SCALE.filter(
    (row) => ROLE_CONTENT[row.id]
  ).map((row) => ({
    url: `${APP_URL}/roles/${row.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Published insight articles pulled live from the database.
  const insightSlugs = await fetchInsightSlugs();
  const insightEntries: MetadataRoute.Sitemap = insightSlugs.map((p) => ({
    url: `${APP_URL}/insights/${p.slug}`,
    lastModified: p.updated ? new Date(p.updated) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...roleEntries, ...insightEntries];
}
