import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { matchQualifyingRoles, scoreBand } from "@/lib/interview/matching";

export const maxDuration = 60;

const ScoreSchema = z.object({
  perAnswer: z.array(
    z.object({
      questionId: z.string(),
      score: z.number().min(0).max(100),
      feedback: z.string(),
      classification: z.string(),
    }),
  ),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

type IncomingAnswer = { questionId: string; question: string; focus?: string; transcript: string };

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    interviewId,
    fullName = "",
    specialization = "",
    roleCategory = "",
    skills = [],
    yearsExperience = null,
    answers = [],
  } = body as {
    interviewId?: string;
    fullName?: string;
    specialization?: string;
    roleCategory?: string;
    skills?: string[];
    yearsExperience?: number | null;
    answers?: IncomingAnswer[];
  };

  if (!Array.isArray(answers) || answers.length === 0) {
    return Response.json({ error: "No answers provided" }, { status: 400 });
  }

  const transcriptText = answers
    .map(
      (a, i) =>
        `Q${i + 1} (${a.focus || "general"}): ${a.question}\n` +
        `Answer: ${a.transcript?.trim() ? a.transcript.trim() : "[no audible answer]"}`,
    )
    .join("\n\n");

  let scored: z.infer<typeof ScoreSchema> | null = null;
  try {
    const { experimental_output } = await generateText({
      model: "openai/gpt-5.4-mini",
      experimental_output: Output.object({ schema: ScoreSchema }),
      system:
        "You are a fair, rigorous technical interviewer for DeepTalent grading a candidate's SPOKEN interview answers " +
        "(transcribed from speech, so ignore minor grammar/transcription artifacts). Evaluate relevance, depth, " +
        "concrete evidence, problem-solving and communication. Be honest and calibrated: empty, evasive, or off-topic " +
        "answers must score low. Strong, specific, experienced answers score high. Scores are 0-100.",
      prompt:
        `Candidate: ${fullName || "Unknown"}\n` +
        `Target role: ${specialization || roleCategory || "General specialist"}\n` +
        `Declared skills: ${(skills || []).join(", ") || "none"}\n` +
        `Years of experience: ${yearsExperience ?? "unspecified"}\n\n` +
        `Interview transcript:\n${transcriptText}\n\n` +
        "Score EACH answer (with a one-line classification like 'Strong / specific', 'Vague', 'Off-topic', 'No answer' " +
        "plus brief constructive feedback). Then give an overall 0-100 score, a 2-3 sentence summary, up to 3 key " +
        "strengths and up to 3 improvement areas. Weight the overall score by answer quality, not length.",
    });
    scored = experimental_output;
  } catch (err) {
    console.log("[v0] interview scoring failed, using heuristic:", (err as Error).message);
  }

  // Heuristic fallback if the model call fails.
  if (!scored) {
    const perAnswer = answers.map((a) => {
      const words = (a.transcript || "").trim().split(/\s+/).filter(Boolean).length;
      const score = Math.max(0, Math.min(100, Math.round(Math.min(words, 80) / 80 * 70 + (words > 5 ? 10 : 0))));
      return {
        questionId: a.questionId,
        score,
        feedback: words < 5 ? "Answer was too brief to assess." : "Answer recorded.",
        classification: words < 5 ? "No answer" : "Recorded",
      };
    });
    const overall = Math.round(perAnswer.reduce((s, a) => s + a.score, 0) / perAnswer.length);
    scored = {
      perAnswer,
      overallScore: overall,
      summary: "Automated heuristic assessment based on response completeness.",
      strengths: [],
      improvements: ["Provide more detailed, specific answers with concrete examples."],
    };
  }

  const overallScore = Math.round(scored.overallScore);
  const band = scoreBand(overallScore);

  const qualifiedRoles = matchQualifyingRoles({
    score: overallScore,
    skills: Array.isArray(skills) ? skills : [],
    specialization,
    roleCategory,
    yearsExperience,
  });

  // Merge per-answer scores back with their questions for storage.
  const answersWithScores = answers.map((a) => {
    const s = scored!.perAnswer.find((p) => p.questionId === a.questionId);
    return {
      questionId: a.questionId,
      question: a.question,
      focus: a.focus ?? null,
      transcript: a.transcript ?? "",
      score: s?.score ?? null,
      feedback: s?.feedback ?? null,
      classification: s?.classification ?? null,
    };
  });

  // Persist results onto the interview row (scoped to this user via RLS).
  if (interviewId) {
    const { error } = await supabase
      .from("talent_interviews")
      .update({
        answers: answersWithScores,
        overall_score: overallScore,
        score_band: band,
        ai_summary: scored.summary,
        strengths: scored.strengths ?? [],
        improvements: scored.improvements ?? [],
        qualified_roles: qualifiedRoles,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", interviewId)
      .eq("user_id", user.id);
    if (error) {
      console.log("[v0] failed to persist interview score:", error.message);
    }
  }

  return Response.json({
    overallScore,
    band,
    summary: scored.summary,
    strengths: scored.strengths ?? [],
    improvements: scored.improvements ?? [],
    perAnswer: scored.perAnswer,
    qualifiedRoles,
  });
}
