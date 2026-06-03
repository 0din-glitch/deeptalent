import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { service } = auth.ctx;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
  const action = searchParams.get("action");
  const actor = searchParams.get("actor");

  let q = service
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (action) q = q.eq("action", action);
  if (actor) q = q.eq("actor_id", actor);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}
