import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import { createAndSendCampaign } from "@/lib/email/send";
import {
  senderOptions,
  resolveSender,
  resolveSegment,
  parseManualEmails,
  getRateUsage,
  renderMeetingSection,
  SEGMENTS,
  DAILY_LIMIT,
  MONTHLY_LIMIT,
  type Recipient,
  type SegmentKey,
  type MeetingDetails,
} from "@/lib/email/mass";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── GET: dashboard data (campaigns, aggregate metrics, rate usage, options) ──
export async function GET() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const service = ctx.service;

  const [{ data: campaigns }, usage, segmentCounts] = await Promise.all([
    service
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    getRateUsage(service),
    computeSegmentCounts(service),
  ]);

  const rows = campaigns ?? [];
  const totals = rows.reduce(
    (acc, c) => {
      acc.campaigns += 1;
      acc.sent += c.sent_count || 0;
      acc.delivered += c.delivered_count || 0;
      acc.opened += c.opened_count || 0;
      acc.clicked += c.clicked_count || 0;
      acc.bounced += c.bounced_count || 0;
      return acc;
    },
    { campaigns: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 }
  );

  return NextResponse.json({
    campaigns: rows,
    totals,
    usage,
    segments: SEGMENTS.map((s) => ({ ...s, count: segmentCounts[s.key] ?? 0 })),
    senders: senderOptions(),
  });
}

async function computeSegmentCounts(service: any): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const segs: SegmentKey[] = ["all_users", "talents", "approved_talents", "companies", "leads"];
  await Promise.all(
    segs.map(async (s) => {
      const list = await resolveSegment(service, s);
      counts[s] = list.length;
    })
  );
  return counts;
}

// ── POST: create + send a campaign ──────────────────────────────────────────
export async function POST(request: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;
  const service = ctx.service;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email sending is not configured yet. Add the RESEND_API_KEY to enable sending." },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const subject = String(body.subject || "").trim();
  let bodyHtml = String(body.bodyHtml || "").trim();
  const fromKey = String(body.fromKey || "noreply");
  const segment = body.segment ? (String(body.segment) as SegmentKey) : null;
  const manualRaw = String(body.manualEmails || "");
  const previewText = body.previewText ? String(body.previewText).trim() : undefined;

  // CSV-parsed recipients arrive as an array of { email, name } from the client
  const csvRecipients: Recipient[] = Array.isArray(body.csvRecipients)
    ? body.csvRecipients
        .map((r: any) => ({ email: String(r?.email || "").trim(), name: r?.name ? String(r.name) : null }))
        .filter((r: Recipient) => r.email.includes("@"))
    : [];

  // Optional meeting invite block
  const meeting: MeetingDetails | null =
    body.meeting && body.meeting.title && body.meeting.start
      ? {
          title: String(body.meeting.title).trim(),
          start: String(body.meeting.start),
          durationMinutes: Number(body.meeting.durationMinutes) || 30,
          location: body.meeting.location ? String(body.meeting.location).trim() : undefined,
          description: body.meeting.description ? String(body.meeting.description).trim() : undefined,
        }
      : null;

  if (!subject) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!bodyHtml || bodyHtml.length < 10)
    return NextResponse.json({ error: "Email body is required." }, { status: 400 });

  // Append the meeting block (with Google Calendar link) to the body when present
  if (meeting) bodyHtml += renderMeetingSection(meeting);

  // Build recipient list from segment + manual list + CSV upload
  const recipientMap = new Map<string, Recipient>();
  if (segment) {
    for (const r of await resolveSegment(service, segment)) recipientMap.set(r.email, r);
  }
  for (const r of parseManualEmails(manualRaw)) {
    if (!recipientMap.has(r.email)) recipientMap.set(r.email, r);
  }
  for (const r of csvRecipients) {
    const email = r.email.toLowerCase();
    if (!recipientMap.has(email)) recipientMap.set(email, { email, name: r.name });
  }
  const recipients = Array.from(recipientMap.values());

  if (recipients.length === 0)
    return NextResponse.json({ error: "No valid recipients found." }, { status: 400 });

  // Enforce rate limits
  const usage = await getRateUsage(service);
  if (recipients.length > usage.dailyRemaining) {
    return NextResponse.json(
      {
        error: `This send (${recipients.length}) exceeds the remaining daily limit (${usage.dailyRemaining} of ${DAILY_LIMIT}). Reduce recipients or try again tomorrow.`,
      },
      { status: 429 }
    );
  }
  if (recipients.length > usage.monthlyRemaining) {
    return NextResponse.json(
      {
        error: `This send (${recipients.length}) exceeds the remaining monthly limit (${usage.monthlyRemaining} of ${MONTHLY_LIMIT}).`,
      },
      { status: 429 }
    );
  }

  const sender = resolveSender(fromKey);

  const result = await createAndSendCampaign({
    service,
    fromKey: sender.key,
    subject,
    bodyHtml,
    previewText,
    recipients,
    segment,
    manualEmails: parseManualEmails(manualRaw).map((r) => r.email),
    createdBy: ctx.userId,
    createdByEmail: ctx.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Could not send campaign." }, { status: 500 });
  }

  await logAuditEntry(service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "mass_email.send",
    resource_type: "email_campaign",
    resource_id: result.campaignId,
    summary: `Sent "${subject}" to ${result.sent} recipient(s) via ${sender.address}`,
    metadata: { sent: result.sent, failed: result.failed, segment, from: sender.from },
  });

  return NextResponse.json({ ok: true, campaignId: result.campaignId, sent: result.sent, failed: result.failed });
}
