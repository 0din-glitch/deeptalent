import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/credits — return current balance */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("ai_credits")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credits: data?.ai_credits ?? 0 });
}

/**
 * POST /api/credits
 * Body: { action: "spend" | "grant", amount: number, tool?: string, description: string }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, amount, tool, description } = await req.json();
  if (!["spend", "grant"].includes(action) || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const delta = action === "spend" ? -amount : amount;

  // Fetch current balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credits")
    .eq("id", user.id)
    .single();

  const currentBalance = profile?.ai_credits ?? 0;

  // Block if insufficient credits
  if (action === "spend" && currentBalance < amount) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const newBalance = Math.max(0, currentBalance + delta);

  // Update balance
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ ai_credits: newBalance })
    .eq("id", user.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Log transaction
  await supabase.from("ai_credit_transactions").insert({
    user_id: user.id,
    delta,
    tool: tool ?? null,
    description: description ?? (action === "spend" ? "AI tool usage" : "Credit grant"),
  });

  return NextResponse.json({ credits: newBalance });
}
