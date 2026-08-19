import { NextResponse } from "next/server";
import { createServiceClient, requireAdmin } from "@/lib/admin/access";
import { aggregateRemoteJobs } from "@/lib/jobs/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Refreshes the external_jobs cache with REMOTE-ONLY listings aggregated from
 * public job boards. Invoked daily by Vercel Cron (see vercel.json). Authorized
 * via the Vercel Cron `Authorization: Bearer $CRON_SECRET` header, or by a
 * signed-in admin so it can be triggered manually for testing.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  let authorized = false;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authorized = true;
  } else {
    const { response } = await requireAdmin();
    authorized = !response;
  }
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await aggregateRemoteJobs(120);
  if (jobs.length === 0) {
    // Don't wipe the existing cache if every upstream source failed.
    return NextResponse.json(
      { ok: false, reason: "no jobs fetched", refreshed: 0 },
      { status: 502 }
    );
  }

  const service = createServiceClient();
  const now = new Date().toISOString();

  // Upsert the fresh batch.
  const { error: upsertError } = await service.from("external_jobs").upsert(
    jobs.map((j) => ({
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
  );
  if (upsertError) {
    console.log("[v0] external-jobs upsert failed:", upsertError.message);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Prune anything not seen in this run (stale/expired listings).
  const { error: pruneError } = await service
    .from("external_jobs")
    .delete()
    .lt("refreshed_at", now);
  if (pruneError) {
    console.log("[v0] external-jobs prune failed:", pruneError.message);
  }

  return NextResponse.json({ ok: true, refreshed: jobs.length, at: now });
}
