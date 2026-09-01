import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { generateCertificateNumber } from "@/lib/nysc/certificate";
import { sendNyscCertificateEmail } from "@/lib/email/resend";
import { generateNyscCertificatePdf } from "@/lib/nysc/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getSelfProfile() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Unauthorized" as const, status: 401 as const };

  const sb = serviceClient();
  const { data: profile, error } = await sb
    .from("profiles")
    .select(
      "id,email,full_name,nysc_call_up_number,nysc_state_code,nysc_state_of_origin,nysc_course_completed_at,nysc_course_completed_source,nysc_certificate_number,nysc_certificate_issued_at,nysc_certificate_sent_at,nysc_course_paid_at"
    )
    .eq("id", userData.user.id)
    .single();

  if (error || !profile) return { error: "Not found" as const, status: 404 as const };
  return { profile, sb };
}

export async function GET() {
  const result = await getSelfProfile();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { profile } = result;
  return NextResponse.json({
    completed: !!profile.nysc_course_completed_at,
    completedAt: profile.nysc_course_completed_at,
    completedSource: profile.nysc_course_completed_source,
    certificateNumber: profile.nysc_certificate_number,
    sentAt: profile.nysc_certificate_sent_at,
    enrolled: !!profile.nysc_course_paid_at,
  });
}

/**
 * Self-serve completion: the corps member confirms they've finished the
 * programme (there's no per-module progress tracking yet). This issues a
 * certificate number if one doesn't already exist and emails the PDF.
 */
export async function POST() {
  const result = await getSelfProfile();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { profile, sb } = result;

  if (!profile.nysc_course_paid_at && !profile.nysc_course_completed_at) {
    return NextResponse.json(
      { error: "Enrol in the course (NGN 2,000) before confirming completion." },
      { status: 403 }
    );
  }

  const now = new Date();
  const certificateNumber = profile.nysc_certificate_number || generateCertificateNumber();
  const completedAt = profile.nysc_course_completed_at
    ? new Date(profile.nysc_course_completed_at)
    : now;

  const { error: updateError } = await sb
    .from("profiles")
    .update({
      nysc_course_completed_at: profile.nysc_course_completed_at || now.toISOString(),
      nysc_course_completed_source: profile.nysc_course_completed_source || "self_reported",
      nysc_certificate_number: certificateNumber,
      nysc_certificate_issued_at: profile.nysc_certificate_issued_at || now.toISOString(),
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("[NYSC Certificate] Failed to update profile:", updateError.message);
    return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
  }

  if (!profile.email) {
    return NextResponse.json({ error: "No email on file" }, { status: 400 });
  }

  const pdfBytes = await generateNyscCertificatePdf({
    certificateNumber,
    fullName: profile.full_name || "Corps Member",
    callUpNumber: profile.nysc_call_up_number,
    stateCode: profile.nysc_state_code,
    stateOfOrigin: profile.nysc_state_of_origin,
    completedAt,
    issuedAt: now,
  });

  const emailResult = await sendNyscCertificateEmail(
    profile.email,
    profile.full_name || "Corps Member",
    certificateNumber,
    pdfBytes
  );

  if (emailResult.success) {
    await sb
      .from("profiles")
      .update({ nysc_certificate_sent_at: now.toISOString() })
      .eq("id", profile.id);
  }

  return NextResponse.json({
    completed: true,
    certificateNumber,
    emailSent: emailResult.success,
  });
}
