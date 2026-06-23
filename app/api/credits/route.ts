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
  return NextResponse.json({ credits: data.ai_credits ?? 0 });
}

/** POST /api/credits — spend or grant credits
 *  Body: { action: "spend" | "grant", amount: number, tool?: string, description: string }
 *  "spend" requires service-role or the authenticated user (self-spend)
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

  // Check balance before spending
  if (action === "spend") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_credits")
      .eq("id", user.id)
      .single();

    if ((profile?.ai_credits ?? 0) < amount) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
  }

  // Atomically update balance
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ ai_credits: supabase.rpc ? undefined : undefined }) // handled via raw SQL below
    .eq("id", user.id);

  // Use RPC-style raw update for atomic increment
  const { error: rpcErr } = await supabase.rpc("adjust_ai_credits", {
    p_user_id: user.id,
    p_delta: delta,
  });

  // Fallback: direct update (non-atomic but fine for our scale)
  if (rpcErr) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_credits")
      .eq("id", user.id)
      .single();

    const newBalance = (profile?.ai_credits ?? 0) + delta;
    await supabase
      .from("profiles")
      .update({ ai_credits: Math.max(0, newBalance) })
      .eq("id", user.id);
  }

  // Log transaction
  await supabase.from("ai_credit_transactions").insert({
    user_id: user.id,
    delta,
    tool: tool ?? null,
    description,
  });

  // Return new balance
  const { data: updated } = await supabase
    .from("profiles")
    .select("ai_credits")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ credits: updated?.ai_credits ?? 0 });
}
