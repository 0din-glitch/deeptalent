import { NextResponse } from "next/server";
import { requireSuperAdmin, logAuditEntry } from "@/lib/admin/access";
import { sendAdminInviteEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  let body: { email: string; fullName: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, fullName } = body ?? {};
  if (!email?.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (!fullName?.trim()) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  const sb = ctx.service;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    new URL(request.url).origin;

  // Check if user already exists in auth
  const { data: existingList } = await sb.auth.admin.listUsers();
  const existingUser = existingList?.users?.find(
    (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
  );

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    // Update their profile role to admin
    await sb.from("profiles").upsert(
      { id: userId, role: "admin", full_name: fullName.trim(), email: email.trim().toLowerCase() },
      { onConflict: "id" }
    );
  } else {
    // Create a new auth user without a password — they'll set it via the invite link
    const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      email_confirm: false,
      user_metadata: { full_name: fullName.trim() },
    });
    if (createErr || !newUser?.user) {
      return NextResponse.json(
        { error: createErr?.message || "Failed to create user" },
        { status: 500 }
      );
    }
    userId = newUser.user.id;
    // Create profile with admin role
    await sb.from("profiles").upsert(
      { id: userId, role: "admin", full_name: fullName.trim(), email: email.trim().toLowerCase() },
      { onConflict: "id" }
    );
  }

  // Generate a magic link so the invitee can confirm + set their password
  const redirectTo = `${baseUrl}/auth/callback?next=/admin`;
  const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
    type: "magiclink",
    email: email.trim().toLowerCase(),
    options: { redirectTo },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: linkErr?.message || "Could not generate invite link" },
      { status: 500 }
    );
  }

  const setupLink = linkData.properties.action_link;
  const inviterName = ctx.email;

  const emailRes = await sendAdminInviteEmail({
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    inviterName,
    setupLink,
  });

  await logAuditEntry(sb, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "admin.invite",
    resource_type: "profile",
    resource_id: userId,
    summary: `Invited ${fullName.trim()} (${email.trim()}) as admin`,
    metadata: { email: email.trim(), invited_by: ctx.email, email_sent: emailRes.success },
  });

  if (!emailRes.success) {
    return NextResponse.json(
      { error: `Account created but email failed: ${emailRes.error}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, userId, email: email.trim() });
}
