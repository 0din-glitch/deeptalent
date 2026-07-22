import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";
import { isCalendarConfigured, buildAuthUrl } from "@/lib/google/calendar";

export async function GET(req: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  if (!isCalendarConfigured()) {
    return NextResponse.json(
      { error: "Google Calendar is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
      { status: 400 }
    );
  }

  const origin = new URL(req.url).origin;
  // state = adminId so the callback knows who is connecting
  const url = buildAuthUrl(origin, ctx.userId);
  return NextResponse.redirect(url);
}
