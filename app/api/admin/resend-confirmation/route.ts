import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendConfirmationEmail } from "@/lib/email/resend";

function createServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  const caller = await createClient();
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { data: userData, error: getErr } = await sb.auth.admin.getUserById(userId);
  if (getErr || !userData?.user) {
    return NextResponse.json({ error: getErr?.message || "User not found" }, { status: 404 });
  }
  const email = userData.user.email!;
  const fullName =
    (userData.user.user_metadata as any)?.full_name ||
    (await sb.from("profiles").select("full_name").eq("id", userId).single()).data?.full_name ||
    "there";

  // For an already-created user, use magiclink to confirm + sign them in.
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
  const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  const confirmLink =
    linkData?.properties?.action_link ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;

  const result = await sendConfirmationEmail(email, fullName, confirmLink);

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email, messageId: result.messageId });
}
