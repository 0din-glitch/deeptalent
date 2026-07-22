import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, Output } from "ai";
import { z } from "zod";

const ReviewSchema = z.object({
  overall_score: z.number(),
  headline: z.object({
    score: z.number(),
    feedback: z.string(),
    rewrite: z.string(),
  }),
  about: z.object({
    score: z.number(),
    feedback: z.string(),
    rewrite: z.string(),
  }),
  experience: z.object({
    score: z.number(),
    feedback: z.string(),
    top_tips: z.array(z.string()),
  }),
  skills: z.object({
    score: z.number(),
    feedback: z.string(),
    missing_skills: z.array(z.string()),
  }),
  recruiter_view: z.object({
    first_impression: z.string(),
    ats_score: z.number(),
    quick_wins: z.array(z.string()),
  }),
  summary: z.string(),
});

const CREDIT_COST = 4;

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { headline, about, experience, skills, target_role } = await req.json();
  if (!headline?.trim() && !about?.trim()) {
    return NextResponse.json({ error: "Please provide at least your headline and About section." }, { status: 400 });
  }

  // Check + deduct credits atomically
  const { data: profile } = await sb
    .from("profiles")
    .select("ai_credits")
    .eq("id", user.id)
    .single();

  if (!profile || profile.ai_credits < CREDIT_COST) {
    return NextResponse.json({ error: "Not enough credits. You need 4 credits for a LinkedIn review." }, { status: 402 });
  }

  const { error: deductError } = await sb
    .from("profiles")
    .update({ ai_credits: profile.ai_credits - CREDIT_COST })
    .eq("id", user.id)
    .gte("ai_credits", CREDIT_COST);

  if (deductError) {
    return NextResponse.json({ error: "Credit deduction failed. Please try again." }, { status: 500 });
  }

  await sb.from("ai_credit_transactions").insert({
    user_id: user.id,
    delta: -CREDIT_COST,
    tool: "linkedinReview",
    description: "LinkedIn Profile Review",
  });

  const profileText = [
    headline ? `HEADLINE:\n${headline}` : "",
    about ? `ABOUT:\n${about}` : "",
    experience ? `EXPERIENCE:\n${experience}` : "",
    skills ? `SKILLS:\n${skills}` : "",
  ].filter(Boolean).join("\n\n");

  const { experimental_output: review } = await generateText({
    model: "openai/gpt-4.1",
    experimental_output: Output.object({ schema: ReviewSchema }),
    system: `You are a world-class LinkedIn profile coach specialising in helping African tech talent land global remote roles. You score profiles objectively and give specific, actionable rewrites.

For each section, give a score out of 10 (be honest — most profiles score 4–7). Write feedback that is direct and specific, never generic. Rewrites should be ready to paste.

Target role context: ${target_role || "a remote tech/finance/ops role with global companies"}.`,
    prompt: `Review this LinkedIn profile and return a structured audit:\n\n${profileText}`,
  });

  return NextResponse.json({ review });
}
