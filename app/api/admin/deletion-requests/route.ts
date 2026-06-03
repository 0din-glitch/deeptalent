import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/admin/deletion-requests           — list (admins see own + super admin sees all)
 * POST /api/admin/deletion-requests           — create a request (any admin)
 * Body: { target_type, target_id, target_label?, reason? }
 */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let q = ctx.service
    .from("admin_deletion_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!ctx.isSuperAdmin) q = q.eq("requested_by", ctx.userId);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [], is_super_admin: ctx.isSuperAdmin });
}

const ALLOWED_TARGETS = new Set([
  "user",
  "talent_application",
  "company_inquiry",
  "contact_message",
]);

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  let body: {
    target_type?: string;
    target_id?: string;
    target_label?: string;
    reason?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.target_type || !ALLOWED_TARGETS.has(body.target_type)) {
    return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
  }
  if (!body.target_id) {
    return NextResponse.json({ error: "target_id required" }, { status: 400 });
  }

  // Prevent duplicate pending requests for the same target
  const { data: existing } = await ctx.service
    .from("admin_deletion_requests")
    .select("id")
    .eq("target_type", body.target_type)
    .eq("target_id", body.target_id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A pending deletion request already exists for this item." },
      { status: 409 }
    );
  }

  const { data, error } = await ctx.service
    .from("admin_deletion_requests")
    .insert({
      requested_by: ctx.userId,
      requested_by_email: ctx.email,
      target_type: body.target_type,
      target_id: body.target_id,
      target_label: body.target_label || null,
      reason: body.reason || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "deletion.request",
    resource_type: body.target_type,
    resource_id: body.target_id,
    summary: `Requested deletion of ${body.target_type} ${body.target_label || body.target_id}`,
    metadata: { reason: body.reason || null, request_id: data.id },
  });

  return NextResponse.json({ ok: true, request: data });
}
