import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const isSuperAdmin = !!profile?.is_super_admin;

  const [
    { data: applications },
    { data: inquiries },
    { data: messages },
    { data: files },
    { count: profileCount },
  ] = await Promise.all([
    supabase.from("talent_applications").select("*").order("created_at", { ascending: false }),
    supabase.from("company_inquiries").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    supabase.from("legacy_files").select("*").order("migrated_at", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminShell
      email={userData.user.email ?? ""}
      fullName={profile?.full_name ?? ""}
      isSuperAdmin={isSuperAdmin}
      applications={applications ?? []}
      inquiries={inquiries ?? []}
      messages={messages ?? []}
      files={(files ?? []) as any}
      userCount={profileCount ?? 0}
    />
  );
}
