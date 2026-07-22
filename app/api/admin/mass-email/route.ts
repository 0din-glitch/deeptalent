import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import {
  senderOptions,
  resolveSender,
  resolveSegment,
  parseManualEmails,
  getRateUsage,
  renderCampaignHtml,
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
  const html = renderCampaignHtml({ subject, bodyHtml, replyTo: sender.replyTo, previewText });

  // Create the campaign row
  const { data: campaign, error: campErr } = await service
    .from("email_campaigns")
    .insert({
      subject,
      from_key: sender.key,
      from_email: sender.from,
      reply_to: sender.replyTo,
      preview_text: previewText || null,
      body_html: bodyHtml,
      segment,
      manual_emails: parseManualEmails(manualRaw).map((r) => r.email),
      status: "sending",
      total_recipients: recipients.length,
      created_by: ctx.userId,
      created_by_email: ctx.email,
    })
    .select()
    .single();

  if (campErr || !campaign)
    return NextResponse.json({ error: campErr?.message || "Could not create campaign." }, { status: 500 });

  // Insert queued send rows
  const { data: sendRows } = await service
    .from("email_sends")
    .insert(
      recipients.map((r) => ({
        campaign_id: campaign.id,
        email: r.email,
        name: r.name,
        status: "queued",
      }))
    )
    .select();

  // Send via Resend in batches of 100
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rowByEmail = new Map<string, string>();
  for (const row of sendRows ?? []) rowByEmail.set(row.email, row.id);

  let sent = 0;
  let failed = 0;
  const BATCH = 100;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const slice = recipients.slice(i, i + BATCH);
    try {
      const { data, error } = await resend.batch.send(
        slice.map((r) => ({
          from: sender.from,
          to: r.email,
          replyTo: sender.replyTo,
          subject,
          html,
          headers: { "X-Campaign-Id": campaign.id },
          tags: [{ name: "campaign_id", value: campaign.id }],
        }))
      );

      if (error) throw new Error(error.message);

      const ids = (data as any)?.data ?? [];
      for (let j = 0; j < slice.length; j++) {
        const email = slice[j].email;
        const rowId = rowByEmail.get(email);
        const resendId = ids[j]?.id ?? null;
        if (rowId) {
          await service
            .from("email_sends")
            .update({ status: "sent", resend_id: resendId, sent_at: new Date().toISOString() })
            .eq("id", rowId);
        }
        sent += 1;
      }
    } catch (err: any) {
      for (const r of slice) {
        const rowId = rowByEmail.get(r.email);
        if (rowId) {
          await service
            .from("email_sends")
            .update({ status: "failed", error: err?.message || "Send failed" })
            .eq("id", rowId);
        }
        failed += 1;
      }
    }
  }

  const finalStatus = failed === 0 ? "sent" : sent === 0 ? "failed" : "sent";
  await service
    .from("email_campaigns")
    .update({
      status: finalStatus,
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  await logAuditEntry(service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "mass_email.send",
    resource_type: "email_campaign",
    resource_id: campaign.id,
    summary: `Sent "${subject}" to ${sent} recipient(s) via ${sender.address}`,
    metadata: { sent, failed, segment, from: sender.from },
  });

  return NextResponse.json({ ok: true, campaignId: campaign.id, sent, failed });
}
