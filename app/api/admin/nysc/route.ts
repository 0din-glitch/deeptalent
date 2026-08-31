import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { generateNyscCertificatePdf, generateCertificateNumber } from "@/lib/nysc/certificate";
import { sendNyscCertificateEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Unauthorized" as const, status: 401 as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Forbidden" as const, status: 403 as const };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey)
    return { error: "Service role key not configured" as const, status: 500 as const };

  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return { sb };
}

export async function GET() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey)
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });

  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Corps members are profiles that carry NYSC credentials from the dedicated
  // sign-up. Pull those, their applications, and auth records (for confirmation
  // + last sign-in, which tells the admin who actually logged in vs just signed up).
  const [{ data: profiles }, { data: apps }, authResult] = await Promise.all([
    sb
      .from("profiles")
      .select(
        "id,email,full_name,role,created_at,nysc_call_up_number,nysc_state_of_origin,nysc_state_code,nysc_track,nysc_course_completed_at,nysc_course_completed_source,nysc_certificate_number,nysc_certificate_sent_at"
      )
      .or("nysc_call_up_number.not.is.null,nysc_state_code.not.is.null")
      .order("created_at", { ascending: false })
      .limit(2000),
    sb.from("talent_applications").select("user_id,status").not("user_id", "is", null),
    sb.auth.admin.listUsers({ page: 1, perPage: 2000 }),
  ]);

  const appCounts = new Map<string, number>();
  for (const a of apps ?? []) {
    if (a.user_id) appCounts.set(a.user_id, (appCounts.get(a.user_id) || 0) + 1);
  }

  const authMap = new Map<
    string,
    { confirmed_at: string | null; last_sign_in_at: string | null; auth_email: string | null }
  >();
  for (const u of authResult.data?.users ?? []) {
    authMap.set(u.id, {
      confirmed_at: u.email_confirmed_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      auth_email: u.email ?? null,
    });
  }

  const members = (profiles ?? []).map((p) => {
    const auth = authMap.get(p.id);
    return {
      id: p.id,
      email: p.email || auth?.auth_email || null,
      full_name: p.full_name,
      call_up_number: p.nysc_call_up_number,
      state_of_origin: p.nysc_state_of_origin,
      state_code: p.nysc_state_code,
      track: p.nysc_track,
      created_at: p.created_at,
      application_count: appCounts.get(p.id) || 0,
      email_confirmed: !!auth?.confirmed_at,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      course_completed_at: p.nysc_course_completed_at,
      course_completed_source: p.nysc_course_completed_source,
      certificate_number: p.nysc_certificate_number,
      certificate_sent_at: p.nysc_certificate_sent_at,
    };
  });

  const summary = {
    total: members.length,
    ready: members.filter((m) => m.track === "ready").length,
    training: members.filter((m) => m.track === "training").length,
    signed_in: members.filter((m) => m.last_sign_in_at).length,
  };

  return NextResponse.json({ members, summary });
}

/**
 * Admin-issued certificate: independent of the corps member's own
 * self-report. Lets an admin certify and email anyone directly from the
 * Corps Members tab, e.g. after verifying attendance out-of-band.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { sb } = auth;

  const body = await request.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const { data: member, error } = await sb
    .from("profiles")
    .select(
      "id,email,full_name,nysc_call_up_number,nysc_state_code,nysc_state_of_origin,nysc_course_completed_at,nysc_certificate_number,nysc_certificate_issued_at"
    )
    .eq("id", userId)
    .single();

  if (error || !member) return NextResponse.json({ error: "Corps member not found" }, { status: 404 });
  if (!member.email) return NextResponse.json({ error: "This member has no email on file" }, { status: 400 });

  const now = new Date();
  const certificateNumber = member.nysc_certificate_number || generateCertificateNumber();
  const completedAt = member.nysc_course_completed_at ? new Date(member.nysc_course_completed_at) : now;

  const { error: updateError } = await sb
    .from("profiles")
    .update({
      nysc_course_completed_at: member.nysc_course_completed_at || now.toISOString(),
      nysc_course_completed_source: member.nysc_course_completed_at ? undefined : "admin_issued",
      nysc_certificate_number: certificateNumber,
      nysc_certificate_issued_at: member.nysc_certificate_issued_at || now.toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("[Admin NYSC] Failed to update profile for certificate:", updateError.message);
    return NextResponse.json({ error: "Failed to record certificate" }, { status: 500 });
  }

  const pdfBytes = await generateNyscCertificatePdf({
    certificateNumber,
    fullName: member.full_name || "Corps Member",
    callUpNumber: member.nysc_call_up_number,
    stateCode: member.nysc_state_code,
    stateOfOrigin: member.nysc_state_of_origin,
    completedAt,
    issuedAt: now,
  });

  const emailResult = await sendNyscCertificateEmail(
    member.email,
    member.full_name || "Corps Member",
    certificateNumber,
    pdfBytes
  );

  if (emailResult.success) {
    await sb.from("profiles").update({ nysc_certificate_sent_at: now.toISOString() }).eq("id", userId);
  }

  return NextResponse.json({
    success: true,
    certificateNumber,
    emailSent: emailResult.success,
    emailError: emailResult.success ? null : emailResult.error,
  });
}
