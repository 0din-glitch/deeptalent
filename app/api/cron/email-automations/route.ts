import { NextResponse } from "next/server";
import { createServiceClient, requireAdmin } from "@/lib/admin/access";
import { runDueAutomations } from "@/lib/email/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Processes due email automations. Invoked by Vercel Cron (see vercel.json).
 * Authorized either via the Vercel Cron `Authorization: Bearer $CRON_SECRET`
 * header, or by a signed-in admin (for manual "run scheduler now").
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  let authorized = false;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authorized = true;
  } else {
    // Fall back to admin session (manual trigger from the dashboard)
    const { response } = await requireAdmin();
    authorized = !response;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const summary = await runDueAutomations(service);
  return NextResponse.json({ ok: true, ...summary });
}
