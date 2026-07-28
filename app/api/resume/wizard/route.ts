import { generateText, Output } from "ai";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const maxDuration = 60;

const CREDIT_COST = 5;

const WizardAnswers = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  targetRole: z.string(),
  yearsExperience: z.string(),
  currentTitle: z.string().optional(),
  topSkills: z.string(),
  biggestAchievement: z.string(),
  workHistory: z.string(), // "Company | Title | Period | what you did"
  education: z.string(),   // "Degree | School | Year"
  extraContext: z.string().optional(),
});

const ResumeOutput = z.object({
  summary: z.string(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      period: z.string(),
      bullets: z.string(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      year: z.string(),
    })
  ),
  skills: z.string(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = WizardAnswers.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid answers" }, { status: 400 });
  }

  const answers = parsed.data;

  // Check + deduct credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credits")
    .eq("id", user.id)
    .single();

  if (!profile || profile.ai_credits < CREDIT_COST) {
    return Response.json(
      { error: `Not enough credits. You need ${CREDIT_COST} credits for an AI-built resume.` },
      { status: 402 }
    );
  }

  const { error: deductError } = await supabase
    .from("profiles")
    .update({ ai_credits: profile.ai_credits - CREDIT_COST })
    .eq("id", user.id)
    .gte("ai_credits", CREDIT_COST);

  if (deductError) {
    return Response.json({ error: "Credit deduction failed. Please try again." }, { status: 500 });
  }

  await supabase.from("ai_credit_transactions").insert({
    user_id: user.id,
    delta: -CREDIT_COST,
    tool: "resumeWizard",
    description: "AI Resume Wizard",
  });

  const { experimental_output: resumeData } = await generateText({
    model: "openai/gpt-4.1",
    experimental_output: Output.object({ schema: ResumeOutput }),
    system: `You are an expert resume writer who specialises in helping African tech and finance professionals land global remote roles. You write crisp, ATS-optimised, impactful resume content. Use strong action verbs. Bullet points should follow STAR method and include quantified achievements where possible. Format bullets as "• bullet 1\n• bullet 2". Keep the summary to 3–4 sentences. Return exactly the JSON structure — nothing else.`,
    prompt: `Build a complete, polished resume from these answers:

Name: ${answers.fullName}
Email: ${answers.email}
Phone: ${answers.phone || "not given"}
Location: ${answers.location || "not given"}
Target Role: ${answers.targetRole}
Years Experience: ${answers.yearsExperience}
Current/Recent Title: ${answers.currentTitle || "not given"}
Top Skills: ${answers.topSkills}
Biggest Achievement: ${answers.biggestAchievement}

Work History (one entry per line, format: Company | Title | Period | Description):
${answers.workHistory}

Education (one entry per line, format: Degree | School | Year):
${answers.education}

Extra context: ${answers.extraContext || "none"}

Return a JSON object with: summary, experience (array), education (array), skills (formatted string by category).`,
  });

  return Response.json({ resumeData });
}
