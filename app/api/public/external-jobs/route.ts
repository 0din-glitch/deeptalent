import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Revalidate hourly so we serve a cached snapshot rather than hammering the
// upstream job boards on every page view.
export const revalidate = 3600;

export type ExternalJob = {
  id: string;
  company: string;
  title: string;
  category: string | null;
  location: string | null;
  remote: boolean;
  url: string;
  source: string;
  posted_at: string;
  tags: string[];
};

/**
 * Map a raw category/tag string onto the same high-level buckets DeepTalent
 * uses internally, so the "Outside DeepTalent" filter chips line up with the
 * in-house Open Roles filters.
 */
function normalizeCategory(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.toLowerCase();
  if (/(engineer|developer|software|backend|frontend|full.?stack|devops|programming|data|machine|ai)/.test(v))
    return "Engineering";
  if (/(design|ux|ui|product design)/.test(v)) return "Design";
  if (/(product manager|product)/.test(v)) return "Product";
  if (/(market|growth|seo|content|social)/.test(v)) return "Marketing";
  if (/(sales|account|business development|bd)/.test(v)) return "Sales";
  if (/(finance|account|fp&a|analyst)/.test(v)) return "Finance";
  if (/(support|success|operations|ops)/.test(v)) return "Operations";
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 24);
}

async function fetchRemotive(): Promise<ExternalJob[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?limit=60", {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Remotive ${res.status}`);
  const json = (await res.json()) as {
    jobs?: Array<{
      id: number;
      url: string;
      title: string;
      company_name: string;
      category?: string;
      tags?: string[];
      candidate_required_location?: string;
      publication_date?: string;
    }>;
  };
  return (json.jobs || []).map((j) => ({
    id: `remotive-${j.id}`,
    company: j.company_name,
    title: j.title,
    category: normalizeCategory(j.category),
    location: j.candidate_required_location || "Remote",
    remote: true,
    url: j.url,
    source: "Remotive",
    posted_at: j.publication_date || new Date().toISOString(),
    tags: (j.tags || []).slice(0, 4),
  }));
}

async function fetchArbeitnow(): Promise<ExternalJob[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
  const json = (await res.json()) as {
    data?: Array<{
      slug: string;
      company_name: string;
      title: string;
      tags?: string[];
      job_types?: string[];
      location?: string;
      remote?: boolean;
      url: string;
      created_at?: number;
    }>;
  };
  return (json.data || []).map((j) => ({
    id: `arbeitnow-${j.slug}`,
    company: j.company_name,
    title: j.title,
    category: normalizeCategory(j.tags?.[0] || j.job_types?.[0]),
    location: j.location || (j.remote ? "Remote" : null),
    remote: Boolean(j.remote),
    url: j.url,
    source: "Arbeitnow",
    posted_at: j.created_at
      ? new Date(j.created_at * 1000).toISOString()
      : new Date().toISOString(),
    tags: (j.tags || []).slice(0, 4),
  }));
}

export async function GET() {
  // Fetch every source independently so one upstream outage can't take down
  // the whole endpoint.
  const results = await Promise.allSettled([fetchRemotive(), fetchArbeitnow()]);

  const jobs: ExternalJob[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") jobs.push(...r.value);
    else console.log("[v0] external-jobs source failed:", r.reason?.message || r.reason);
  }

  // De-dupe on company + title (same role often syndicated to multiple boards).
  const seen = new Set<string>();
  const deduped = jobs.filter((j) => {
    const key = `${j.company.toLowerCase()}::${j.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Newest first.
  deduped.sort(
    (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
  );

  return NextResponse.json(
    { jobs: deduped.slice(0, 90), fetchedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
