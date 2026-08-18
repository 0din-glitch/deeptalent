import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_EMAILS } from "@/lib/admin/access";
import { resolveSender, renderCampaignHtml } from "@/lib/email/mass";

export type DigestResult = {
  ok: boolean;
  sent: number;
  failed: number;
  window: { since: string; until: string };
  counts: { applications: number; inquiries: number; interviews: number };
  error?: string;
};

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function statBlock(label: string, value: number, accent: string): string {
  return `
    <td style="padding:8px;">
      <div style="border:1px solid #E5E7EB;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:${accent};line-height:1;">${value}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:6px;text-transform:uppercase;letter-spacing:0.04em;">${esc(label)}</div>
      </div>
    </td>`;
}

function listSection(title: string, rows: string[]): string {
  if (rows.length === 0) {
    return `
      <h3 style="font-size:15px;color:#111827;margin:24px 0 8px;">${esc(title)}</h3>
      <p style="font-size:14px;color:#9CA3AF;margin:0;">Nothing new this week.</p>`;
  }
  return `
    <h3 style="font-size:15px;color:#111827;margin:24px 0 8px;">${esc(title)}</h3>
    <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
      ${rows.map((r) => `<li>${r}</li>`).join("")}
    </ul>`;
}

/**
 * Builds and sends the weekly activity digest to the admin team. Summarizes
 * new talent applications, company inquiries, and AI interviews from the past
 * `days` window. Sent to ADMIN_EMAILS only.
 */
export async function sendAdminWeeklyDigest(
  service: SupabaseClient,
  opts: { days?: number } = {}
): Promise<DigestResult> {
  const days = opts.days ?? 7;
  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  const emptyWindow = { since: sinceIso, until: until.toISOString() };

  if (!process.env.RESEND_API_KEY) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      window: emptyWindow,
      counts: { applications: 0, inquiries: 0, interviews: 0 },
      error: "RESEND_API_KEY not configured",
    };
  }

  // Pull recent activity in parallel. Kept resilient: a failing table becomes [].
  const [appsRes, inqRes, intRes] = await Promise.all([
    service
      .from("talent_applications")
      .select("full_name, email, specialization, status, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false }),
    service
      .from("company_inquiries")
      .select("company_name, contact_name, email, status, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false }),
    service
      .from("talent_interviews")
      .select("candidate_name, email, overall_score, score_band, status, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false }),
  ]);

  const apps = appsRes.data ?? [];
  const inquiries = inqRes.data ?? [];
  const interviews = intRes.data ?? [];

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const appRows = apps.slice(0, 15).map(
    (a: any) =>
      `<strong>${esc(a.full_name || a.email)}</strong> — ${esc(a.specialization || "role n/a")} <span style="color:#9CA3AF;">(${esc(a.status || "pending")}, ${fmtDate(a.created_at)})</span>`
  );
  const inqRows = inquiries.slice(0, 15).map(
    (c: any) =>
      `<strong>${esc(c.company_name || c.contact_name || c.email)}</strong> <span style="color:#9CA3AF;">(${esc(c.status || "new")}, ${fmtDate(c.created_at)})</span>`
  );
  const intRows = interviews.slice(0, 15).map(
    (i: any) =>
      `<strong>${esc(i.candidate_name || i.email)}</strong> — score ${esc(i.overall_score ?? "—")} ${i.score_band ? `(${esc(i.score_band)})` : ""} <span style="color:#9CA3AF;">${fmtDate(i.created_at)}</span>`
  );

  const rangeLabel = `${since.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${until.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const bodyHtml = `
    <p style="font-size:14px;color:#6B7280;margin:0 0 20px;">Activity summary for ${esc(rangeLabel)}.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        ${statBlock("New applications", apps.length, "#3B5BDB")}
        ${statBlock("Company inquiries", inquiries.length, "#3B5BDB")}
        ${statBlock("AI interviews", interviews.length, "#3B5BDB")}
      </tr>
    </table>
    ${listSection("New talent applications", appRows)}
    ${listSection("New company inquiries", inqRows)}
    ${listSection("New AI interviews", intRows)}
    <p style="margin:28px 0 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.deeptalentplatform.com"}/admin"
         style="display:inline-block;background:#3B5BDB;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:9999px;">
        Open the admin dashboard
      </a>
    </p>`;

  const sender = resolveSender("memo");
  const subject = `DeepTalent weekly summary · ${rangeLabel}`;
  const html = renderCampaignHtml({
    subject,
    bodyHtml,
    replyTo: sender.replyTo,
    previewText: `${apps.length} applications, ${inquiries.length} inquiries, ${interviews.length} interviews this week.`,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  let failed = 0;
  try {
    const { error } = await resend.batch.send(
      ADMIN_EMAILS.map((to) => ({
        from: sender.from,
        to,
        replyTo: sender.replyTo,
        subject,
        html,
      }))
    );
    if (error) throw new Error(error.message);
    sent = ADMIN_EMAILS.length;
  } catch (err: any) {
    failed = ADMIN_EMAILS.length;
    return {
      ok: false,
      sent,
      failed,
      window: emptyWindow,
      counts: { applications: apps.length, inquiries: inquiries.length, interviews: interviews.length },
      error: err?.message || "Send failed",
    };
  }

  return {
    ok: true,
    sent,
    failed,
    window: emptyWindow,
    counts: { applications: apps.length, inquiries: inquiries.length, interviews: interviews.length },
  };
}
