import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { aggregateRemoteJobs, type ExternalJob } from "@/lib/jobs/sources";

export const runtime = "nodejs";
// Serve a cached snapshot; the daily cron keeps the underlying table fresh.
export const revalidate = 3600;

export type { ExternalJob };

function serviceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Public feed of REMOTE-ONLY external jobs. Reads from the external_jobs cache
 * table (refreshed daily by /api/cron/external-jobs). If the cache is still
 * empty — e.g. before the first cron run — it falls back to a live aggregation
 * so the section is never empty, and best-effort seeds the cache.
 */
export async function GET() {
  const sb = serviceClient();

  const { data, error } = await sb
    .from("external_jobs")
    .select("id, company, title, category, location, remote, url, source, salary, tags, posted_at")
    .eq("remote", true)
    .order("posted_at", { ascending: false })
    .limit(90);

  if (!error && data && data.length > 0) {
    return NextResponse.json(
      { jobs: data, fetchedAt: new Date().toISOString(), cached: true },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  }

  // Cache empty (or read failed) — aggregate live so the UI still has content.
  const live = await aggregateRemoteJobs(90);

  // Best-effort seed so subsequent requests hit the cache.
  if (live.length > 0) {
    const now = new Date().toISOString();
    sb.from("external_jobs")
      .upsert(
        live.map((j) => ({
          id: j.id,
          company: j.company,
          title: j.title,
          category: j.category,
          location: j.location,
          remote: j.remote,
          url: j.url,
          source: j.source,
          salary: j.salary,
          tags: j.tags,
          posted_at: j.posted_at,
          refreshed_at: now,
        })),
        { onConflict: "id" }
      )
      .then(({ error: seedErr }) => {
        if (seedErr) console.log("[v0] external-jobs seed failed:", seedErr.message);
      });
  }

  return NextResponse.json(
    { jobs: live, fetchedAt: new Date().toISOString(), cached: false },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } }
  );
}
