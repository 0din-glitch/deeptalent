"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationCodeEmail, sendNyscVerificationCodeEmail } from "@/lib/email/resend";

function createServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ---------------------------------------------------------------------------
// This Supabase project mints an 8-digit `email_otp`, which doesn't fit the
// app's 6-box code input. Rather than depend on that digit count, we mint our
// own 6-digit code, store it alongside Supabase's `hashed_token` (its actual
// verification secret), and email only our 6-digit code to the user. On
// verify, we look up the matching `hashed_token` and use it — the real
// Supabase secret never has to match the digit count shown in the UI.
// ---------------------------------------------------------------------------
type ServiceClient = ReturnType<typeof createServiceClient>;

async function mintVerificationCode(
  admin: ServiceClient,
  params:
    | { type: "signup"; email: string; password: string; redirectTo?: string; data?: Record<string, unknown> }
    | { type: "magiclink"; email: string }
): Promise<{ code: string } | { error: string }> {
  const { data: linkData, error: linkError } =
    params.type === "signup"
      ? await admin.auth.admin.generateLink({
          type: "signup",
          email: params.email,
          password: params.password,
          options: { redirectTo: params.redirectTo, data: params.data },
        })
      : await admin.auth.admin.generateLink({ type: "magiclink", email: params.email });

  const hashedToken = linkData?.properties?.hashed_token;
  if (linkError || !hashedToken) {
    console.error("[v0] generateLink failed:", linkError?.message || "no hashed_token returned");
    return { error: "Could not generate a verification code. Please try again." };
  }

  const verificationType = linkData.properties?.verification_type || params.type;
  const code = String(Math.floor(100000 + Math.random() * 900000)); // always 6 digits

  // Invalidate any earlier unused codes for this email so only the latest one works.
  await admin
    .from("email_verification_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", params.email)
    .is("consumed_at", null);

  const { error: insertError } = await admin.from("email_verification_codes").insert({
    email: params.email,
    code,
    hashed_token: hashedToken,
    verification_type: verificationType,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour, matches email copy
  });

  if (insertError) {
    console.error("[v0] Failed to store verification code:", insertError.message);
    return { error: "Could not generate a verification code. Please try again." };
  }

  return { code };
}

async function resolveVerificationCode(admin: ServiceClient, email: string, code: string) {
  const { data, error } = await admin
    .from("email_verification_codes")
    .select("id, hashed_token, verification_type, expires_at")
    .eq("email", email)
    .eq("code", code)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data || new Date(data.expires_at).getTime() < Date.now()) {
    return { error: "That code is invalid or has expired. Please try again." };
  }

  await admin.from("email_verification_codes").update({ consumed_at: new Date().toISOString() }).eq("id", data.id);

  return { hashedToken: data.hashed_token as string, verificationType: data.verification_type as string };
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

  // Step 3: mint our own 6-digit signup confirmation code (does NOT send an email).
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
  const minted = await mintVerificationCode(admin, {
    type: "signup",
    email,
    password,
    redirectTo,
    data: { full_name: fullName, role },
  });

  if ("error" in minted) {
    return { error: minted.error };
  }

  // Step 4: send the branded 6-digit code email via Resend.
  console.log("[v0] Sending verification code email to:", email);
  const emailResult = await sendVerificationCodeEmail(email, fullName, minted.code);

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
// NYSC Corps Member login: corps members sign in with their NYSC state code
// instead of an email. Resolve the account's email (and destination track)
// from the state code so the client can complete a normal password sign-in.
// Returns a generic error on any miss to avoid leaking which codes exist.
// ---------------------------------------------------------------------------
export async function resolveNyscLogin(
  stateCode: string
): Promise<{ error: string } | { email: string; destination: string }> {
  const normalized = stateCode.trim().toUpperCase();
  if (!normalized) {
    return { error: "Enter your NYSC state code." };
  }

  const admin = createServiceClient();
  // Use order+limit(1) instead of a bare .maybeSingle() so a rare duplicate
  // state code (e.g. a retried signup) can't throw a "multiple rows" error
  // and lock everyone with that code out of login — fall back to the most
  // recently created matching profile instead.
  const { data: profiles } = await admin
    .from("profiles")
    .select("email, nysc_track")
    .eq("nysc_state_code", normalized)
    .order("created_at", { ascending: false })
    .limit(1);

  const profile = profiles?.[0];
  if (!profile?.email) {
    return { error: "Invalid state code or password." };
  }

  const destination = profile.nysc_track === "training" ? "/nysc/training" : "/nysc/roles";
  return { email: profile.email, destination };
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

  const nextPath = track === "training" ? "/nysc/training" : "/nysc/roles";
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const minted = await mintVerificationCode(admin, {
    type: "signup",
    email,
    password,
    redirectTo,
    data: { full_name: fullName, role: "talent", nysc: true },
  });

  if ("error" in minted) {
    return { error: minted.error };
  }

  const emailResult = await sendNyscVerificationCodeEmail(email, fullName, minted.code);

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
  const admin = createServiceClient();

  // Look up the Supabase hashed_token our 6-digit code maps to, then verify
  // with that token_hash — this confirms the address and sets session cookies
  // regardless of how many digits Supabase's own email_otp happens to be.
  const resolved = await resolveVerificationCode(admin, email, code);
  if ("error" in resolved) {
    return { error: resolved.error };
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: resolved.hashedToken,
    type: resolved.verificationType as "signup" | "magiclink" | "email" | "invite" | "recovery" | "email_change",
  });

  if (verifyError) {
    console.error("[v0] verifyOtp (token_hash) failed:", verifyError.message);
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
export async function resendEmailCode(email: string, variant: "default" | "nysc" = "default") {
  const admin = createServiceClient();

  const minted = await mintVerificationCode(admin, { type: "magiclink", email });
  if ("error" in minted) {
    console.error("[v0] resend mintVerificationCode failed:", minted.error);
    return { error: "Could not resend a code right now. Please try again shortly." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("email", email)
    .maybeSingle();

  const fullName = profile?.full_name || "there";
  const emailResult =
    variant === "nysc"
      ? await sendNyscVerificationCodeEmail(email, fullName, minted.code)
      : await sendVerificationCodeEmail(email, fullName, minted.code);

  if (!emailResult.success) {
    return { error: "Could not send the code email. Please try again." };
  }

  return { success: true };
}
