import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import { resolveSegment, getRateUsage, type SegmentKey, type Recipient } from "@/lib/email/mass";
import { createAndSendCampaign } from "@/lib/email/send";
import { computeNextRun, type Recurrence } from "@/lib/email/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── PATCH: toggle enabled / edit fields ──────────────────────────────────────
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.subject === "string") patch.subject = body.subject.trim();
  if (typeof body.bodyHtml === "string") patch.body_html = body.bodyHtml;
  if (typeof body.previewText === "string") patch.preview_text = body.previewText.trim() || null;
  if (typeof body.fromKey === "string") patch.from_key = body.fromKey;
  if (typeof body.segment === "string" || body.segment === null) patch.segment = body.segment || null;
  if (body.startAt) {
    const d = new Date(body.startAt);
    if (!isNaN(d.getTime())) patch.next_run_at = d.toISOString();
  }

  const { data, error } = await ctx.service
    .from("email_automations")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, automation: data });
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;

  const { error } = await ctx.service.from("email_automations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "mass_email.automation_delete",
    resource_type: "email_automation",
    resource_id: id,
    summary: `Deleted automation ${id}`,
  });
  return NextResponse.json({ ok: true });
}

// ── POST: run an automation immediately (manual trigger / test) ───────────────
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const service = ctx.service;

  const { data: row } = await service.from("email_automations").select("*").eq("id", id).single();
  if (!row) return NextResponse.json({ error: "Automation not found." }, { status: 404 });

  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ error: "Email sending is not configured (RESEND_API_KEY)." }, { status: 400 });

  // Build recipients
  const map = new Map<string, Recipient>();
  if (row.segment) {
    for (const r of await resolveSegment(service, row.segment as SegmentKey)) map.set(r.email, r);
  }
  for (const raw of row.manual_emails ?? []) {
    const email = String(raw || "").trim().toLowerCase();
    if (email.includes("@") && !map.has(email)) map.set(email, { email, name: null });
  }
  const recipients = Array.from(map.values());
  if (recipients.length === 0)
    return NextResponse.json({ error: "No recipients resolved for this automation." }, { status: 400 });

  const usage = await getRateUsage(service);
  const cap = Math.min(usage.dailyRemaining, usage.monthlyRemaining);
  if (cap <= 0) return NextResponse.json({ error: "Sending limit reached for now." }, { status: 429 });

  const slice = recipients.slice(0, cap);
  const result = await createAndSendCampaign({
    service,
    fromKey: row.from_key,
    subject: row.subject,
    bodyHtml: row.body_html,
    previewText: row.preview_text || undefined,
    recipients: slice,
    segment: row.segment,
    manualEmails: row.manual_emails ?? [],
    automationId: row.id,
    createdBy: ctx.userId,
    createdByEmail: ctx.email,
  });

  const now = new Date();
  const nextRun = computeNextRun(row.recurrence as Recurrence, now);
  await service
    .from("email_automations")
    .update({
      last_run_at: now.toISOString(),
      last_status: result.ok ? "sent" : "failed",
      last_sent_count: result.sent,
      total_runs: (row.total_runs || 0) + 1,
      total_sent: (row.total_sent || 0) + result.sent,
      // one-time automations turn off after a manual run too; recurring keep going
      next_run_at: row.recurrence === "once" ? null : nextRun ? nextRun.toISOString() : row.next_run_at,
      enabled: row.recurrence === "once" ? false : row.enabled,
      updated_at: now.toISOString(),
    })
    .eq("id", id);

  await logAuditEntry(service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "mass_email.automation_run",
    resource_type: "email_automation",
    resource_id: id,
    summary: `Ran automation "${row.name}" → ${result.sent} sent`,
    metadata: { sent: result.sent, failed: result.failed },
  });

  if (!result.ok) return NextResponse.json({ error: result.error || "Send failed." }, { status: 500 });
  return NextResponse.json({ ok: true, sent: result.sent, failed: result.failed });
}
