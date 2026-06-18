import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

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
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <DashboardHeader
        email={userData.user.email ?? ""}
        fullName={profile?.full_name ?? ""}
        role="admin"
        isSuperAdmin={isSuperAdmin}
      />

      <section className="flex-1 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-balance">Admin dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isSuperAdmin
              ? "Super admin — full access including suspend, delete, and approval queue."
              : "View and edit submissions, schedule meetings, and request deletions for super-admin approval."}
          </p>
        </div>

        <AdminTabs
          applications={applications ?? []}
          inquiries={inquiries ?? []}
          messages={messages ?? []}
          files={(files ?? []) as any}
          userCount={profileCount ?? 0}
        />
      </section>
    </main>
  );
}


