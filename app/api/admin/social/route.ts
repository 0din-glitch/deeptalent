import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import { PLATFORMS, isPlatformConfigured, type Platform } from "@/lib/social/providers";

// GET: watchlist + per-platform configuration status
export async function GET() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const { data } = await ctx.service
    .from("social_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  const platforms = PLATFORMS.map((p) => ({
    key: p.key,
    label: p.label,
    ready: p.ready,
    configured: isPlatformConfigured(p.key),
  }));

  return NextResponse.json({ accounts: data || [], platforms });
}

// POST: add an account to the watchlist
export async function POST(req: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const platform = String(body.platform || "") as Platform;
  const handle = String(body.handle || "").trim();
  const url = body.url ? String(body.url).trim() : null;
  const label = body.label ? String(body.label).trim() : null;

  if (!PLATFORMS.some((p) => p.key === platform)) {
    return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
  }
  if (!handle) {
    return NextResponse.json({ error: "Username or link is required." }, { status: 400 });
  }

  const { data, error } = await ctx.service
    .from("social_accounts")
    .insert({ platform, handle, url, label, added_by: ctx.userId })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "social.account_added",
    resource_type: "social_account",
    resource_id: data.id,
    summary: `Added ${platform} @${handle} to social watchlist`,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

// DELETE: remove an account
export async function DELETE(req: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  await ctx.service.from("social_accounts").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
