import { NextResponse } from "next/server";
import { requireSuperAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const { userId, reason } = (await req.json().catch(() => ({}))) as {
    userId?: string;
    reason?: string;
  };
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === ctx.userId) {
    return NextResponse.json(
      { error: "You cannot delete your own account from here." },
      { status: 400 }
    );
  }

  // Block deletion of other super admins to avoid lockout
  const { data: target } = await ctx.service
    .from("profiles")
    .select("id, email, full_name, is_super_admin")
    .eq("id", userId)
    .maybeSingle();

  if (target?.is_super_admin) {
    return NextResponse.json(
      { error: "Super admin accounts cannot be deleted from here." },
      { status: 400 }
    );
  }

  // Detach related rows so we don't lose audit history
  await ctx.service.from("talent_applications").update({ user_id: null }).eq("user_id", userId);
  await ctx.service.from("company_inquiries").update({ user_id: null }).eq("user_id", userId);

  // Delete profile then auth user
  await ctx.service.from("profiles").delete().eq("id", userId);
  const { error: delErr } = await ctx.service.auth.admin.deleteUser(userId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "user.delete",
    resource_type: "user",
    resource_id: userId,
    summary: `Deleted ${target?.email || userId}`,
    metadata: {
      target_email: target?.email,
      target_name: target?.full_name,
      reason: reason || null,
    },
  });

  return NextResponse.json({ ok: true });
}
