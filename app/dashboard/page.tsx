import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/site/site-footer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TalentDashboard } from "@/components/dashboard/talent-dashboard";
import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";
import {
  updateProfile,
  uploadResume,
  deleteResume,
  setPrimaryResume,
  addCertification,
  deleteCertification,
  deleteApplication,
  getResumeDownloadUrl,
} from "@/lib/dashboard/actions";
import { CompanyDashboard } from "@/components/dashboard/company-dashboard";

export default async function DashboardPage() {
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

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const isCompany = profile?.role === "company";

  const [appsRes, inqRes, resumesRes, certsRes, interviewRes, placementsRes] = await Promise.all([
    supabase.from("talent_applications").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("company_inquiries").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("talent_resumes").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("talent_certifications").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase
      .from("talent_interviews")
      .select("id, status, overall_score, score_band, qualified_roles, completed_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    isCompany
      ? supabase.from("placements").select("*").eq("company_user_id", userData.user.id).order("created_at", { ascending: false })
      : supabase.from("placements").select("*").eq("talent_user_id", userData.user.id).order("created_at", { ascending: false }),
  ]);

  const applications = appsRes.data ?? [];
  const inquiries = inqRes.data ?? [];
  const resumes = resumesRes.data ?? [];
  const certifications = certsRes.data ?? [];
  const interview = interviewRes.data ?? null;
  const placements = placementsRes.data ?? [];

  return (
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <ChangePasswordModal mustChange={profile?.must_change_password === true} />
      <DashboardHeader email={userData.user.email ?? ""} fullName={profile?.full_name ?? ""} role={profile?.role ?? "talent"} />

      <section className="flex-1 w-full">
        {isCompany ? (
          <div className="px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 text-balance">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-gray-600 mt-1">Track your hiring inquiries and account.</p>
            </div>
            <CompanyDashboard inquiries={inquiries} placements={placements} />
          </div>
        ) : (
          <TalentDashboard
            email={userData.user.email ?? ""}
            profile={profile ?? {}}
            applications={applications}
            resumes={resumes}
            certifications={certifications}
            interview={interview}
            placements={placements}
            actions={{
              updateProfile,
              uploadResume,
              deleteResume,
              setPrimaryResume,
              addCertification,
              deleteCertification,
              deleteApplication,
              getResumeDownloadUrl,
            }}
          />
        )}
      </section>

      <SiteFooter />
    </main>
  );
}




