import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SALARY_SCALE } from "@/lib/salary/scale";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, role_id, message } = body as {
      email?: string;
      name?: string;
      role_id?: string;
      message?: string;
    };

    if (!email || !role_id) {
      return NextResponse.json({ error: "email and role_id are required" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const row = SALARY_SCALE.find((r) => r.id === role_id);
    if (!row) {
      return NextResponse.json({ error: "Unknown role_id" }, { status: 400 });
    }

    const admin = serviceClient();
    const { error } = await admin.from("role_interests").insert({
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      role_id,
      role_label: row.label,
      message: message?.trim() || null,
      source: "roles_page",
    });

    if (error) {
      console.error("[v0] role_interests insert error:", error.message);
      return NextResponse.json({ error: "Failed to save interest" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[v0] /api/roles/interest error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
