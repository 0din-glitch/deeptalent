import type { SupabaseClient } from "@supabase/supabase-js";

// ── Sending limits ──────────────────────────────────────────────────────────
export const DAILY_LIMIT = 100;
export const MONTHLY_LIMIT = 3000;

// ── Sender domain / addresses ───────────────────────────────────────────────
// Domain is read from an env var so it can be swapped to the new domain later
// without a code change. Defaults to the current verified domain.
export function massEmailDomain(): string {
  return (process.env.MASS_EMAIL_DOMAIN || "deeptalentplatform.com").trim().replace(/^@/, "");
}

export type SenderKey = "partnership" | "memo" | "noreply";

export type SenderOption = {
  key: SenderKey;
  label: string;
  description: string;
  from: string;
  address: string;
  replyTo: string;
};

export function senderOptions(): SenderOption[] {
  const domain = massEmailDomain();
  const replyInbox = `mail@${domain}`;
  return [
    {
      key: "partnership",
      label: "Partnerships",
      description: "Outreach & partnership proposals",
      address: `partnership@${domain}`,
      from: `DeepTalent Partnerships <partnership@${domain}>`,
      replyTo: `partnership@${domain}`,
    },
    {
      key: "memo",
      label: "Memo / Announcements",
      description: "Company memos & announcements",
      address: `memo@${domain}`,
      from: `DeepTalent <memo@${domain}>`,
      replyTo: replyInbox,
    },
    {
      key: "noreply",
      label: "No-reply",
      description: "Transactional / no-reply notices",
      address: `noreply@${domain}`,
      from: `DeepTalent <noreply@${domain}>`,
      replyTo: replyInbox,
    },
  ];
}

export function resolveSender(key: string): SenderOption {
  const opts = senderOptions();
  return opts.find((o) => o.key === key) || opts[opts.length - 1];
}

// ── Segments ────────────────────────────────────────────────────────────────
export type SegmentKey =
  | "all_users"
  | "talents"
  | "approved_talents"
  | "companies"
  | "leads";

export const SEGMENTS: { key: SegmentKey; label: string; description: string }[] = [
  { key: "all_users", label: "All users", description: "Everyone with a profile & email" },
  { key: "talents", label: "All talents", description: "Profiles with the talent role" },
  { key: "approved_talents", label: "Approved talent", description: "Talents with an approved application" },
  { key: "companies", label: "Companies", description: "Company accounts & inquiry contacts" },
  { key: "leads", label: "Contact leads", description: "People who used the contact form" },
];

export type Recipient = { email: string; name: string | null };

function dedupeByEmail(list: Recipient[]): Recipient[] {
  const map = new Map<string, Recipient>();
  for (const r of list) {
    const email = (r.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    if (!map.has(email)) map.set(email, { email, name: r.name || null });
  }
  return Array.from(map.values());
}

/** Resolves a segment key to a de-duplicated recipient list using the service client. */
export async function resolveSegment(
  service: SupabaseClient,
  segment: SegmentKey
): Promise<Recipient[]> {
  const out: Recipient[] = [];

  if (segment === "all_users" || segment === "talents" || segment === "companies") {
    let q = service.from("profiles").select("email, full_name, role").not("email", "is", null);
    if (segment === "talents") q = q.eq("role", "talent");
    if (segment === "companies") q = q.eq("role", "company");
    const { data } = await q.limit(5000);
    for (const p of data ?? []) out.push({ email: p.email, name: p.full_name });
  }

  if (segment === "approved_talents") {
    const { data } = await service
      .from("talent_applications")
      .select("email, full_name, status")
      .eq("status", "approved")
      .not("email", "is", null)
      .limit(5000);
    for (const r of data ?? []) out.push({ email: r.email, name: r.full_name });
  }

  if (segment === "companies") {
    const { data } = await service
      .from("company_inquiries")
      .select("email, contact_name")
      .not("email", "is", null)
      .limit(5000);
    for (const r of data ?? []) out.push({ email: r.email, name: r.contact_name });
  }

  if (segment === "leads") {
    const { data } = await service
      .from("contact_messages")
      .select("email, name")
      .not("email", "is", null)
      .limit(5000);
    for (const r of data ?? []) out.push({ email: r.email, name: r.name });
  }

  return dedupeByEmail(out);
}

/** Parses a free-text blob of emails (comma / newline / semicolon separated). */
export function parseManualEmails(raw: string): Recipient[] {
  if (!raw) return [];
  const parts = raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  return dedupeByEmail(parts.map((email) => ({ email, name: null })));
}

// ── Rate-limit usage ─────────────────────────────────────────────────────────
export type RateUsage = {
  sentToday: number;
  sentThisMonth: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyRemaining: number;
  monthlyRemaining: number;
};

export async function getRateUsage(service: SupabaseClient): Promise<RateUsage> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ count: dayCount }, { count: monthCount }] = await Promise.all([
    service
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .neq("status", "failed"),
    service
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth)
      .neq("status", "failed"),
  ]);

  const sentToday = dayCount ?? 0;
  const sentThisMonth = monthCount ?? 0;
  return {
    sentToday,
    sentThisMonth,
    dailyLimit: DAILY_LIMIT,
    monthlyLimit: MONTHLY_LIMIT,
    dailyRemaining: Math.max(0, DAILY_LIMIT - sentToday),
    monthlyRemaining: Math.max(0, MONTHLY_LIMIT - sentThisMonth),
  };
}

/** Wraps raw campaign HTML in a branded, email-safe shell. */
export function renderCampaignHtml(opts: {
  subject: string;
  bodyHtml: string;
  replyTo: string;
  previewText?: string;
}): string {
  const preview = opts.previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.previewText}</div>`
    : "";
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
${preview}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0F1629;padding:24px 32px;">
<span style="color:#ffffff;font-size:18px;font-weight:700;">DeepTalent</span>
</td></tr>
<tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 32px 28px 32px;">
<p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;border-top:1px solid #e5e7eb;padding-top:16px;">
Replies go to <a href="mailto:${opts.replyTo}" style="color:#3B5BDB;text-decoration:none;">${opts.replyTo}</a>.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
