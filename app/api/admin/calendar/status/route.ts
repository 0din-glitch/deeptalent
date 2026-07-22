import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";
import { isCalendarConfigured } from "@/lib/google/calendar";

export async function GET() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const configured = isCalendarConfigured();
  const { data } = await ctx.service
    .from("google_calendar_connections")
    .select("google_email, calendar_id, connected_at")
    .eq("admin_id", ctx.userId)
    .maybeSingle();

  return NextResponse.json({
    configured,
    connected: Boolean(data?.google_email),
    googleEmail: data?.google_email ?? null,
    calendarId: data?.calendar_id ?? "primary",
    connectedAt: data?.connected_at ?? null,
  });
}
