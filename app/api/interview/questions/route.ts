import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const QuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        focus: z.string(),
      }),
    )
    .min(4)
    .max(6),
});

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
    fullName = "",
    specialization = "",
    roleCategory = "",
    skills = [],
    yearsExperience = null,
    bio = "",
  } = body as {
    fullName?: string;
    specialization?: string;
    roleCategory?: string;
    skills?: string[];
    yearsExperience?: number | null;
    bio?: string;
  };

  const skillList = Array.isArray(skills) ? skills.filter(Boolean).join(", ") : "";

  try {
    const { experimental_output } = await generateText({
      model: "openai/gpt-5.4-mini",
      experimental_output: Output.object({ schema: QuestionsSchema }),
      system:
        "You are an expert technical recruiter conducting a short spoken screening interview for DeepTalent, " +
        "a marketplace of pre-vetted remote specialists. Generate concise, clear interview questions a candidate " +
        "will answer OUT LOUD. Questions must be answerable verbally in 30-90 seconds, avoid asking them to write " +
        "code, and progressively probe real experience, depth of skill, problem-solving and communication. " +
        "Tailor strongly to the candidate's role and declared skills.",
      prompt:
        `Candidate: ${fullName || "Unknown"}\n` +
        `Target role / specialization: ${specialization || roleCategory || "General specialist"}\n` +
        `Role category: ${roleCategory || "N/A"}\n` +
        `Years of experience: ${yearsExperience ?? "unspecified"}\n` +
        `Declared skills: ${skillList || "none provided"}\n` +
        `Short bio: ${bio || "none"}\n\n` +
        "Produce 5 spoken-interview questions. The first should be a warm, open intro question " +
        "('Tell us about yourself and your experience with ...'). The remaining should escalate in depth and be " +
        "specific to the declared skills and role. For each question include a short 'focus' label (e.g. " +
        "'Communication', 'Technical depth', 'Problem solving', 'System design', 'Domain knowledge').",
    });

    return Response.json({ questions: experimental_output.questions });
  } catch (err) {
    console.log("[v0] interview question generation failed:", (err as Error).message);
    // Graceful fallback so the interview can still proceed.
    const focus = specialization || roleCategory || "your field";
    return Response.json({
      questions: [
        {
          id: "q1",
          question: `Tell us about yourself and your experience working in ${focus}.`,
          focus: "Introduction",
        },
        {
          id: "q2",
          question: `What's a challenging project you've worked on in ${focus}, and what was your specific contribution?`,
          focus: "Experience",
        },
        {
          id: "q3",
          question: `Walk us through how you approach solving a difficult problem in your work.`,
          focus: "Problem solving",
        },
        {
          id: "q4",
          question: `Which of your skills are you strongest in, and how have you applied them recently?`,
          focus: "Technical depth",
        },
        {
          id: "q5",
          question: `How do you communicate and collaborate with a remote team across time zones?`,
          focus: "Communication",
        },
      ],
    });
  }
}
