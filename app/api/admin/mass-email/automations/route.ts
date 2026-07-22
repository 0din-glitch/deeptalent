import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";
import { parseManualEmails } from "@/lib/email/mass";
import type { Recurrence } from "@/lib/email/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_RECURRENCE: Recurrence[] = ["once", "daily", "weekly", "monthly"];

// ── GET: list automations ────────────────────────────────────────────────────
export async function GET() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const { data } = await ctx.service
    .from("email_automations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ automations: data ?? [] });
}

// ── POST: create an automation ───────────────────────────────────────────────
export async function POST(request: Request) {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const subject = String(body.subject || "").trim();
  const bodyHtml = String(body.bodyHtml || "").trim();
  const recurrence: Recurrence = VALID_RECURRENCE.includes(body.recurrence) ? body.recurrence : "once";
  const fromKey = String(body.fromKey || "memo");
  const previewText = body.previewText ? String(body.previewText).trim() : null;
  const segment = body.segment ? String(body.segment) : null;
  const manualEmails = parseManualEmails(String(body.manualEmails || "")).map((r) => r.email);
  const enabled = body.enabled !== false;

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!subject) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!bodyHtml || bodyHtml.length < 10)
    return NextResponse.json({ error: "Email body is required." }, { status: 400 });
  if (!segment && manualEmails.length === 0)
    return NextResponse.json({ error: "Choose a segment or add manual recipients." }, { status: 400 });

  // Scheduled start time (from a datetime-local value on the client → ISO)
  let nextRunAt: string | null = null;
  if (body.startAt) {
    const d = new Date(body.startAt);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid start time." }, { status: 400 });
    nextRunAt = d.toISOString();
  } else {
    return NextResponse.json({ error: "A start date & time is required." }, { status: 400 });
  }

  const kind = recurrence === "once" ? "scheduled" : "recurring";

  const { data, error } = await ctx.service
    .from("email_automations")
    .insert({
      name,
      kind,
      recurrence,
      from_key: fromKey,
      subject,
      preview_text: previewText,
      body_html: bodyHtml,
      segment,
      manual_emails: manualEmails,
      enabled,
      next_run_at: nextRunAt,
      created_by: ctx.userId,
      created_by_email: ctx.email,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "mass_email.automation_create",
    resource_type: "email_automation",
    resource_id: data.id,
    summary: `Created ${recurrence} automation "${name}"`,
    metadata: { recurrence, segment, next_run_at: nextRunAt },
  });

  return NextResponse.json({ ok: true, automation: data });
}
