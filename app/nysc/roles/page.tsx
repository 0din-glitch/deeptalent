import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NyscShell } from "@/components/nysc/nysc-shell";
import { NyscRolesView } from "@/components/nysc/nysc-roles-view";

export const metadata = {
  title: "Global roles for NYSC corps members | DeepTalent",
  description:
    "Entry-level remote roles with UK, US, Canadian and Australian employers, open to Global Workforce Ready NYSC corps members.",
};

export default async function NyscRolesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/nysc?track=ready");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <NyscShell
      active="roles"
      name={profile?.full_name}
      eyebrow="You're Global Workforce Ready"
      title="Junior roles, open now"
      subtitle="Hand-picked entry-level roles with UK, US, Canadian and Australian employers. Apply and our team takes it from vetting through to deployment — usually 14–21 days."
    >
      <NyscRolesView />
    </NyscShell>
  );
}
