import type { SupabaseClient } from "@supabase/supabase-js";
import {
  resolveSegment,
  getRateUsage,
  type Recipient,
  type SegmentKey,
} from "@/lib/email/mass";
import { createAndSendCampaign } from "@/lib/email/send";

export type Recurrence = "once" | "daily" | "weekly" | "monthly";

export const RECURRENCES: { key: Recurrence; label: string; description: string }[] = [
  { key: "once", label: "One-time", description: "Sends once at the scheduled time, then turns off." },
  { key: "daily", label: "Daily", description: "Repeats every day at the scheduled time." },
  { key: "weekly", label: "Weekly", description: "Repeats every week on the same day/time." },
  { key: "monthly", label: "Monthly", description: "Repeats every month on the same date/time." },
];

/** Computes the next run timestamp after `from` for a given recurrence. */
export function computeNextRun(recurrence: Recurrence, from: Date): Date | null {
  const d = new Date(from);
  switch (recurrence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      return d;
    case "weekly":
      d.setDate(d.getDate() + 7);
      return d;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      return d;
    case "once":
    default:
      return null;
  }
}

type AutomationRow = {
  id: string;
  name: string;
  recurrence: Recurrence;
  from_key: string;
  subject: string;
  preview_text: string | null;
  body_html: string;
  segment: string | null;
  manual_emails: string[] | null;
  next_run_at: string | null;
  created_by: string | null;
  created_by_email: string | null;
};

async function buildRecipients(service: SupabaseClient, row: AutomationRow): Promise<Recipient[]> {
  const map = new Map<string, Recipient>();
  if (row.segment) {
    for (const r of await resolveSegment(service, row.segment as SegmentKey)) map.set(r.email, r);
  }
  for (const raw of row.manual_emails ?? []) {
    const email = String(raw || "").trim().toLowerCase();
    if (email.includes("@") && !map.has(email)) map.set(email, { email, name: null });
  }
  return Array.from(map.values());
}

export type AutomationRunSummary = {
  processed: number;
  sent: number;
  results: { id: string; name: string; status: string; sent: number }[];
};

/**
 * Finds all enabled automations that are due (next_run_at <= now) and sends them,
 * respecting the shared daily/monthly rate limits. Recurring automations get their
 * next_run_at rolled forward; one-time automations are disabled after running.
 */
export async function runDueAutomations(service: SupabaseClient): Promise<AutomationRunSummary> {
  const now = new Date();
  const { data: due } = await service
    .from("email_automations")
    .select("*")
    .eq("enabled", true)
    .not("next_run_at", "is", null)
    .lte("next_run_at", now.toISOString())
    .order("next_run_at", { ascending: true })
    .limit(25);

  const summary: AutomationRunSummary = { processed: 0, sent: 0, results: [] };

  for (const row of (due ?? []) as AutomationRow[]) {
    summary.processed += 1;
    let status = "sent";
    let sentCount = 0;

    try {
      const recipients = await buildRecipients(service, row);
      if (recipients.length === 0) {
        status = "no_recipients";
      } else {
        // Enforce rate limits — cap this run to what's remaining.
        const usage = await getRateUsage(service);
        const cap = Math.min(usage.dailyRemaining, usage.monthlyRemaining);
        if (cap <= 0) {
          status = "rate_limited";
        } else {
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
            createdBy: row.created_by,
            createdByEmail: row.created_by_email,
          });
          sentCount = result.sent;
          status = result.ok ? (slice.length < recipients.length ? "partial_rate_limited" : "sent") : "failed";
        }
      }
    } catch (err: any) {
      status = "failed";
      console.error("[automations] run failed", row.id, err?.message);
    }

    const nextRun = computeNextRun(row.recurrence, now);
    await service
      .from("email_automations")
      .update({
        last_run_at: now.toISOString(),
        last_status: status,
        last_sent_count: sentCount,
        next_run_at: nextRun ? nextRun.toISOString() : null,
        enabled: row.recurrence === "once" ? false : true,
        updated_at: now.toISOString(),
      })
      .eq("id", row.id)
      // increment counters
      .select("id");

    // Increment aggregate counters separately (Supabase has no atomic inc here; read-modify-write)
    const { data: fresh } = await service
      .from("email_automations")
      .select("total_runs, total_sent")
      .eq("id", row.id)
      .single();
    if (fresh) {
      await service
        .from("email_automations")
        .update({ total_runs: (fresh.total_runs || 0) + 1, total_sent: (fresh.total_sent || 0) + sentCount })
        .eq("id", row.id);
    }

    summary.sent += sentCount;
    summary.results.push({ id: row.id, name: row.name, status, sent: sentCount });
  }

  return summary;
}
