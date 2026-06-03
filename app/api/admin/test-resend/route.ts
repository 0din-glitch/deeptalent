import { NextResponse } from "next/server";
import { Resend } from "resend";
import { FROM_EMAIL } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to") || "delivered@resend.dev";

  const apiKey = process.env.RESEND_API_KEY;
  const rawFromEnv = process.env.RESEND_FROM_EMAIL || null;
  // Use the same resolved FROM_EMAIL the rest of the app uses
  const fromEmail = FROM_EMAIL;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        stage: "config",
        error: "RESEND_API_KEY is not set",
        rawFromEnv,
        resolvedFrom: fromEmail,
      },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "DeepTalent Resend test",
      html: `<p>Resend test email — if you can see this, sending is working.</p>
             <p>From: <code>${fromEmail}</code></p>
             <p>Sent at: ${new Date().toISOString()}</p>`,
    });

    if (result.error) {
      return NextResponse.json(
        {
          ok: false,
          stage: "resend_api",
          rawFromEnv,
          resolvedFrom: fromEmail,
          to,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      rawFromEnv,
      resolvedFrom: fromEmail,
      to,
      messageId: result.data?.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        stage: "exception",
        rawFromEnv,
        resolvedFrom: fromEmail,
        to,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
