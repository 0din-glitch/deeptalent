import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CREDIT_COST = 3;

const CoverLetterSchema = z.object({
  subject: z.string().describe("Email subject line for the cover letter"),
  opening: z.string().describe("Opening paragraph — hook and role name"),
  body: z.array(z.string()).describe("2-3 body paragraphs showcasing relevant experience"),
  closing: z.string().describe("Closing paragraph with call to action"),
  signoff: z.string().describe("Sign-off line e.g. 'Warm regards,'"),
  tips: z.array(z.string()).describe("2-3 short personalisation tips for the candidate"),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // --- Credit check ---
  const { data: profileData } = await supabase
    .from("profiles")
    .select("ai_credits, full_name, role_category, specialization, years_experience, country, skills, bio")
    .eq("id", user.id)
    .single();

  if (!profileData || (profileData.ai_credits ?? 0) < CREDIT_COST) {
    return NextResponse.json({ error: "Insufficient credits", required: CREDIT_COST }, { status: 402 });
  }

  const { jobTitle, company, jobDescription, tone } = await req.json();
  if (!jobTitle || !company || !jobDescription) {
    return NextResponse.json({ error: "jobTitle, company and jobDescription are required" }, { status: 400 });
  }

  const toneMap: Record<string, string> = {
    professional: "formal and professional",
    confident: "confident and assertive",
    friendly: "warm, friendly, and approachable",
    creative: "creative and slightly unconventional",
  };
  const toneDesc = toneMap[tone] || "professional";

  const systemPrompt = `You are an expert career coach and cover letter writer specialising in tech talent. 
Your cover letters are concise (300-400 words), ATS-friendly, and feel genuinely human — never generic.
Write in ${toneDesc} tone. Avoid clichés like "I am writing to express my interest". Start with impact.`;

  const userPrompt = `Write a cover letter for the following:

CANDIDATE PROFILE:
- Name: ${profileData.full_name || "the candidate"}
- Role category: ${profileData.role_category || "not specified"}
- Specialization: ${profileData.specialization || "not specified"}
- Years of experience: ${profileData.years_experience ?? "not specified"}
- Location: ${profileData.country || "not specified"}
- Skills: ${profileData.skills || "not specified"}
- Bio: ${profileData.bio || "not provided"}

TARGET ROLE:
- Job title: ${jobTitle}
- Company: ${company}
- Job description: ${jobDescription.slice(0, 1500)}

Return the cover letter as structured JSON only. The body array should have exactly 2-3 paragraphs. The tips array should have 2-3 short personalisation suggestions (e.g. "Mention their product X if you've used it").`;

  try {
    const { experimental_output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      experimental_output: Output.object({ schema: CoverLetterSchema }),
      maxOutputTokens: 1200,
    });

    if (!experimental_output) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    // --- Deduct credits ---
    const newBalance = (profileData.ai_credits ?? 0) - CREDIT_COST;
    await supabase.from("profiles").update({ ai_credits: newBalance }).eq("id", user.id);
    await supabase.from("ai_credit_transactions").insert({
      user_id: user.id,
      delta: -CREDIT_COST,
      tool: "coverLetter",
      description: `Cover letter generated for "${jobTitle}" at ${company}`,
    });

    return NextResponse.json({
      letter: experimental_output,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newBalance,
    });
  } catch (err: any) {
    console.error("[v0] cover-letter generation error:", err?.message ?? err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
