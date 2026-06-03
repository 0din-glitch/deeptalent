import { Resend } from "resend";
import React from "react";

// Resend requires either `email@example.com` or `Name <email@example.com>`.
// Validate/normalize the env var so a malformed value falls back to a working one.
const EMAIL_REGEX = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const NAMED_EMAIL_REGEX = /^.+\s<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>$/;

// Verified domain for DeepTalent on Resend
const DEFAULT_FROM = "DeepTalent <noreply@deeptalentplatform.com>";

function resolveFromEmail(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return DEFAULT_FROM;

  if (EMAIL_REGEX.test(raw) || NAMED_EMAIL_REGEX.test(raw)) {
    return raw;
  }

  // Strip stray quotes/brackets and try again
  const cleaned = raw.replace(/^["'<]+|["'>]+$/g, "").trim();
  if (EMAIL_REGEX.test(cleaned)) return `DeepTalent <${cleaned}>`;

  console.error(
    `[Resend] RESEND_FROM_EMAIL is invalid: "${raw}". Expected "email@domain.com" or "Name <email@domain.com>". Falling back to ${DEFAULT_FROM}.`
  );
  return DEFAULT_FROM;
}

export const FROM_EMAIL = resolveFromEmail();

// All replies to DeepTalent mail route to this shared inbox.
export const REPLY_TO_EMAIL = "mail@deeptalentplatform.com";

// Small reusable footer line stating where replies go. Inserted into the
// body of every transactional email so it's visible in the text/HTML itself.
const REPLY_NOTICE_HTML = `<p style="margin:14px 0 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">All replies go to <a href="mailto:${REPLY_TO_EMAIL}" style="color:#3B5BDB;text-decoration:none;">${REPLY_TO_EMAIL}</a>.</p>`;

// Centered footer banner injected right before </body> in minified templates.
const REPLY_NOTICE_BANNER = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 24px 0;"><p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">All replies go to <a href="mailto:${REPLY_TO_EMAIL}" style="color:#3B5BDB;text-decoration:none;">${REPLY_TO_EMAIL}</a>.</p></td></tr></table>`;

// Inserts the reply-routing notice just before the closing body tag so it
// renders in the visible body of any HTML email.
function withReplyNotice(html: string): string {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${REPLY_NOTICE_BANNER}</body>`);
  }
  return html + REPLY_NOTICE_BANNER;
}

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Resend] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendConfirmationEmail(
  email: string,
  fullName: string,
  confirmLink: string
) {
  try {
    const resend = getResendClient();
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Confirm your email</h1>
          <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">Hi ${fullName},</p>
          <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">Welcome to DeepTalent! Please confirm your email address to complete your account setup.</p>
          <div style="margin-bottom: 30px;">
            <a href="${confirmLink}" style="display: inline-block; padding: 12px 32px; background-color: #3B5BDB; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Confirm Email</a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 10px;">Or copy this link: <a href="${confirmLink}" style="color: #3B5BDB;">${confirmLink}</a></p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">This link expires in 24 hours. If you didn't sign up for DeepTalent, please ignore this email.</p>
          ${REPLY_NOTICE_HTML}
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO_EMAIL,
      subject: "Confirm your DeepTalent account",
      html,
    });

    if (result.error) {
      console.error("[Resend] Confirmation email API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }

    console.log("[Resend] Confirmation email sent:", { to: email, id: result.data?.id });
    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Confirmation email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  resetLink: string
) {
  try {
    const resend = getResendClient();
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Reset your password</h1>
          <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">Hi ${fullName},</p>
          <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">We received a request to reset your DeepTalent password. Click the button below to set a new password.</p>
          <div style="margin-bottom: 30px;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background-color: #3B5BDB; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 10px;">Or copy this link: <a href="${resetLink}" style="color: #3B5BDB;">${resetLink}</a></p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email or contact support.</p>
          ${REPLY_NOTICE_HTML}
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO_EMAIL,
      subject: "Reset your DeepTalent password",
      html,
    });

    if (result.error) {
      console.error("[Resend] Password reset API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }

    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Password reset email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

export async function sendTemporaryPasswordEmail(
  email: string,
  fullName: string,
  tempPassword: string,
  loginUrl: string
) {
  try {
    const resend = getResendClient();
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
            .email-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            .header { background: linear-gradient(135deg, #3B5BDB 0%, #2d42a6 100%); color: white; padding: 48px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; font-weight: 500; margin-bottom: 20px; color: #1f2937; }
            .message { color: #6b7280; font-size: 15px; line-height: 1.8; margin-bottom: 32px; }
            .password-box { background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 2px solid #e5e7eb; border-radius: 10px; padding: 28px; margin: 32px 0; text-align: center; }
            .password-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; display: block; }
            .password { font-family: 'Monaco', 'Courier New', monospace; font-size: 28px; font-weight: 700; color: #1f2937; letter-spacing: 3px; word-spacing: 8px; word-break: break-all; }
            .cta-section { margin: 32px 0; text-align: center; }
            .cta-button { display: inline-block; background-color: #3B5BDB; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(59, 91, 219, 0.25); transition: all 0.2s; }
            .cta-button:hover { background-color: #2d42a6; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 91, 219, 0.3); }
            .security-notice { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 6px; margin: 32px 0; font-size: 13px; color: #7f1d1d; line-height: 1.6; }
            .security-notice strong { color: #991b1b; font-weight: 600; }
            .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #9ca3af; }
            .footer p { margin: 6px 0; }
            .signature { font-weight: 500; color: #6b7280; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>Password Reset</h1>
                <p>Your temporary login credentials</p>
              </div>
              
              <div class="content">
                <div class="greeting">Hi ${fullName},</div>
                
                <div class="message">
                  Your account password has been reset by an administrator. Use the temporary password below to log in to DeepTalent, then change it to something only you know.
                </div>

                <div class="password-box">
                  <span class="password-label">Your Temporary Password</span>
                  <div class="password">${tempPassword}</div>
                </div>

                <div class="cta-section">
                  <a href="${loginUrl}" class="cta-button">Log In to DeepTalent</a>
                </div>

                <div class="security-notice">
                  <strong>🔐 Security reminder:</strong> Never share this password with anyone. Change it immediately after logging in. If you didn't request this reset, contact support right away.
                </div>

                <div class="message">
                  <p>If you have any trouble logging in or need assistance, our support team is here to help.</p>
                </div>

                <div class="footer">
                  <p style="margin-bottom: 12px; font-weight: 500; color: #6b7280;">DeepTalent</p>
                  <p>© ${new Date().getFullYear()} DeepTalent. All rights reserved.</p>
                  <p style="margin-top: 8px; opacity: 0.7;">All replies go to ${REPLY_TO_EMAIL}.</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO_EMAIL,
      subject: "Your temporary password for DeepTalent",
      html,
    });

    if (result.error) {
      console.error("[Resend] Temp password API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }

    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Temporary password email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ---------------------------------------------------------------------------
// Welcome / Approval email — uses the welcome-email template
// ---------------------------------------------------------------------------
function welcomeHtml(opts: {
  fullName: string;
  roleLabel: string;
  loginUrl: string;
  customMessage?: string;
}) {
  const customBlock = opts.customMessage
    ? `<div style="background:#eef2ff;border-left:4px solid #3B5BDB;border-radius:6px;padding:16px 20px;margin:0 0 22px 0;font-size:14px;color:#1e3a8a;line-height:1.7;">${opts.customMessage}</div>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Welcome to DeepTalent</title></head><body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#374151;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06);"><tr><td style="background:linear-gradient(135deg,#3B5BDB 0%,#2d42a6 100%);padding:48px 32px;text-align:center;color:#ffffff;"><p style="margin:0;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;opacity:.85;">DeepTalent</p><h1 style="margin:10px 0 0 0;font-size:30px;font-weight:700;letter-spacing:-0.5px;">Welcome aboard</h1><p style="margin:8px 0 0 0;font-size:15px;opacity:.92;">You&rsquo;re officially in.</p></td></tr><tr><td style="padding:40px 32px 8px 32px;"><p style="margin:0 0 16px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${opts.fullName},</p><p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#4b5563;">Great news &mdash; your application has been reviewed and approved. Welcome to DeepTalent as a ${opts.roleLabel}. We&rsquo;re excited to have you in the network.</p>${customBlock}<p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:#4b5563;">Head to your dashboard to complete your profile, review next steps, and stay close to new opportunities.</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px auto;"><tr><td align="center" style="border-radius:8px;background:#3B5BDB;"><a href="${opts.loginUrl}" style="display:inline-block;padding:13px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Open my dashboard</a></td></tr></table></td></tr><tr><td style="padding:24px 32px 36px 32px;"><div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px 20px;"><p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;">What&rsquo;s next</p><p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">Our team will reach out shortly with next steps. If we&rsquo;ve scheduled a call with you, you&rsquo;ll receive a separate meeting invite.</p></div></td></tr><tr><td style="padding:0 32px 32px 32px;border-top:1px solid #e5e7eb;text-align:center;"><p style="margin:20px 0 4px 0;font-size:13px;color:#6b7280;font-weight:500;">DeepTalent</p><p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} DeepTalent Platform. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function sendWelcomeEmail(opts: {
  email: string;
  fullName: string;
  roleLabel: string;
  loginUrl: string;
  customMessage?: string;
}) {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      replyTo: REPLY_TO_EMAIL,
      subject: "Welcome to DeepTalent — your application is approved",
      html: withReplyNotice(welcomeHtml(opts)),
    });
    if (result.error) {
      console.error("[Resend] Welcome email API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }
    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Welcome email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ---------------------------------------------------------------------------
// Meeting / call-up email — uses the meeting-call-up template
// ---------------------------------------------------------------------------
export function buildGoogleCalendarUrl(opts: {
  title: string;
  description: string;
  start: Date;
  durationMinutes: number;
  location: string;
}) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = new Date(opts.start.getTime() + opts.durationMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.description,
    location: opts.location,
    dates: `${fmt(opts.start)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function meetingHtml(opts: {
  fullName: string;
  meetingWhen: string;
  meetingLink: string;
  calendarUrl: string;
  customMessage?: string;
}) {
  const customBlock = opts.customMessage
    ? `<div style="background:#eef2ff;border-left:4px solid #3B5BDB;border-radius:6px;padding:14px 18px;margin:0 0 22px 0;font-size:14px;color:#1e3a8a;line-height:1.7;">${opts.customMessage}</div>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Your DeepTalent meeting is scheduled</title></head><body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#374151;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06);"><tr><td style="background:linear-gradient(135deg,#3B5BDB 0%,#2d42a6 100%);padding:44px 32px;text-align:center;color:#ffffff;"><p style="margin:0;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;opacity:.85;">DeepTalent</p><h1 style="margin:10px 0 0 0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">You&rsquo;re booked in</h1><p style="margin:8px 0 0 0;font-size:15px;opacity:.92;">Meeting confirmation &amp; details below.</p></td></tr><tr><td style="padding:40px 32px 8px 32px;"><p style="margin:0 0 16px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${opts.fullName},</p><p style="margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#4b5563;">Thanks for moving forward with DeepTalent. We&rsquo;ve scheduled a call to walk through your next steps. Please find the details below.</p>${customBlock}</td></tr><tr><td style="padding:0 32px 8px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border:1px solid #e2e8f0;border-radius:12px;padding:24px;"><tr><td><p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:#3B5BDB;text-transform:uppercase;letter-spacing:0.7px;">When</p><p style="margin:0 0 18px 0;font-size:18px;font-weight:600;color:#0f172a;line-height:1.4;">${opts.meetingWhen}</p><p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:#3B5BDB;text-transform:uppercase;letter-spacing:0.7px;">Where</p><p style="margin:0;font-size:14px;line-height:1.6;color:#475569;word-break:break-all;"><a href="${opts.meetingLink}" style="color:#3B5BDB;text-decoration:none;font-weight:500;">${opts.meetingLink}</a></p></td></tr></table></td></tr><tr><td style="padding:24px 32px 8px 32px;text-align:center;"><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:8px;background:#3B5BDB;padding:0 6px 0 0;"><a href="${opts.meetingLink}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Join the meeting</a></td><td style="border-radius:8px;background:#ffffff;border:1px solid #cbd5e1;padding:0 6px 0 6px;"><a href="${opts.calendarUrl}" target="_blank" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#3B5BDB;text-decoration:none;border-radius:8px;">Add to Google Calendar</a></td></tr></table></td></tr><tr><td style="padding:28px 32px 32px 32px;"><div style="background:#fff7ed;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 18px;"><p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;"><strong style="color:#92400e;">Tip:</strong> Test your audio &amp; camera 2&ndash;3 minutes early. If you can&rsquo;t make it, just reply to this email and we&rsquo;ll find a new slot.</p></div></td></tr><tr><td style="padding:0 32px 32px 32px;border-top:1px solid #e5e7eb;text-align:center;"><p style="margin:20px 0 4px 0;font-size:13px;color:#6b7280;font-weight:500;">DeepTalent</p><p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} DeepTalent Platform. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function sendMeetingEmail(opts: {
  email: string;
  fullName: string;
  meetingAt: Date;
  meetingLink: string;
  customMessage?: string;
  title?: string;
  subject?: string;
}) {
  try {
    const resend = getResendClient();
    const meetingWhen = opts.meetingAt.toLocaleString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    const calendarUrl = buildGoogleCalendarUrl({
      title: opts.title || "DeepTalent Intro Call",
      description: `DeepTalent intro call with ${opts.fullName}.\n\nJoin link: ${opts.meetingLink}`,
      start: opts.meetingAt,
      durationMinutes: 30,
      location: opts.meetingLink,
    });

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      replyTo: REPLY_TO_EMAIL,
      subject: opts.subject || `Your DeepTalent meeting — ${meetingWhen}`,
      html: withReplyNotice(
        meetingHtml({
          fullName: opts.fullName,
          meetingWhen,
          meetingLink: opts.meetingLink,
          calendarUrl,
          customMessage: opts.customMessage,
        })
      ),
    });
    if (result.error) {
      console.error("[Resend] Meeting email API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }
    return { success: true, messageId: result.data?.id || "sent", calendarUrl };
  } catch (error: any) {
    console.error("[Resend] Meeting email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ---------------------------------------------------------------------------
// Next-stage email — sent after an interview/meeting when the candidate or
// partner is advanced to the next stage of the process.
// ---------------------------------------------------------------------------
export async function sendNextStageEmail(opts: {
  email: string;
  fullName: string;
  roleLabel: string;
  loginUrl: string;
  customMessage?: string;
}) {
  try {
    const resend = getResendClient();
    const firstName = (opts.fullName || "there").split(" ")[0] || "there";
    const customBlock = opts.customMessage
      ? `<div style="background:#eef2ff;border-left:4px solid #3B5BDB;border-radius:6px;padding:16px 20px;margin:0 0 22px 0;font-size:14px;color:#1e3a8a;line-height:1.7;">${escapeHtml(
          opts.customMessage
        ).replace(/\n/g, "<br/>")}</div>`
      : "";
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Good news from DeepTalent</title></head><body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#374151;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06);"><tr><td style="background:linear-gradient(135deg,#3B5BDB 0%,#2d42a6 100%);padding:44px 32px;text-align:center;color:#ffffff;"><p style="margin:0;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;opacity:.85;">DeepTalent</p><h1 style="margin:10px 0 0 0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">You&rsquo;re moving forward</h1><p style="margin:8px 0 0 0;font-size:15px;opacity:.92;">Great conversation &mdash; here&rsquo;s what&rsquo;s next.</p></td></tr><tr><td style="padding:40px 32px 8px 32px;"><p style="margin:0 0 16px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${escapeHtml(
      firstName
    )},</p><p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#4b5563;">Thank you for taking the time to meet with the DeepTalent team. We&rsquo;re pleased to let you know that we&rsquo;d like to advance you to the next stage of our process as a ${escapeHtml(
      opts.roleLabel
    )}.</p>${customBlock}<p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:#4b5563;">Our team will be in touch shortly with the details of the next step. In the meantime, keep your dashboard and profile up to date.</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px auto;"><tr><td align="center" style="border-radius:8px;background:#3B5BDB;"><a href="${
      opts.loginUrl
    }" style="display:inline-block;padding:13px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Go to your dashboard</a></td></tr></table></td></tr><tr><td style="padding:18px 32px 32px 32px;border-top:1px solid #e5e7eb;text-align:center;"><p style="margin:18px 0 4px 0;font-size:13px;color:#6b7280;font-weight:500;">DeepTalent</p><p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} DeepTalent Platform. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      replyTo: REPLY_TO_EMAIL,
      subject: "Good news — you're moving to the next stage with DeepTalent",
      html: withReplyNotice(html),
    });
    if (result.error) {
      console.error("[Resend] Next-stage email API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }
    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Next-stage email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ---------------------------------------------------------------------------
// Contact auto-reply email — sent when someone submits the public contact form
// ---------------------------------------------------------------------------
export async function sendContactAutoReplyEmail(opts: {
  email: string;
  fullName: string;
  subject?: string | null;
  message: string;
}) {
  try {
    const resend = getResendClient();
    const safeFirstName = (opts.fullName || "there").split(" ")[0] || "there";
    const submittedSubject = (opts.subject || "").trim();
    const escapedMessage = String(opts.message || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const html = `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#374151;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06);">
          <tr><td style="background:linear-gradient(135deg,#3B5BDB 0%,#2d42a6 100%);padding:40px 32px;text-align:center;color:#ffffff;">
            <p style="margin:0;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;opacity:.85;">DeepTalent</p>
            <h1 style="margin:10px 0 0 0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">We got your message</h1>
            <p style="margin:8px 0 0 0;font-size:15px;opacity:.92;">Thanks for reaching out — we&rsquo;ll be in touch soon.</p>
          </td></tr>

          <tr><td style="padding:36px 32px 8px 32px;">
            <p style="margin:0 0 16px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${safeFirstName},</p>
            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#4b5563;">
              Thanks for getting in touch with DeepTalent. This is an automatic confirmation that we&rsquo;ve received your message —
              one of our team will respond personally within <strong>1 business day</strong>.
            </p>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.7;color:#4b5563;">
              In the meantime, here&rsquo;s a copy of what you sent us:
            </p>
          </td></tr>

          <tr><td style="padding:0 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 22px;">
              ${
                submittedSubject
                  ? `<tr><td style="padding-bottom:12px;">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#3B5BDB;text-transform:uppercase;letter-spacing:0.7px;">Subject</p>
                      <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;line-height:1.5;">${submittedSubject}</p>
                    </td></tr>`
                  : ""
              }
              <tr><td>
                <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#3B5BDB;text-transform:uppercase;letter-spacing:0.7px;">Your message</p>
                <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap;">${escapedMessage}</p>
              </td></tr>
            </table>
          </td></tr>

          <tr><td style="padding:28px 32px 40px 32px;">
            <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#4b5563;">
              Need to add something? Just reply to this email and it will reach our team directly.
            </p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">
              Speak soon,<br/>
              <span style="font-weight:600;color:#111827;">The DeepTalent Team</span>
            </p>
          </td></tr>

          <tr><td style="padding:24px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You&rsquo;re receiving this because you contacted DeepTalent at deeptalentplatform.com.<br/>
              &copy; ${new Date().getFullYear()} DeepTalent. All rights reserved.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      replyTo: REPLY_TO_EMAIL,
      subject: submittedSubject
        ? `We received your message — ${submittedSubject}`
        : "We received your message — DeepTalent",
      html: withReplyNotice(html),
    });

    if (result.error) {
      console.error("[Resend] Contact auto-reply API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }
    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Contact auto-reply exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ---------------------------------------------------------------------------
// Polite rejection email
// ---------------------------------------------------------------------------
export async function sendRejectionEmail(opts: {
  email: string;
  fullName: string;
  reason?: string;
}) {
  try {
    const resend = getResendClient();
    const reasonBlock = opts.reason
      ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;margin:18px 0;font-size:14px;color:#475569;line-height:1.7;">${opts.reason}</div>`
      : "";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#374151;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06);"><tr><td style="padding:40px 32px 8px 32px;"><p style="margin:0;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;color:#6b7280;font-weight:600;">DeepTalent</p><h1 style="margin:8px 0 22px 0;font-size:24px;color:#111827;font-weight:700;">Update on your application</h1><p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#4b5563;">Hi ${opts.fullName},</p><p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#4b5563;">Thank you for applying to DeepTalent and for taking the time to share your background with us. After careful review, we won&rsquo;t be moving forward with your application at this time.</p>${reasonBlock}<p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#4b5563;">This decision isn&rsquo;t a reflection of your potential. The needs of our partner companies shift constantly, so we&rsquo;d encourage you to keep your profile fresh and apply again as new roles open up.</p><p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#4b5563;">We wish you the very best in your search.</p><p style="margin:24px 0 0 0;font-size:15px;color:#4b5563;">— The DeepTalent Team</p></td></tr><tr><td style="padding:24px 32px 32px 32px;border-top:1px solid #e5e7eb;text-align:center;"><p style="margin:0 0 4px 0;font-size:13px;color:#6b7280;font-weight:500;">DeepTalent</p><p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} DeepTalent Platform.</p></td></tr></table></td></tr></table></body></html>`;
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      replyTo: REPLY_TO_EMAIL,
      subject: "Update on your DeepTalent application",
      html: withReplyNotice(html),
    });
    if (result.error) {
      console.error("[Resend] Rejection email API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }
    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Rejection email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

// ---------------------------------------------------------------------------
// Custom branded email — admin-authored subject + body, wrapped in template
// ---------------------------------------------------------------------------
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function customHtml(opts: {
  fullName: string;
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  // Convert plain-text paragraphs (blank-line separated) into <p> blocks,
  // and single newlines into <br>. Escape user content for safety.
  const paragraphs = opts.message
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#4b5563;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 4px auto;"><tr><td align="center" style="border-radius:8px;background:#3B5BDB;"><a href="${opts.ctaUrl}" style="display:inline-block;padding:12px 30px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(opts.ctaLabel)}</a></td></tr></table>`
      : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${escapeHtml(opts.subject)}</title></head><body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#374151;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.06);"><tr><td style="background:linear-gradient(135deg,#3B5BDB 0%,#2d42a6 100%);padding:36px 32px;color:#ffffff;"><p style="margin:0;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:.85;">DeepTalent</p><h1 style="margin:8px 0 0 0;font-size:24px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">${escapeHtml(opts.subject)}</h1></td></tr><tr><td style="padding:36px 32px 12px 32px;"><p style="margin:0 0 18px 0;font-size:16px;font-weight:500;color:#111827;">Hi ${escapeHtml(opts.fullName)},</p>${paragraphs}${cta}</td></tr><tr><td style="padding:18px 32px 32px 32px;border-top:1px solid #e5e7eb;text-align:center;"><p style="margin:18px 0 4px 0;font-size:13px;color:#6b7280;font-weight:500;">DeepTalent</p><p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} DeepTalent Platform. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function sendCustomEmail(opts: {
  email: string;
  fullName: string;
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  replyTo?: string;
}) {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      replyTo: REPLY_TO_EMAIL,
      subject: opts.subject,
      html: withReplyNotice(customHtml(opts)),
    });
    if (result.error) {
      console.error("[Resend] Custom email API error:", result.error);
      return { success: false, error: result.error.message || JSON.stringify(result.error) };
    }
    return { success: true, messageId: result.data?.id || "sent" };
  } catch (error: any) {
    console.error("[Resend] Custom email exception:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}
