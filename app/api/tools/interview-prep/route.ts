import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const COST_QUESTIONS = 3;
const COST_FEEDBACK = 1;

const QuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe("The interview question"),
        category: z
          .enum(["technical", "behavioral", "situational", "role-specific"])
          .describe("Type of question"),
        difficulty: z.enum(["warm-up", "core", "challenging"]).describe("Difficulty level"),
        whatTheyWant: z
          .string()
          .describe("One sentence: what the interviewer is really assessing with this question"),
        talkingPoints: z
          .array(z.string())
          .describe("3-4 concise bullet points the candidate should hit in a strong answer"),
        sampleAnswer: z
          .string()
          .describe("A short, strong model answer (2-4 sentences) personalised to the candidate"),
      })
    )
    .describe("6-8 tailored interview questions"),
});

const FeedbackSchema = z.object({
  score: z.number().describe("Score 0-100 for the candidate's answer"),
  band: z.string().describe("Short verdict, e.g. 'Strong', 'Solid', 'Needs work'"),
  strengths: z.array(z.string()).describe("1-3 things the answer did well"),
  improvements: z.array(z.string()).describe("2-4 specific, actionable improvements"),
  missingElements: z
    .array(z.string())
    .describe("Key points or STAR elements the answer was missing"),
  starVersion: z
    .string()
    .describe("A rewritten, improved answer using the STAR method (Situation, Task, Action, Result)"),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body.action as "questions" | "feedback";
  const cost = action === "feedback" ? COST_FEEDBACK : COST_QUESTIONS;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("ai_credits, full_name, role_category, specialization, years_experience, country, skills, bio")
    .eq("id", user.id)
    .single();

  if (!profileData || (profileData.ai_credits ?? 0) < cost) {
    return NextResponse.json({ error: "Insufficient credits", required: cost }, { status: 402 });
  }

  const candidate = `CANDIDATE PROFILE:
- Name: ${profileData.full_name || "the candidate"}
- Role: ${profileData.role_category || "tech professional"}${profileData.specialization ? ` (${profileData.specialization})` : ""}
- Experience: ${profileData.years_experience ?? "n/a"} years
- Location: ${profileData.country || "n/a"}
- Skills: ${profileData.skills || "n/a"}`;

  try {
    if (action === "feedback") {
      const { question, answer, targetRole } = body;
      if (!question || !answer || String(answer).trim().length < 10) {
        return NextResponse.json(
          { error: "A question and a written answer (min 10 chars) are required." },
          { status: 400 }
        );
      }

      const { experimental_output } = await generateText({
        model: "openai/gpt-4o-mini",
        system: `You are an expert interview coach for global tech roles. You grade a candidate's practice answer honestly and constructively, then rewrite it using the STAR method. Be specific and encouraging. Never invent facts — if the answer lacks detail, note it as missing.`,
        prompt: `${candidate}
${targetRole ? `TARGET ROLE: ${targetRole}` : ""}

INTERVIEW QUESTION:
${question}

CANDIDATE'S ANSWER:
${String(answer).slice(0, 2000)}

Grade the answer and return structured JSON. The starVersion should keep the candidate's real details but restructure into a crisp STAR-format answer.`,
        experimental_output: Output.object({ schema: FeedbackSchema }),
        maxOutputTokens: 1100,
      });

      if (!experimental_output) {
        return NextResponse.json({ error: "AI feedback failed" }, { status: 500 });
      }

      const newBalance = (profileData.ai_credits ?? 0) - cost;
      await supabase.from("profiles").update({ ai_credits: newBalance }).eq("id", user.id);
      await supabase.from("ai_credit_transactions").insert({
        user_id: user.id,
        delta: -cost,
        tool: "interviewPrep",
        description: "Interview answer feedback",
      });

      return NextResponse.json({ feedback: experimental_output, creditsRemaining: newBalance });
    }

    // Default: generate the question bank
    const { targetRole, focus } = body;

    const { experimental_output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert technical recruiter and interview coach. You create realistic, role-specific interview question banks for global remote tech roles. Personalise questions to the candidate's actual skills and seniority. Mix warm-up, core, and challenging questions across technical, behavioral, situational, and role-specific categories.`,
      prompt: `${candidate}
${targetRole ? `TARGET ROLE THEY ARE PREPARING FOR: ${targetRole}` : ""}
${focus ? `AREAS TO FOCUS ON: ${focus}` : ""}

Generate 6-8 interview questions this candidate is likely to face. For each: state what the interviewer is really assessing, give 3-4 talking points, and a short personalised model answer. Return structured JSON only.`,
      experimental_output: Output.object({ schema: QuestionsSchema }),
      maxOutputTokens: 2400,
    });

    if (!experimental_output) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const newBalance = (profileData.ai_credits ?? 0) - cost;
    await supabase.from("profiles").update({ ai_credits: newBalance }).eq("id", user.id);
    await supabase.from("ai_credit_transactions").insert({
      user_id: user.id,
      delta: -cost,
      tool: "interviewPrep",
      description: `Interview question bank${targetRole ? ` for ${targetRole}` : ""}`,
    });

    return NextResponse.json({
      questions: experimental_output.questions,
      creditsUsed: cost,
      creditsRemaining: newBalance,
    });
  } catch (err: any) {
    console.error("[v0] interview-prep error:", err?.message ?? err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
