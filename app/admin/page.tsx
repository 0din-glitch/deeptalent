import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Briefcase, FileText, Folder, Mail, Users } from "lucide-react";

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
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? "Super admin · full access including suspend, delete, and approval queue."
              : "View and edit submissions, schedule meetings, and request deletions for super-admin approval."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard label="Talent applications" value={applications?.length ?? 0} icon={Users} />
          <StatCard label="Company inquiries" value={inquiries?.length ?? 0} icon={Briefcase} />
          <StatCard label="Contact messages" value={messages?.length ?? 0} icon={Mail} />
          <StatCard label="Files" value={files?.length ?? 0} icon={Folder} />
          <StatCard label="Total users" value={profileCount ?? 0} icon={FileText} />
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

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3">
      <div className="size-10 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB]">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
