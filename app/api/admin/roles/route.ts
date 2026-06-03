import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/roles
// Allows an admin to add a "role" (company hiring request) that immediately
// shows up on /talents/apply#roles. Stored in company_inquiries with
// status='approved' and source='admin' so we can distinguish later.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    company_name: string;
    contact_name?: string;
    email?: string;
    role_title: string;
    role_category?: string;
    team_size?: string;
    urgency?: string;
    budget_range?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.company_name?.trim() || !body.role_title?.trim()) {
    return NextResponse.json(
      { error: "company_name and role_title are required" },
      { status: 400 }
    );
  }

  const insertPayload: Record<string, any> = {
    company_name: body.company_name.trim(),
    contact_name: body.contact_name?.trim() || "DeepTalent",
    email: body.email?.trim() || userData.user.email || "team@deeptalentplatform.com",
    role_title: body.role_title.trim(),
    role_category: body.role_category?.trim() || null,
    team_size: body.team_size?.trim() || null,
    urgency: body.urgency?.trim() || null,
    budget_range: body.budget_range?.trim() || null,
    notes: body.notes?.trim() || null,
    status: "approved",
    decision_at: new Date().toISOString(),
    decided_by: userData.user.id,
  };

  const { data, error } = await supabase
    .from("company_inquiries")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, row: data });
}
