import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey) return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });

  const sb = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Pull profiles + counts of related rows + auth users (for verification status)
  const [{ data: profiles }, { data: apps }, { data: inquiries }, authResult] = await Promise.all([
    sb.from("profiles").select("id,email,full_name,role,created_at,is_super_admin,suspended_at,suspension_reason").order("created_at", { ascending: false }).limit(2000),
    sb.from("talent_applications").select("user_id").not("user_id", "is", null),
    sb.from("company_inquiries").select("user_id").not("user_id", "is", null),
    sb.auth.admin.listUsers({ page: 1, perPage: 2000 }),
  ]);

  const appCounts = new Map<string, number>();
  for (const a of apps ?? []) if (a.user_id) appCounts.set(a.user_id, (appCounts.get(a.user_id) || 0) + 1);
  const inqCounts = new Map<string, number>();
  for (const i of inquiries ?? []) if (i.user_id) inqCounts.set(i.user_id, (inqCounts.get(i.user_id) || 0) + 1);

  // Build a verification map from auth.users
  const verifiedMap = new Map<string, { confirmed_at: string | null; auth_email: string | null }>();
  for (const u of authResult.data?.users ?? []) {
    verifiedMap.set(u.id, {
      confirmed_at: u.email_confirmed_at ?? null,
      auth_email: u.email ?? null,
    });
  }

  // Start with profiles
  const profileIds = new Set((profiles ?? []).map((p) => p.id));
  const users = (profiles ?? []).map((p) => {
    const auth = verifiedMap.get(p.id);
    return {
      id: p.id,
      email: p.email || auth?.auth_email || null,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      application_count: appCounts.get(p.id) || 0,
      inquiry_count: inqCounts.get(p.id) || 0,
      email_confirmed: !!auth?.confirmed_at,
      email_confirmed_at: auth?.confirmed_at ?? null,
      is_super_admin: !!p.is_super_admin,
      suspended_at: p.suspended_at ?? null,
      suspension_reason: p.suspension_reason ?? null,
    };
  });

  // Add any auth users that don't have a profile yet (orphaned auth records)
  for (const u of authResult.data?.users ?? []) {
    if (!profileIds.has(u.id)) {
      users.push({
        id: u.id,
        email: u.email ?? null,
        full_name: (u.user_metadata as any)?.full_name || null,
        role: (u.user_metadata as any)?.role || null,
        created_at: u.created_at,
        application_count: 0,
        inquiry_count: 0,
        email_confirmed: !!u.email_confirmed_at,
        email_confirmed_at: u.email_confirmed_at ?? null,
        is_super_admin: false,
        suspended_at: null,
        suspension_reason: null,
      });
    }
  }

  // Sort newest first
  users.sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({ users });
}
