import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/suspend
 * Body: { userId: string; reason?: string; restore?: boolean }
 * Super-admin only.
 */
export async function POST(req: Request) {
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  let body: { userId?: string; reason?: string; restore?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = body.userId?.trim();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === ctx.userId) {
    return NextResponse.json({ error: "You cannot suspend yourself." }, { status: 400 });
  }

  const { data: target } = await ctx.service
    .from("profiles")
    .select("id, email, full_name, is_super_admin, suspended_at")
    .eq("id", userId)
    .maybeSingle();

  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.is_super_admin && !body.restore) {
    return NextResponse.json({ error: "Super admins cannot be suspended." }, { status: 400 });
  }

  if (body.restore) {
    const { error } = await ctx.service
      .from("profiles")
      .update({ suspended_at: null, suspended_by: null, suspension_reason: null })
      .eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Re-enable auth user
    await ctx.service.auth.admin.updateUserById(userId, { ban_duration: "none" }).catch(() => null);

    await logAuditEntry(ctx.service, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: "user.restore",
      resource_type: "user",
      resource_id: userId,
      summary: `Restored access for ${target.email || userId}`,
      metadata: { target_email: target.email, target_name: target.full_name },
    });
    return NextResponse.json({ ok: true, restored: true });
  }

  const { error } = await ctx.service
    .from("profiles")
    .update({
      suspended_at: new Date().toISOString(),
      suspended_by: ctx.userId,
      suspension_reason: body.reason || null,
    })
    .eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Ban the auth user so sessions are rejected
  await ctx.service.auth.admin.updateUserById(userId, { ban_duration: "876000h" }).catch(() => null);

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "user.suspend",
    resource_type: "user",
    resource_id: userId,
    summary: `Suspended ${target.email || userId}`,
    metadata: {
      target_email: target.email,
      target_name: target.full_name,
      reason: body.reason || null,
    },
  });

  return NextResponse.json({ ok: true, suspended: true });
}
