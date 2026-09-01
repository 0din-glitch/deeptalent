import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { startCoursePayment } from "@/lib/nysc/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Starts a Flutterwave checkout for the post-NYSC course enrolment fee and
 * returns the hosted payment link for the browser to redirect to.
 */
export async function POST() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("id, email, full_name, nysc_course_paid_at")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.email) {
    return NextResponse.json({ error: "No email on file" }, { status: 400 });
  }

  if (profile.nysc_course_paid_at) {
    return NextResponse.json({ error: "You're already enrolled" }, { status: 400 });
  }

  const result = await startCoursePayment(profile.id, profile.email, profile.full_name || "Corps Member");
  if (!result.success || !result.link) {
    return NextResponse.json({ error: result.error || "Failed to start payment" }, { status: 500 });
  }

  return NextResponse.json({ link: result.link });
}
