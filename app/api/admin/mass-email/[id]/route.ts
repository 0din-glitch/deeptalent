import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const [{ data: campaign }, { data: sends }] = await Promise.all([
    ctx.service.from("email_campaigns").select("*").eq("id", id).maybeSingle(),
    ctx.service
      .from("email_sends")
      .select("email, name, status, sent_at, delivered_at, opened_at, clicked_at, error")
      .eq("campaign_id", id)
      .order("created_at", { ascending: true })
      .limit(2000),
  ]);

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ campaign, sends: sends ?? [] });
}
