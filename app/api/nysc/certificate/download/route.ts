import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { generateNyscCertificatePdf } from "@/lib/nysc/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await sb
    .from("profiles")
    .select(
      "full_name,nysc_call_up_number,nysc_state_code,nysc_state_of_origin,nysc_course_completed_at,nysc_certificate_number,nysc_certificate_issued_at,nysc_certificate_downloaded_at,nysc_certificate_reprint_credits"
    )
    .eq("id", userData.user.id)
    .single();

  if (!profile?.nysc_course_completed_at || !profile.nysc_certificate_number) {
    return NextResponse.json({ error: "Certificate not yet issued" }, { status: 404 });
  }

  const alreadyUsedFreeDownload = !!profile.nysc_certificate_downloaded_at;
  const hasReprintCredit = (profile.nysc_certificate_reprint_credits || 0) > 0;

  if (alreadyUsedFreeDownload && !hasReprintCredit) {
    return NextResponse.json(
      { error: "You've already downloaded your certificate. Reprinting costs NGN 500.", requiresPayment: true },
      { status: 402 }
    );
  }

  if (!alreadyUsedFreeDownload) {
    await sb
      .from("profiles")
      .update({ nysc_certificate_downloaded_at: new Date().toISOString() })
      .eq("id", userData.user.id);
  } else {
    await sb
      .from("profiles")
      .update({ nysc_certificate_reprint_credits: profile.nysc_certificate_reprint_credits - 1 })
      .eq("id", userData.user.id);
  }

  const pdfBytes = await generateNyscCertificatePdf({
    certificateNumber: profile.nysc_certificate_number,
    fullName: profile.full_name || "Corps Member",
    callUpNumber: profile.nysc_call_up_number,
    stateCode: profile.nysc_state_code,
    stateOfOrigin: profile.nysc_state_of_origin,
    completedAt: new Date(profile.nysc_course_completed_at),
    issuedAt: new Date(profile.nysc_certificate_issued_at || profile.nysc_course_completed_at),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="DeepTalent-NYSC-Certificate-${profile.nysc_certificate_number}.pdf"`,
    },
  });
}
