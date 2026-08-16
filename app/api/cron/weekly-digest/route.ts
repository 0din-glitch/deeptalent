import { NextResponse } from "next/server";
import { createServiceClient, requireAdmin } from "@/lib/admin/access";
import { sendAdminWeeklyDigest } from "@/lib/email/admin-digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends the weekly admin activity digest. Invoked by Vercel Cron (see
 * vercel.json). Authorized either via the Vercel Cron
 * `Authorization: Bearer $CRON_SECRET` header, or by a signed-in admin
 * (so it can be triggered manually from the dashboard for testing).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  let authorized = false;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authorized = true;
  } else {
    const { response } = await requireAdmin();
    authorized = !response;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const result = await sendAdminWeeklyDigest(service);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
