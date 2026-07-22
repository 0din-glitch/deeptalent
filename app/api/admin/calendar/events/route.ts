import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import { isCalendarConfigured, createGoogleEvent, listGoogleEvents } from "@/lib/google/calendar";
import { getValidAccessToken } from "@/lib/google/connection";

// GET: upcoming events. When connected to Google, returns live Google events;
// otherwise returns locally-stored events created through the dashboard.
export async function GET() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const nowIso = new Date().toISOString();

  if (isCalendarConfigured()) {
    const conn = await getValidAccessToken(ctx.service, ctx.userId);
    if (conn) {
      try {
        const events = await listGoogleEvents(conn.token, conn.calendarId, nowIso);
        return NextResponse.json({ source: "google", events });
      } catch (e) {
        console.error("[calendar] list google events failed", e);
        // fall through to local
      }
    }
  }

  const { data } = await ctx.service
    .from("calendar_events")
    .select("id, title, start_time, end_time, location, google_html_link, synced")
    .gte("start_time", nowIso)
    .order("start_time", { ascending: true })
    .limit(50);

  const events = (data || []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    location: e.location,
    htmlLink: e.google_html_link,
    synced: e.synced,
  }));
  return NextResponse.json({ source: "local", events });
}

// POST: create a meeting. Syncs to Google Calendar when connected.
export async function POST(req: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const start = String(body.start || "");
  const end = String(body.end || "");
  const location = body.location ? String(body.location).trim() : null;
  const description = body.description ? String(body.description).trim() : null;
  const attendees: string[] = Array.isArray(body.attendees)
    ? body.attendees.map((a: unknown) => String(a).trim()).filter((a: string) => a.includes("@"))
    : [];

  if (!title || !start || !end) {
    return NextResponse.json({ error: "Title, start, and end are required." }, { status: 400 });
  }

  let googleEventId: string | null = null;
  let googleHtmlLink: string | null = null;
  let synced = false;

  if (isCalendarConfigured()) {
    const conn = await getValidAccessToken(ctx.service, ctx.userId);
    if (conn) {
      try {
        const created = await createGoogleEvent(conn.token, conn.calendarId, {
          title,
          description: description ?? undefined,
          location: location ?? undefined,
          start,
          end,
          attendees,
        });
        googleEventId = created.id;
        googleHtmlLink = created.htmlLink;
        synced = true;
      } catch (e) {
        console.error("[calendar] create google event failed", e);
      }
    }
  }

  const { data, error } = await ctx.service
    .from("calendar_events")
    .insert({
      title,
      description,
      location,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      attendees,
      google_event_id: googleEventId,
      google_html_link: googleHtmlLink,
      synced,
      created_by: ctx.userId,
      created_by_email: ctx.email,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "calendar.event_created",
    resource_type: "calendar_event",
    resource_id: data.id,
    summary: `Created meeting "${title}"${synced ? " (synced to Google)" : ""}`,
  });

  return NextResponse.json({ ok: true, id: data.id, synced });
}
