"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendConfirmationEmail } from "@/lib/email/resend";

function createServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function signUpWithResendConfirmation(
  email: string,
  password: string,
  fullName: string,
  role: "talent" | "company"
) {
  const admin = createServiceClient();

  // Step 1: create the user (unconfirmed). This avoids triggering Supabase's
  // own SMTP pipeline up front, which has been flaky.
  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: fullName, role },
  });

  if (createError) {
    return { error: createError.message };
  }

  const userId = createData.user?.id;
  if (!userId) {
    return { error: "Failed to create user" };
  }

  // Step 2: ensure profile exists.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      { id: userId, email, full_name: fullName, role },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("[v0] Profile upsert failed:", profileError.message);
  }

  // Step 3: generate a confirmation link (does NOT send an email).
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo, data: { full_name: fullName, role } },
  });

  if (linkError) {
    console.error("[v0] generateLink failed:", linkError.message);
  }

  const confirmLink =
    linkData?.properties?.action_link ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;

  // Step 4: try Resend first (branded email).
  console.log("[v0] Attempting Resend confirmation email to:", email);
  const emailResult = await sendConfirmationEmail(email, fullName, confirmLink);

  if (emailResult.success) {
    console.log("[v0] Resend confirmation sent:", emailResult.messageId);
    return {
      success: true,
      userId,
      message: "Account created! Check your email to confirm.",
      emailProvider: "resend",
    };
  }

  // Step 5: Resend failed — fall back to Supabase's built-in confirmation email.
  console.error("[v0] Resend failed, falling back to Supabase mailer:", emailResult.error);

  const ssr = await createClient();
  const { error: resendErr } = await ssr.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (resendErr) {
    console.error("[v0] Supabase fallback resend also failed:", resendErr.message);
    return {
      success: true,
      userId,
      message:
        "Account created, but confirmation email could not be sent. Use the resend button on the login page.",
      emailProvider: "none",
      emailError: typeof emailResult.error === "string" ? emailResult.error : JSON.stringify(emailResult.error),
    };
  }

  console.log("[v0] Supabase fallback confirmation email sent");
  return {
    success: true,
    userId,
    message: "Account created! Check your email to confirm.",
    emailProvider: "supabase",
  };
}
