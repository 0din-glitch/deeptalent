import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { startCertificateReprintPayment } from "@/lib/nysc/payment";

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
 * Starts a Flutterwave checkout for the NGN 500 certificate reprint fee.
 * Only available once the corps member has already used their one free
 * download — see /api/nysc/certificate/download.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  const { data: profile } = await sb
    .from("profiles")
    .select(
      "id, email, full_name, nysc_certificate_number, nysc_certificate_downloaded_at, nysc_certificate_reprint_credits"
    )
    .eq("id", userData.user.id)
    .single();

  if (!profile?.email) {
    return NextResponse.json({ error: "No email on file" }, { status: 400 });
  }

  if (!profile.nysc_certificate_number) {
    return NextResponse.json({ error: "Your certificate hasn't been issued yet" }, { status: 400 });
  }

  if (!profile.nysc_certificate_downloaded_at || profile.nysc_certificate_reprint_credits > 0) {
    return NextResponse.json({ error: "You still have a free download available" }, { status: 400 });
  }

  const redirectOrigin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const result = await startCertificateReprintPayment(
    profile.id,
    profile.email,
    profile.full_name || "Corps Member",
    redirectOrigin
  );

  if (!result.success || !result.link) {
    return NextResponse.json({ error: result.error || "Failed to start payment" }, { status: 500 });
  }

  return NextResponse.json({ link: result.link });
}
