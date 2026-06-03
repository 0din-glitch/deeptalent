import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Auth: must be admin
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: meProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (meProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Profile, auth user, applications, inquiries in parallel
  const [profileRes, authUserRes, appsRes, inqRes] = await Promise.all([
    sb.from("profiles").select("id, email, full_name, role, created_at").eq("id", id).maybeSingle(),
    sb.auth.admin.getUserById(id),
    sb
      .from("talent_applications")
      .select(
        "id, full_name, email, phone, country, role_category, specialization, years_experience, linkedin_url, portfolio_url, bio, status, created_at",
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    sb
      .from("company_inquiries")
      .select(
        "id, company_name, contact_name, email, phone, website, team_size, role_category, role_title, urgency, budget_range, notes, status, created_at",
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const authUser = authUserRes.data?.user;
  const meta = (authUser?.user_metadata as Record<string, unknown> | undefined) ?? {};

  return NextResponse.json({
    profile,
    auth: {
      email: profile?.email ?? authUser?.email ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
      created_at: authUser?.created_at ?? null,
      provider: authUser?.app_metadata?.provider ?? null,
      legacy_user_id: (meta.legacy_user_id as string | undefined) ?? null,
      source: (meta.source as string | undefined) ?? null,
    },
    applications: appsRes.data ?? [],
    inquiries: inqRes.data ?? [],
  });
}
