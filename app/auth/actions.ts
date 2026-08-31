"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationCodeEmail } from "@/lib/email/resend";

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

  // Step 0: guard against duplicate emails before touching auth.
  // The profiles table has a unique constraint on email (migration 006).
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return { error: "An account with this email address already exists. Please log in instead." };
  }

  // Also check Supabase auth directly (handles confirmed users not yet in profiles).
  const { data: authList } = await admin.auth.admin.listUsers();
  const authConflict = (authList?.users ?? []).find((u) => u.email === email);
  if (authConflict) {
    return { error: "An account with this email address already exists. Please log in instead." };
  }

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

  // Step 3: generate a signup confirmation OTP (does NOT send an email).
  // generateLink returns a 6-digit `email_otp` alongside the action link.
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo, data: { full_name: fullName, role } },
  });

  if (linkError) {
    console.error("[v0] generateLink failed:", linkError.message);
    return { error: "Could not start email verification. Please try again." };
  }

  const code = linkData?.properties?.email_otp;
  if (!code) {
    console.error("[v0] generateLink returned no email_otp");
    return { error: "Could not generate a verification code. Please try again." };
  }

  // Step 4: send the branded 6-digit code email via Resend.
  console.log("[v0] Sending verification code email to:", email);
  const emailResult = await sendVerificationCodeEmail(email, fullName, code);

  if (!emailResult.success) {
    console.error("[v0] Verification code email failed:", emailResult.error);
    // The account exists and the code is valid — let the user request a resend.
    return {
      success: true,
      userId,
      needsCode: true,
      email,
      warning: "We couldn't email your code automatically. Tap \"Resend code\" to try again.",
    };
  }

  console.log("[v0] Verification code sent:", emailResult.messageId);
  return {
    success: true,
    userId,
    needsCode: true,
    email,
    message: "We sent a 6-digit code to your email.",
  };
}

// ---------------------------------------------------------------------------
// NYSC Corps Member sign-up: same OTP flow as above, plus the corps-member
// specific fields (call-up number, state of origin, state code, track).
// ---------------------------------------------------------------------------
export async function signUpNyscCorpsMember(
  email: string,
  password: string,
  fullName: string,
  callUpNumber: string,
  stateOfOrigin: string,
  stateCode: string,
  track: "ready" | "training"
) {
  const admin = createServiceClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return { error: "An account with this email address already exists. Please log in instead." };
  }

  const { data: authList } = await admin.auth.admin.listUsers();
  const authConflict = (authList?.users ?? []).find((u) => u.email === email);
  if (authConflict) {
    return { error: "An account with this email address already exists. Please log in instead." };
  }

  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: fullName, role: "talent", nysc: true },
  });

  if (createError) {
    return { error: createError.message };
  }

  const userId = createData.user?.id;
  if (!userId) {
    return { error: "Failed to create user" };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role: "talent",
        nysc_call_up_number: callUpNumber,
        nysc_state_of_origin: stateOfOrigin,
        nysc_state_code: stateCode,
        nysc_track: track,
      },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("[v0] NYSC profile upsert failed:", profileError.message);
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo, data: { full_name: fullName, role: "talent", nysc: true } },
  });

  if (linkError) {
    console.error("[v0] NYSC generateLink failed:", linkError.message);
    return { error: "Could not start email verification. Please try again." };
  }

  const code = linkData?.properties?.email_otp;
  if (!code) {
    console.error("[v0] NYSC generateLink returned no email_otp");
    return { error: "Could not generate a verification code. Please try again." };
  }

  const emailResult = await sendVerificationCodeEmail(email, fullName, code);

  if (!emailResult.success) {
    console.error("[v0] NYSC verification code email failed:", emailResult.error);
    return {
      success: true,
      userId,
      needsCode: true,
      email,
      warning: "We couldn't email your code automatically. Tap \"Resend code\" to try again.",
    };
  }

  return {
    success: true,
    userId,
    needsCode: true,
    email,
    message: "We sent a 6-digit code to your email.",
  };
}

// ---------------------------------------------------------------------------
// Verify the 6-digit email confirmation code and establish a session.
// ---------------------------------------------------------------------------
export async function verifyEmailCode(
  email: string,
  code: string,
  next?: string | null
) {
  const supabase = await createClient();

  // generateLink(type:'signup') and resend(type:'magiclink') both mint an
  // email_otp; verifyOtp confirms the address and sets the session cookies.
  let verified = false;
  for (const type of ["signup", "email", "magiclink"] as const) {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type });
    if (!error) {
      verified = true;
      break;
    }
  }

  if (!verified) {
    return { error: "That code is invalid or has expired. Please try again." };
  }

  // Session cookies are now set — resolve the post-auth destination by role.
  const { data: userData } = await supabase.auth.getUser();
  let redirect = next || "/dashboard";

  if (userData.user && (!next || next === "/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();
    const roleVal = profile?.role;
    if (roleVal === "admin") {
      redirect = "/admin";
    } else if (roleVal === "company") {
      redirect = "/dashboard";
    } else {
      const { data: interview } = await supabase
        .from("talent_interviews")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("status", "completed")
        .limit(1)
        .maybeSingle();
      redirect = interview ? "/dashboard" : "/interview";
    }
  }

  return { success: true, redirect };
}

// ---------------------------------------------------------------------------
// Resend a fresh 6-digit verification code (no password required).
// ---------------------------------------------------------------------------
export async function resendEmailCode(email: string) {
  const admin = createServiceClient();

  // magiclink also returns a fresh email_otp and confirms the email on verify.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const code = linkData?.properties?.email_otp;
  if (linkError || !code) {
    console.error("[v0] resend generateLink failed:", linkError?.message);
    return { error: "Could not resend a code right now. Please try again shortly." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("email", email)
    .maybeSingle();

  const emailResult = await sendVerificationCodeEmail(
    email,
    profile?.full_name || "there",
    code
  );

  if (!emailResult.success) {
    return { error: "Could not send the code email. Please try again." };
  }

  return { success: true };
}
