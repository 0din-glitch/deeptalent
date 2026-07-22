import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";

export async function POST() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  await ctx.service.from("google_calendar_connections").delete().eq("admin_id", ctx.userId);
  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "calendar.disconnected",
    resource_type: "google_calendar",
    summary: "Disconnected Google Calendar",
  });

  return NextResponse.json({ ok: true });
}
