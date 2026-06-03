import { NextResponse } from "next/server";
import { requireSuperAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/deletion-requests/[id]
 * Body: { decision: 'approved' | 'rejected' | 'cancelled'; note?: string }
 * Super-admin only. On 'approved' it executes the deletion against the target
 * record, then marks the request approved (atomic-ish: log either way).
 */
export async function POST(req: Request, ctxArg: { params: Promise<{ id: string }> }) {
  const { id } = await ctxArg.params;
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  let body: { decision?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const decision = body.decision;
  if (!decision || !["approved", "rejected", "cancelled"].includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const { data: request } = await ctx.service
    .from("admin_deletion_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.status !== "pending") {
    return NextResponse.json(
      { error: `Request is already ${request.status}.` },
      { status: 400 }
    );
  }

  // If approved, perform the deletion now.
  if (decision === "approved") {
    const t = request.target_type as string;
    const targetId = request.target_id as string;

    if (t === "user") {
      // Detach FKs to preserve history, then delete profile + auth user.
      await ctx.service.from("talent_applications").update({ user_id: null }).eq("user_id", targetId);
      await ctx.service.from("company_inquiries").update({ user_id: null }).eq("user_id", targetId);
      await ctx.service.from("profiles").delete().eq("id", targetId);
      const { error: delErr } = await ctx.service.auth.admin.deleteUser(targetId);
      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
      }
    } else if (t === "talent_application") {
      const { error } = await ctx.service.from("talent_applications").delete().eq("id", targetId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (t === "company_inquiry") {
      const { error } = await ctx.service.from("company_inquiries").delete().eq("id", targetId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (t === "contact_message") {
      const { error } = await ctx.service.from("contact_messages").delete().eq("id", targetId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Unsupported target_type" }, { status: 400 });
    }
  }

  const { error: updErr } = await ctx.service
    .from("admin_deletion_requests")
    .update({
      status: decision,
      decided_by: ctx.userId,
      decided_at: new Date().toISOString(),
      decision_note: body.note || null,
    })
    .eq("id", id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: `deletion.${decision}`,
    resource_type: request.target_type,
    resource_id: request.target_id,
    summary:
      decision === "approved"
        ? `Approved + executed deletion of ${request.target_type} ${request.target_label || request.target_id}`
        : `${decision === "rejected" ? "Rejected" : "Cancelled"} deletion request for ${request.target_label || request.target_id}`,
    metadata: {
      request_id: id,
      requested_by: request.requested_by,
      requested_by_email: request.requested_by_email,
      note: body.note || null,
    },
  });

  return NextResponse.json({ ok: true, decision });
}
