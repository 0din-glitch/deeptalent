import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import { isCalendarConfigured, exchangeCode, emailFromIdToken } from "@/lib/google/calendar";

export async function GET(req: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Where to send the admin back to in the dashboard
  const back = new URL("/admin", url.origin);

  if (error || !code) {
    back.searchParams.set("calendar", "error");
    return NextResponse.redirect(back);
  }
  if (!isCalendarConfigured()) {
    back.searchParams.set("calendar", "unconfigured");
    return NextResponse.redirect(back);
  }
  // Guard: state must match the connecting admin
  if (state && state !== ctx.userId) {
    back.searchParams.set("calendar", "mismatch");
    return NextResponse.redirect(back);
  }

  try {
    const tokens = await exchangeCode(code, url.origin);
    const googleEmail = emailFromIdToken(tokens.id_token);
    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await ctx.service.from("google_calendar_connections").upsert(
      {
        admin_id: ctx.userId,
        google_email: googleEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expiry: expiry,
        scope: tokens.scope ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "admin_id" }
    );

    await logAuditEntry(ctx.service, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: "calendar.connected",
      resource_type: "google_calendar",
      summary: `Connected Google Calendar (${googleEmail ?? "unknown"})`,
    });

    back.searchParams.set("calendar", "connected");
    return NextResponse.redirect(back);
  } catch (e) {
    console.error("[calendar] callback failed", e);
    back.searchParams.set("calendar", "error");
    return NextResponse.redirect(back);
  }
}
