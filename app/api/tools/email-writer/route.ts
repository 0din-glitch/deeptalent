import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CREDIT_COST = 2;

const EmailSchema = z.object({
  subject: z.string().describe("Concise, compelling email subject line"),
  greeting: z.string().describe("Greeting line, e.g. 'Hi Sarah,'"),
  body: z.array(z.string()).describe("2-4 short body paragraphs. Keep each concise and scannable."),
  signoff: z.string().describe("Sign-off line, e.g. 'Best regards,'"),
  tips: z.array(z.string()).describe("1-3 short tips for improving reply rate or timing"),
});

const TYPE_MAP: Record<string, string> = {
  outreach: "a cold outreach email to a recruiter or hiring manager expressing interest in opportunities",
  followup: "a polite follow-up email after applying or interviewing, checking on status without being pushy",
  thankyou: "a thank-you email sent after an interview, reinforcing fit and enthusiasm",
  networking: "a warm networking email to build a professional relationship or ask for a referral",
  negotiation: "a professional salary/offer negotiation email that is confident but collaborative",
  intro: "a self-introduction email to a new team or client",
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profileData } = await supabase
    .from("profiles")
    .select("ai_credits, full_name, role_category, specialization, years_experience, country, skills, bio")
    .eq("id", user.id)
    .single();

  if (!profileData || (profileData.ai_credits ?? 0) < CREDIT_COST) {
    return NextResponse.json({ error: "Insufficient credits", required: CREDIT_COST }, { status: 402 });
  }

  const { emailType, recipientName, company, context, tone } = await req.json();
  if (!emailType || !context) {
    return NextResponse.json({ error: "emailType and context are required" }, { status: 400 });
  }

  const typeDesc = TYPE_MAP[emailType] || "a professional email";
  const toneDesc =
    tone === "warm" ? "warm and personable"
    : tone === "direct" ? "direct and concise"
    : tone === "enthusiastic" ? "enthusiastic and energetic"
    : "professional and polished";

  const systemPrompt = `You are an expert career communication coach who writes high-converting professional emails for tech talent.
Write ${typeDesc}. Tone: ${toneDesc}.
Rules: keep it short (under 200 words total), skimmable, no clichés, no "I hope this email finds you well".
Lead with relevance. Every sentence earns its place. Sound human, not templated.`;

  const userPrompt = `Write the email based on:

SENDER (the candidate):
- Name: ${profileData.full_name || "the candidate"}
- Role: ${profileData.role_category || "tech professional"}${profileData.specialization ? ` (${profileData.specialization})` : ""}
- Experience: ${profileData.years_experience ?? "n/a"} years
- Location: ${profileData.country || "n/a"}
- Skills: ${profileData.skills || "n/a"}

RECIPIENT / CONTEXT:
- Recipient name: ${recipientName || "unknown — use a role-appropriate greeting"}
- Company: ${company || "not specified"}
- What the email is about: ${String(context).slice(0, 1200)}

Return structured JSON only. Greeting should use the recipient name if provided. Body should be 2-4 short paragraphs.`;

  try {
    const { experimental_output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      experimental_output: Output.object({ schema: EmailSchema }),
      maxOutputTokens: 900,
    });

    if (!experimental_output) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const newBalance = (profileData.ai_credits ?? 0) - CREDIT_COST;
    await supabase.from("profiles").update({ ai_credits: newBalance }).eq("id", user.id);
    await supabase.from("ai_credit_transactions").insert({
      user_id: user.id,
      delta: -CREDIT_COST,
      tool: "emailWriter",
      description: `Email drafted (${emailType})${company ? ` for ${company}` : ""}`,
    });

    return NextResponse.json({
      email: experimental_output,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newBalance,
    });
  } catch (err: any) {
    console.error("[v0] email-writer generation error:", err?.message ?? err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
