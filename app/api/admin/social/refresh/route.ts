import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";
import { fetchMetrics, type Platform } from "@/lib/social/providers";

// POST { id } — pulls live metrics for one watchlist account and stores a snapshot.
export async function POST(req: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { data: account } = await ctx.service
    .from("social_accounts")
    .select("id, platform, handle")
    .eq("id", id)
    .maybeSingle();

  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const result = await fetchMetrics(account.platform as Platform, account.handle);

  if (!result.configured) {
    await ctx.service
      .from("social_accounts")
      .update({ last_error: result.reason, last_synced_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  await ctx.service
    .from("social_accounts")
    .update({
      followers: result.followers,
      following: result.following,
      posts: result.posts,
      engagement_rate: result.engagementRate,
      extra: result.extra ?? null,
      last_error: null,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Store a history snapshot for trend charts
  await ctx.service.from("social_metrics_history").insert({
    account_id: id,
    followers: result.followers,
    posts: result.posts,
    engagement_rate: result.engagementRate,
  });

  return NextResponse.json({ ok: true, metrics: result });
}
