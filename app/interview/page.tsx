import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InterviewFlow } from "@/components/interview/interview-flow";

export const metadata = {
  title: "AI Interview · DeepTalent",
  description: "Complete your AI-powered screening interview to unlock matching roles.",
};

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/auth/login?next=/interview");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, specialization, role_category, skills, years_experience, bio, role")
    .eq("id", userData.user.id)
    .single();

  // Companies/admins don't take talent interviews.
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "company") redirect("/dashboard");

  return (
    <InterviewFlow
      email={userData.user.email ?? ""}
      initialProfile={{
        full_name: profile?.full_name ?? "",
        specialization: profile?.specialization ?? "",
        role_category: profile?.role_category ?? "",
        skills: (profile?.skills as string[] | null) ?? [],
        years_experience: profile?.years_experience ?? null,
        bio: profile?.bio ?? "",
      }}
    />
  );
}
