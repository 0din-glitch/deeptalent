import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  resolveSender,
  renderCampaignHtml,
  type Recipient,
  type SenderOption,
} from "@/lib/email/mass";

export type SendCampaignResult = {
  ok: boolean;
  campaignId: string | null;
  sent: number;
  failed: number;
  error?: string;
};

/**
 * Creates an email_campaigns row, queues email_sends rows, and sends via Resend
 * in batches of 100. Shared by the manual mass-email route and the automation
 * cron dispatcher so sending behavior stays identical everywhere.
 *
 * Recipients must already be de-duplicated and within rate limits — callers own
 * segment resolution and limit enforcement.
 */
export async function createAndSendCampaign(opts: {
  service: SupabaseClient;
  fromKey: string;
  subject: string;
  bodyHtml: string; // raw body (already includes any meeting block)
  previewText?: string;
  recipients: Recipient[];
  segment?: string | null;
  manualEmails?: string[];
  automationId?: string | null;
  createdBy?: string | null;
  createdByEmail?: string | null;
}): Promise<SendCampaignResult> {
  const { service, recipients } = opts;

  if (!process.env.RESEND_API_KEY) {
    return { ok: false, campaignId: null, sent: 0, failed: 0, error: "RESEND_API_KEY not configured" };
  }
  if (recipients.length === 0) {
    return { ok: false, campaignId: null, sent: 0, failed: 0, error: "No recipients" };
  }

  const sender: SenderOption = resolveSender(opts.fromKey);
  const html = renderCampaignHtml({
    subject: opts.subject,
    bodyHtml: opts.bodyHtml,
    replyTo: sender.replyTo,
    previewText: opts.previewText,
  });

  // Create the campaign row
  const { data: campaign, error: campErr } = await service
    .from("email_campaigns")
    .insert({
      subject: opts.subject,
      from_key: sender.key,
      from_email: sender.from,
      reply_to: sender.replyTo,
      preview_text: opts.previewText || null,
      body_html: opts.bodyHtml,
      segment: opts.segment ?? null,
      manual_emails: opts.manualEmails ?? [],
      automation_id: opts.automationId ?? null,
      status: "sending",
      total_recipients: recipients.length,
      created_by: opts.createdBy ?? null,
      created_by_email: opts.createdByEmail ?? null,
    })
    .select()
    .single();

  if (campErr || !campaign) {
    return { ok: false, campaignId: null, sent: 0, failed: 0, error: campErr?.message || "Could not create campaign" };
  }

  // Queue send rows
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
          subject: opts.subject,
          html,
          headers: { "X-Campaign-Id": campaign.id },
          tags: [{ name: "campaign_id", value: campaign.id }],
        }))
      );

      if (error) throw new Error(error.message);

      const ids = (data as any)?.data ?? [];
      for (let j = 0; j < slice.length; j++) {
        const rowId = rowByEmail.get(slice[j].email);
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

  return { ok: true, campaignId: campaign.id, sent, failed };
}
