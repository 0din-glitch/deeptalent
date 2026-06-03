import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTemporaryPasswordEmail } from "@/lib/email/resend";

function createServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  // Verify caller is an admin
  const caller = createClient();
  const {
    data: { user },
  } = await (await caller).auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Get user email and name
  const { data: userData } = await sb.auth.admin.getUserById(userId);
  const { data: userProfile } = await sb
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  const email = userProfile?.email || userData?.user?.email;
  const fullName = userProfile?.full_name || "User";

  if (!email) {
    return NextResponse.json({ error: "User email not found" }, { status: 404 });
  }

  // Set password to the temporary value
  const tempPassword = "deeptalent1";
  const { error: pwError } = await sb.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (pwError) {
    return NextResponse.json({ error: pwError.message }, { status: 500 });
  }

  // Clear any legacy hash (so the login flow doesn't try to re-verify it)
  // and flag that the user must change their password on next login
  const { error: profileError } = await sb
    .from("profiles")
    .update({
      must_change_password: true,
      legacy_password_hash: null,
    })
    .eq("id", userId);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Send temporary password via Resend
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;
  await sendTemporaryPasswordEmail(email, fullName, tempPassword, loginUrl);

  return NextResponse.json({ ok: true, email });
}
