import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendContactAutoReplyEmail } from "@/lib/email/resend";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body?.name ?? "").toString().trim();
  const email = (body?.email ?? "").toString().trim();
  const company = (body?.company ?? "").toString().trim();
  const subject = (body?.subject ?? "").toString().trim();
  const message = (body?.message ?? "").toString().trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // Persist the message — using the server client so RLS uses the proper context.
  const supabase = await createClient();
  const { error: insertError } = await supabase.from("contact_messages").insert({
    name,
    email,
    company: company || null,
    subject: subject || null,
    message,
  });

  if (insertError) {
    console.error("[contact] insert failed:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Fire-and-await the auto-reply so we can surface a clean status, but never
  // let an email failure block the user — their message is already saved.
  const result = await sendContactAutoReplyEmail({
    email,
    fullName: name,
    subject: subject || null,
    message,
  });

  if (!result.success) {
    console.error("[contact] auto-reply failed:", result.error);
    // Still 200 — the message was saved; we just couldn't send the receipt.
    return NextResponse.json({
      ok: true,
      autoReply: { sent: false, error: result.error },
    });
  }

  return NextResponse.json({
    ok: true,
    autoReply: { sent: true, messageId: result.messageId },
  });
}
