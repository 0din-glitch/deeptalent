import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, full_name, id")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return profile;
}

// GET /api/admin/placements — list all placements
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = serviceClient();
  const { data, error } = await sb
    .from("placements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

// POST /api/admin/placements — create a new placement
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    talent_user_id, talent_name, talent_email, talent_role, talent_seniority,
    company_user_id, company_name, company_contact, company_email,
    start_date, end_date, status, monthly_rate_usd, currency, notes,
  } = body;

  if (!talent_name || !talent_email || !company_name) {
    return NextResponse.json(
      { error: "talent_name, talent_email, and company_name are required" },
      { status: 400 }
    );
  }

  // Validate UUIDs — empty strings must become null to avoid FK constraint errors
  const toUuid = (v: unknown) =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

  const sb = serviceClient();
  const { data, error } = await sb
    .from("placements")
    .insert({
      talent_user_id: toUuid(talent_user_id),
      talent_name,
      talent_email,
      talent_role: talent_role || null,
      talent_seniority: talent_seniority || null,
      company_user_id: toUuid(company_user_id),
      company_name,
      company_contact: company_contact || null,
      company_email: company_email || null,
      start_date: start_date || null,
      end_date: end_date || null,
      status: status || "active",
      monthly_rate_usd: monthly_rate_usd ? Number(monthly_rate_usd) : null,
      currency: currency || "USD",
      notes: notes || null,
      placed_by: admin.id,
      placed_by_email: admin.email,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ placement: data });
}

// PATCH /api/admin/placements — update a placement
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...rawUpdates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Coerce empty-string UUID fields to null
  const toUuid = (v: unknown) =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  const updates = {
    ...rawUpdates,
    ...(rawUpdates.talent_user_id !== undefined && { talent_user_id: toUuid(rawUpdates.talent_user_id) }),
    ...(rawUpdates.company_user_id !== undefined && { company_user_id: toUuid(rawUpdates.company_user_id) }),
  };

  const sb = serviceClient();
  const { data, error } = await sb
    .from("placements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ placement: data });
}

// DELETE /api/admin/placements — delete a placement
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = serviceClient();
  const { error } = await sb.from("placements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
