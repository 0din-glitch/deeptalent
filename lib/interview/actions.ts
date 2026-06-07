"use server";

import { createClient } from "@/lib/supabase/server";

export type StartInterviewInput = {
  candidateName: string;
  email?: string | null;
  roleCategory?: string | null;
  specialization?: string | null;
  seniority?: string | null;
  skills?: string[];
  yearsExperience?: number | null;
  questions: { id: string; question: string; focus?: string }[];
};

/** Create the interview row when the candidate begins. Returns the new id. */
export async function startInterview(input: StartInterviewInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data, error } = await supabase
    .from("talent_interviews")
    .insert({
      user_id: user.id,
      candidate_name: input.candidateName,
      email: input.email ?? user.email ?? null,
      role_category: input.roleCategory ?? null,
      specialization: input.specialization ?? null,
      seniority: input.seniority ?? null,
      skills: input.skills ?? [],
      years_experience: input.yearsExperience ?? null,
      questions: input.questions ?? [],
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error) {
    console.log("[v0] startInterview error:", error.message);
    return { error: error.message };
  }

  // Keep the candidate's profile in sync with what they entered.
  await supabase
    .from("profiles")
    .update({
      full_name: input.candidateName,
      specialization: input.specialization ?? null,
      role_category: input.roleCategory ?? null,
      skills: input.skills ?? [],
      years_experience: input.yearsExperience ?? null,
    })
    .eq("id", user.id);

  return { id: data.id as string };
}

/** Attach the uploaded video path + duration to the interview. */
export async function attachInterviewVideo(opts: {
  interviewId: string;
  videoPath: string;
  durationSeconds?: number | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { error } = await supabase
    .from("talent_interviews")
    .update({
      video_path: opts.videoPath,
      video_duration_seconds: opts.durationSeconds ?? null,
    })
    .eq("id", opts.interviewId)
    .eq("user_id", user.id);

  if (error) {
    console.log("[v0] attachInterviewVideo error:", error.message);
    return { error: error.message };
  }
  return { ok: true as const };
}

/** Fetch the current user's most recent completed interview (for dashboard). */
export async function getLatestInterview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("talent_interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
