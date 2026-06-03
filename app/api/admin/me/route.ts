import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  return NextResponse.json({
    id: ctx.userId,
    email: ctx.email,
    role: ctx.role,
    is_super_admin: ctx.isSuperAdmin,
    permissions: {
      view: true,
      edit: true,
      schedule_meetings: true,
      decide_applications: true,
      delete_directly: ctx.isSuperAdmin,
      suspend_users: ctx.isSuperAdmin,
      restore_users: ctx.isSuperAdmin,
      approve_deletion_requests: ctx.isSuperAdmin,
      view_audit_log: true,
    },
  });
}
