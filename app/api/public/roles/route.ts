import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Public-safe role listing: only approved + active company inquiries,
  // and we deliberately omit any contact info (email/phone/contact_name).
  const { data, error } = await sb
    .from("company_inquiries")
    .select(
      "id, company_name, role_title, role_category, team_size, urgency, budget_range, notes, status, created_at"
    )
    .in("status", ["approved", "active", "open"])
    .order("decision_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    roles: (data || []).map((r) => ({
      id: r.id,
      company: r.company_name,
      title: r.role_title || r.role_category || "Open role",
      category: r.role_category,
      team_size: r.team_size,
      urgency: r.urgency,
      budget_range: r.budget_range,
      summary: r.notes ? String(r.notes).slice(0, 220) : null,
      posted_at: r.created_at,
    })),
  });
}
