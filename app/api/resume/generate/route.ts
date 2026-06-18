import { generateText, Output } from "ai";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { section, prompt, currentData, profile } = await req.json();

  const sectionPrompts: Record<string, string> = {
    summary: `Write a compelling professional summary for a CV/resume. It should be 3-4 sentences, highlight the candidate's strongest value proposition, and be optimised for global remote tech roles. Focus on impact and expertise. Return only the summary text.`,
    experience: `Write a polished work experience bullet point list for the given role. Use strong action verbs, include quantified achievements where possible, and follow the STAR method. Format as 3-5 bullet points starting with "•". Return only the bullet points.`,
    skills: `Based on the candidate's background, suggest a comprehensive, well-organised list of technical and soft skills. Group them into categories (e.g. Languages, Frameworks, Tools, Soft Skills). Return as a structured list.`,
    cover: `Write a professional cover letter opening paragraph (3-4 sentences) that is compelling, personalised, and positions the candidate strongly for global remote roles.`,
  };

  const contextPrompt = sectionPrompts[section] || `Improve the following resume content for the "${section}" section. Make it professional, concise, and impactful for global tech roles.`;

  const userContext = `
Candidate context:
- Name: ${profile?.full_name || "Not provided"}
- Role: ${profile?.role_category || "Tech professional"}
- Years of experience: ${profile?.years_experience || "Not specified"}
- Country: ${profile?.country || "Africa"}
- Skills: ${profile?.skills || "Not specified"}
- Current section content: ${currentData || "None provided"}
- Additional instructions: ${prompt || "None"}
  `.trim();

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    system: `You are an expert resume writer who specialises in helping African tech professionals land global remote roles. You write crisp, ATS-optimised, impactful resume content. Always be concise and direct. Return only the requested content with no preamble or explanation.`,
    prompt: `${contextPrompt}\n\n${userContext}`,
    maxOutputTokens: 600,
  });

  return Response.json({ text });
}
