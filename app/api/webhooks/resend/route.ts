import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Maps Resend event types → the email_sends status + timestamp column.
const EVENT_MAP: Record<string, { status: string; column?: string }> = {
  "email.sent": { status: "sent", column: "sent_at" },
  "email.delivered": { status: "delivered", column: "delivered_at" },
  "email.opened": { status: "opened", column: "opened_at" },
  "email.clicked": { status: "clicked", column: "clicked_at" },
  "email.bounced": { status: "bounced", column: "bounced_at" },
  "email.complained": { status: "complained" },
  "email.delivery_delayed": { status: "sent" },
};

// Rank so a "lower" event (e.g. delivered arriving after opened) never downgrades status.
const RANK: Record<string, number> = {
  queued: 0,
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
  bounced: 5,
  complained: 6,
  failed: 5,
};

export async function POST(request: Request) {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const type = payload?.type as string | undefined;
  const emailId = payload?.data?.email_id as string | undefined;
  if (!type || !emailId) return NextResponse.json({ ok: true, skipped: true });

  const mapping = EVENT_MAP[type];
  if (!mapping) return NextResponse.json({ ok: true, ignored: type });

  const service = createServiceClient();

  // Find the send row by Resend id
  const { data: send } = await service
    .from("email_sends")
    .select("id, campaign_id, status")
    .eq("resend_id", emailId)
    .maybeSingle();

  if (!send) return NextResponse.json({ ok: true, unknown: true });

  // Only advance status forward
  const currentRank = RANK[send.status] ?? 0;
  const nextRank = RANK[mapping.status] ?? 0;
  const update: Record<string, any> = {};
  if (nextRank >= currentRank) update.status = mapping.status;
  if (mapping.column) update[mapping.column] = payload?.created_at || new Date().toISOString();

  if (Object.keys(update).length) {
    await service.from("email_sends").update(update).eq("id", send.id);
  }

  // Recompute this campaign's aggregate counters from its send rows
  if (send.campaign_id) {
    await recomputeCampaign(service, send.campaign_id);
  }

  return NextResponse.json({ ok: true });
}

async function recomputeCampaign(service: any, campaignId: string) {
  const { data: rows } = await service
    .from("email_sends")
    .select("status")
    .eq("campaign_id", campaignId);

  const counts = {
    sent_count: 0,
    delivered_count: 0,
    opened_count: 0,
    clicked_count: 0,
    bounced_count: 0,
    complained_count: 0,
    failed_count: 0,
  };

  for (const r of rows ?? []) {
    const s = r.status;
    // "sent" counts anything that at least left our system
    if (["sent", "delivered", "opened", "clicked"].includes(s)) counts.sent_count += 1;
    if (["delivered", "opened", "clicked"].includes(s)) counts.delivered_count += 1;
    if (["opened", "clicked"].includes(s)) counts.opened_count += 1;
    if (s === "clicked") counts.clicked_count += 1;
    if (s === "bounced") counts.bounced_count += 1;
    if (s === "complained") counts.complained_count += 1;
    if (s === "failed") counts.failed_count += 1;
  }

  await service.from("email_campaigns").update(counts).eq("id", campaignId);
}
