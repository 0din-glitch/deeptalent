// Shared remote-only job aggregation used by both the daily cron
// (/api/cron/external-jobs, which caches into the external_jobs table) and the
// public API fallback (/api/public/external-jobs). Every source below is a
// remote-first board, and non-remote listings are filtered out downstream.

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
  /** Raw stated salary text, when the board provides one. Never rendered on
   *  public cards — used server-side to compute in-network economics. */
  salary: string | null;
};

/**
 * Map a raw category/tag string onto the same high-level buckets DeepTalent
 * uses internally, so the "Outside DeepTalent" filter chips line up with the
 * in-house Open Roles filters.
 */
export function normalizeCategory(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.toLowerCase();
  if (/(engineer|developer|software|backend|frontend|full.?stack|devops|programming|data|machine|\bai\b)/.test(v))
    return "Engineering";
  if (/(design|ux|ui)/.test(v)) return "Design";
  if (/(product manager|product owner|\bproduct\b)/.test(v)) return "Product";
  if (/(market|growth|seo|content|social)/.test(v)) return "Marketing";
  if (/(sales|account exec|business development|\bbd\b)/.test(v)) return "Sales";
  if (/(finance|accounting|fp&a|analyst)/.test(v)) return "Finance";
  if (/(support|success|operations|\bops\b|recruit|people|hr)/.test(v)) return "Operations";
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 24);
}

const UA =
  "Mozilla/5.0 (compatible; DeepTalentBot/1.0; +https://deeptalentplatform.com)";

// Remotive — 100% remote board with rich categories + salary strings.
async function fetchRemotive(): Promise<ExternalJob[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?limit=80", {
    headers: { Accept: "application/json", "User-Agent": UA },
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
      salary?: string;
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
    salary: j.salary || null,
  }));
}

// RemoteOK — high-traffic remote board. First array element is a legal notice.
async function fetchRemoteOk(): Promise<ExternalJob[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { Accept: "application/json", "User-Agent": UA },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`RemoteOK ${res.status}`);
  const json = (await res.json()) as Array<Record<string, any>>;
  return (Array.isArray(json) ? json : [])
    .filter((j) => j && j.id && j.position && j.company)
    .map((j) => {
      const salaryMin = Number(j.salary_min) || 0;
      const salaryMax = Number(j.salary_max) || 0;
      const salary =
        salaryMin > 0 || salaryMax > 0
          ? `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}`
          : null;
      return {
        id: `remoteok-${j.id}`,
        company: String(j.company),
        title: String(j.position),
        category: normalizeCategory(Array.isArray(j.tags) ? j.tags.join(" ") : null),
        location: j.location ? String(j.location) : "Remote",
        remote: true,
        url: j.url || `https://remoteok.com/l/${j.id}`,
        source: "RemoteOK",
        posted_at: j.date || new Date().toISOString(),
        tags: Array.isArray(j.tags) ? j.tags.slice(0, 4).map(String) : [],
        salary,
      } satisfies ExternalJob;
    });
}

// Himalayas — curated remote jobs with seniority + category metadata.
async function fetchHimalayas(): Promise<ExternalJob[]> {
  const res = await fetch("https://himalayas.app/jobs/api?limit=80", {
    headers: { Accept: "application/json", "User-Agent": UA },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Himalayas ${res.status}`);
  const json = (await res.json()) as {
    jobs?: Array<{
      guid?: string;
      title: string;
      companyName: string;
      categories?: string[];
      locationRestrictions?: string[];
      pubDate?: number | string;
      applicationLink?: string;
      minSalary?: number;
      maxSalary?: number;
    }>;
  };
  return (json.jobs || [])
    .filter((j) => j.title && j.companyName)
    .map((j, idx) => {
      const salary =
        j.minSalary || j.maxSalary
          ? `$${(j.minSalary || 0).toLocaleString()} - $${(j.maxSalary || 0).toLocaleString()}`
          : null;
      const posted =
        typeof j.pubDate === "number"
          ? new Date(j.pubDate * 1000).toISOString()
          : j.pubDate
            ? new Date(j.pubDate).toISOString()
            : new Date().toISOString();
      return {
        id: `himalayas-${j.guid || idx}-${j.companyName}`.slice(0, 120),
        company: j.companyName,
        title: j.title,
        category: normalizeCategory(j.categories?.[0] || null),
        location: j.locationRestrictions?.[0] || "Remote",
        remote: true,
        url: j.applicationLink || "https://himalayas.app/jobs",
        source: "Himalayas",
        posted_at: posted,
        tags: (j.categories || []).slice(0, 4),
        salary,
      } satisfies ExternalJob;
    });
}

// Arbeitnow — general board; we keep ONLY the remote listings.
async function fetchArbeitnow(): Promise<ExternalJob[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    headers: { Accept: "application/json", "User-Agent": UA },
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
  return (json.data || [])
    .filter((j) => j.remote)
    .map((j) => ({
      id: `arbeitnow-${j.slug}`,
      company: j.company_name,
      title: j.title,
      category: normalizeCategory(j.tags?.[0] || j.job_types?.[0]),
      location: j.location || "Remote",
      remote: true,
      url: j.url,
      source: "Arbeitnow",
      posted_at: j.created_at
        ? new Date(j.created_at * 1000).toISOString()
        : new Date().toISOString(),
      tags: (j.tags || []).slice(0, 4),
      salary: null,
    }));
}

/**
 * Fetch, filter (remote only), de-dupe and sort jobs from every source.
 * Sources are fetched independently so one upstream outage can't take down
 * the whole aggregation.
 */
export async function aggregateRemoteJobs(max = 120): Promise<ExternalJob[]> {
  const results = await Promise.allSettled([
    fetchRemotive(),
    fetchRemoteOk(),
    fetchHimalayas(),
    fetchArbeitnow(),
  ]);

  const jobs: ExternalJob[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") jobs.push(...r.value);
    else console.log("[v0] job source failed:", (r.reason as Error)?.message || r.reason);
  }

  // Remote-only guarantee (belt-and-braces on top of per-source filtering).
  const remoteOnly = jobs.filter((j) => j.remote);

  // De-dupe on company + title (same role often syndicated across boards).
  const seen = new Set<string>();
  const deduped = remoteOnly.filter((j) => {
    const key = `${j.company.toLowerCase().trim()}::${j.title.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort(
    (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
  );

  return deduped.slice(0, max);
}
