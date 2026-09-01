import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NyscShell } from "@/components/nysc/nysc-shell";
import { NyscTrainingView } from "@/components/nysc/nysc-training-view";

export const metadata = {
  title: "Post-NYSC pathways for NYSC corps members | DeepTalent",
  description:
    "Get Global Workforce Ready — a three-day course that prepares NYSC corps members for remote roles with UK, US, Canadian and Australian employers.",
};

export default async function NyscTrainingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/nysc?track=training");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <NyscShell
      active="training"
      name={profile?.full_name}
      eyebrow="Get Global Workforce Ready"
      title="Train to the global standard"
      subtitle="Close the readiness gap in three areas global employers screen for: employability, work culture and time discipline, and the AI tools every remote team now expects. Start lesson one free."
    >
      <NyscTrainingView />
    </NyscShell>
  );
}
