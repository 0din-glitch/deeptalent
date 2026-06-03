import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import legacyUsers from "./_legacy-users.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type LegacyUser = {
  user_id: string;
  email: string;
  name: string | null;
  role: "super_admin" | "admin" | "client" | "talent";
  email_verified: boolean;
  banned: boolean;
  user_created_at: string;
  last_active_at: string | null;
  password_hash: string | null;
};

// Map legacy roles -> the role values used by the rest of this app
function mapRole(legacy: string): "admin" | "company" | "talent" {
  if (legacy === "super_admin" || legacy === "admin") return "admin";
  if (legacy === "client") return "company";
  return "talent";
}

// Generate a secure random password to satisfy Supabase Auth's password requirement.
// The user never sees this — they will keep using their legacy password, which is
// verified server-side against the stored Better-Auth scrypt hash on first login.
function genRandomPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") + "Aa1!";
}

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return userData.user;
}

export async function GET() {
  // Preview totals only
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const byRole: Record<string, number> = {};
  for (const u of legacyUsers as LegacyUser[]) {
    const r = mapRole(u.role);
    byRole[r] = (byRole[r] || 0) + 1;
  }
  return NextResponse.json({ total: (legacyUsers as LegacyUser[]).length, byRole });
}

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase service role key" }, { status: 500 });
  }
  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const credentials: { email: string; name: string | null; role: string; status: "created" | "existing"; hasLegacyPassword: boolean }[] = [];
  let created = 0;
  let existing = 0;
  let linkedApps = 0;
  let linkedInquiries = 0;
  const errors: { email: string; error: string }[] = [];

  for (const u of legacyUsers as LegacyUser[]) {
    if (!u.email) continue;
    const email = u.email.trim().toLowerCase();
    const role = mapRole(u.role);
    const fullName = u.name ?? null;
    const randomPassword = genRandomPassword();

    let userId: string | null = null;
    let status: "created" | "existing" = "created";

    // Try to create the auth user. If exists, look it up by listing.
    const { data: createData, error: createError } = await sb.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, legacy_user_id: u.user_id, source: "legacy_neon" },
    });

    if (createError) {
      const msg = createError.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists") || msg.includes("422")) {
        status = "existing";
        existing++;
        // Find existing user by email via admin listUsers (paged)
        const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const found = list?.users.find((x) => (x.email || "").toLowerCase() === email);
        if (found) {
          userId = found.id;
          // For users created in a previous migration run, rotate their password
          // back to a random value so the legacy-login fallback (using the stored
          // scrypt hash) is what verifies them on next login.
          await sb.auth.admin.updateUserById(found.id, { password: randomPassword });
        }
      } else {
        errors.push({ email, error: msg });
        continue;
      }
    } else {
      created++;
      userId = createData.user?.id ?? null;
    }

    if (!userId) {
      errors.push({ email, error: "Could not resolve user id" });
      continue;
    }

    // Upsert into public.profiles, including the legacy scrypt hash so we can
    // verify the user's old password the first time they log in.
    const { error: profileError } = await sb.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role,
        legacy_password_hash: u.password_hash ?? null,
      },
      { onConflict: "id" }
    );
    if (profileError) {
      errors.push({ email, error: `profile upsert: ${profileError.message}` });
    }

    // Link historical talent applications by email
    const { data: appsLinked } = await sb
      .from("talent_applications")
      .update({ user_id: userId })
      .ilike("email", email)
      .is("user_id", null)
      .select("id");
    if (appsLinked) linkedApps += appsLinked.length;

    // Link historical company inquiries by email
    const { data: inqLinked } = await sb
      .from("company_inquiries")
      .update({ user_id: userId })
      .ilike("email", email)
      .is("user_id", null)
      .select("id");
    if (inqLinked) linkedInquiries += inqLinked.length;

    credentials.push({ email, name: fullName, role, status, hasLegacyPassword: !!u.password_hash });
  }

  return NextResponse.json({
    ok: true,
    summary: {
      total: (legacyUsers as LegacyUser[]).length,
      created,
      existing,
      linkedApps,
      linkedInquiries,
      errorCount: errors.length,
    },
    errors: errors.slice(0, 50),
    credentials, // admin can copy/export this list
  });
}
