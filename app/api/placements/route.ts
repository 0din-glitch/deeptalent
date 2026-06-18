import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/placements — returns placements for the current user (talent or company)
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  const uid = userData.user.id;

  let query = supabase.from("placements").select("*").order("created_at", { ascending: false });

  if (profile?.role === "talent") {
    query = query.eq("talent_user_id", uid);
  } else if (profile?.role === "company") {
    query = query.eq("company_user_id", uid);
  } else {
    // admin — return all
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ placements: data ?? [] });
}
