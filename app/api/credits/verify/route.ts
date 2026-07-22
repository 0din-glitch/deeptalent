import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/credits/verify
 * Body: { sessionId: string }
 * Confirms a Stripe Checkout session is paid and grants the credits exactly once.
 * Uses the unique index on ai_credit_transactions.stripe_session_id to dedupe.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  // Already granted? Return current balance (idempotent).
  const { data: existing } = await supabase
    .from("ai_credit_transactions")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    const { data: p } = await supabase.from("profiles").select("ai_credits").eq("id", user.id).single();
    return NextResponse.json({ credits: p?.ai_credits ?? 0, alreadyProcessed: true });
  }

  // Verify the session with Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }
  // Ensure this session belongs to the signed-in user
  if (session.metadata?.userId !== user.id) {
    return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
  }

  const credits = Number(session.metadata?.credits ?? 0);
  if (!Number.isInteger(credits) || credits <= 0) {
    return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });
  }

  // Grant credits
  const { data: profile } = await supabase.from("profiles").select("ai_credits").eq("id", user.id).single();
  const newBalance = (profile?.ai_credits ?? 0) + credits;

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ ai_credits: newBalance })
    .eq("id", user.id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Log the transaction with the session id (unique index prevents double-grant on race)
  const { error: insertErr } = await supabase.from("ai_credit_transactions").insert({
    user_id: user.id,
    delta: credits,
    tool: null,
    description: `Purchased ${credits} credits (${session.metadata?.packageId ?? "pack"})`,
    stripe_session_id: sessionId,
  });

  // If a concurrent request already inserted it, roll our balance change intent back to the real value
  if (insertErr) {
    const { data: p } = await supabase.from("profiles").select("ai_credits").eq("id", user.id).single();
    return NextResponse.json({ credits: p?.ai_credits ?? newBalance, alreadyProcessed: true });
  }

  return NextResponse.json({ credits: newBalance });
}
