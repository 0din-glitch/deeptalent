import { NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendMeetingEmail,
  sendRejectionEmail,
  sendCustomEmail,
  sendNextStageEmail,
} from "@/lib/email/resend";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action =
  | "approve"
  | "schedule"
  | "reject"
  | "welcome"
  | "custom_email"
  | "next_stage";
type Kind = "talent_application" | "company_inquiry";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;
  const userData = { user: { id: ctx.userId, email: ctx.email } };

  // 2) Parse body
  let body: {
    kind: Kind;
    id: string;
    action: Action;
    meetingAt?: string;
    meetingLink?: string;
    note?: string;
    subject?: string;
    message?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    followUp?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    kind,
    id,
    action,
    meetingAt,
    meetingLink,
    note,
    subject,
    message,
    ctaLabel,
    ctaUrl,
    followUp,
  } = body || ({} as any);
  if (!kind || !id || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["talent_application", "company_inquiry"].includes(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  // 3) Service client for writes that bypass RLS
  const sb = ctx.service;
  const table = kind === "talent_application" ? "talent_applications" : "company_inquiries";

  const auditAction = (a: Action) =>
    `${kind}.${a === "welcome" ? "approve" : a}`;
  const auditTargetLabel = (row: any) =>
    kind === "talent_application"
      ? `${row.full_name} (${row.email})`
      : `${row.company_name} — ${row.role_title || row.role_category || "—"}`;

  // 4) Fetch the row
  const { data: row, error: fetchErr } = await sb.from(table).select("*").eq("id", id).single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const recipientEmail: string = row.email;
  const recipientName: string =
    kind === "talent_application" ? row.full_name : row.contact_name;
  const roleLabel = kind === "talent_application" ? "talent" : "company partner";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    new URL(request.url).origin;
  const loginUrl = `${baseUrl}/auth/login`;

  // 5) Branch on action
  if (action === "reject") {
    // Save a full snapshot for records BEFORE deleting the application.
    const { error: snapErr } = await sb.from("rejected_snapshots").insert({
      source_table: table,
      source_id: id,
      email: recipientEmail,
      full_name: recipientName,
      reason: note || null,
      snapshot: row,
      rejected_by: ctx.userId,
      rejected_by_email: ctx.email,
    });
    if (snapErr) {
      return NextResponse.json(
        { error: `Could not save record snapshot: ${snapErr.message}` },
        { status: 500 }
      );
    }

    // Notify the applicant, then permanently delete the application.
    const emailRes = await sendRejectionEmail({
      email: recipientEmail,
      fullName: recipientName,
      reason: note,
    });

    const { error: delErr } = await sb.from(table).delete().eq("id", id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    await logAuditEntry(sb, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: auditAction("reject"),
      resource_type: kind,
      resource_id: id,
      summary: `Rejected & removed ${auditTargetLabel(row)} (snapshot saved)`,
      metadata: { note: note || null, recipient: recipientEmail, snapshot_saved: true, deleted: true },
    });
    return NextResponse.json({ success: true, email: emailRes, deleted: true });
  }

  if (action === "next_stage") {
    const newStatus = kind === "talent_application" ? "approved" : "qualified";
    const { error: updErr } = await sb
      .from(table)
      .update({
        status: newStatus,
        decision_at: new Date().toISOString(),
        decided_by: userData.user.id,
        decision_note: note || null,
      })
      .eq("id", id);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    const emailRes = await sendNextStageEmail({
      email: recipientEmail,
      fullName: recipientName,
      roleLabel,
      loginUrl,
      customMessage: note,
    });
    await logAuditEntry(sb, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: auditAction("next_stage"),
      resource_type: kind,
      resource_id: id,
      summary: `Advanced ${auditTargetLabel(row)} to the next stage`,
      metadata: { note: note || null, recipient: recipientEmail },
    });
    return NextResponse.json({ success: true, email: emailRes });
  }

  if (action === "approve" || action === "welcome") {
    const newStatus = kind === "talent_application" ? "approved" : "qualified";
    const { error: updErr } = await sb
      .from(table)
      .update({
        status: newStatus,
        decision_at: new Date().toISOString(),
        decided_by: userData.user.id,
        decision_note: note || null,
      })
      .eq("id", id);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    const emailRes = await sendWelcomeEmail({
      email: recipientEmail,
      fullName: recipientName,
      roleLabel,
      loginUrl,
      customMessage: note,
    });
    await logAuditEntry(sb, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: auditAction("approve"),
      resource_type: kind,
      resource_id: id,
      summary: `Approved ${auditTargetLabel(row)}`,
      metadata: { note: note || null, recipient: recipientEmail },
    });
    return NextResponse.json({ success: true, email: emailRes });
  }

  if (action === "schedule") {
    if (!meetingAt || !meetingLink) {
      return NextResponse.json(
        { error: "meetingAt and meetingLink are required for scheduling" },
        { status: 400 }
      );
    }
    const meetingDate = new Date(meetingAt);
    if (isNaN(meetingDate.getTime())) {
      return NextResponse.json({ error: "Invalid meetingAt timestamp" }, { status: 400 });
    }

    const newStatus = kind === "talent_application" ? "approved" : "qualified";
    const { error: updErr } = await sb
      .from(table)
      .update({
        status: newStatus,
        decision_at: new Date().toISOString(),
        decided_by: userData.user.id,
        decision_note: note || null,
        meeting_at: meetingDate.toISOString(),
        meeting_link: meetingLink,
      })
      .eq("id", id);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    const emailRes = await sendMeetingEmail({
      email: recipientEmail,
      fullName: recipientName,
      meetingAt: meetingDate,
      meetingLink,
      customMessage: note,
      title: followUp
        ? "DeepTalent — Follow-up Interview"
        : kind === "talent_application"
        ? "DeepTalent — Talent Intro Call"
        : "DeepTalent — Partnership Call",
      subject: followUp
        ? `Your next DeepTalent interview — ${meetingDate.toLocaleString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}`
        : undefined,
    });
    await logAuditEntry(sb, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: auditAction("schedule"),
      resource_type: kind,
      resource_id: id,
      summary: `Scheduled meeting with ${auditTargetLabel(row)}`,
      metadata: {
        meeting_at: meetingDate.toISOString(),
        meeting_link: meetingLink,
        note: note || null,
        recipient: recipientEmail,
      },
    });
    return NextResponse.json({ success: true, email: emailRes });
  }

  if (action === "custom_email") {
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "subject and message are required" },
        { status: 400 }
      );
    }
    if (subject.length > 200 || message.length > 8000) {
      return NextResponse.json(
        { error: "subject or message exceeds maximum length" },
        { status: 400 }
      );
    }

    const emailRes = await sendCustomEmail({
      email: recipientEmail,
      fullName: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      ctaLabel: ctaLabel?.trim() || undefined,
      ctaUrl: ctaUrl?.trim() || undefined,
      replyTo: userData.user.email || undefined,
    });
    await logAuditEntry(sb, {
      actor_id: ctx.userId,
      actor_email: ctx.email,
      action: auditAction("custom_email"),
      resource_type: kind,
      resource_id: id,
      summary: `Sent custom email to ${recipientEmail}`,
      metadata: { subject: subject.trim(), recipient: recipientEmail },
    });
    return NextResponse.json({ success: true, email: emailRes });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
