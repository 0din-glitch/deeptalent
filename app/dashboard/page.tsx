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
  getResumeDownloadUrl,
} from "@/lib/dashboard/actions";
import { Briefcase, Building2, FileText, User } from "lucide-react";

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

  const [appsRes, inqRes, resumesRes, certsRes] = await Promise.all([
    supabase.from("talent_applications").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("company_inquiries").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("talent_resumes").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("talent_certifications").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
  ]);

  const applications = appsRes.data ?? [];
  const inquiries = inqRes.data ?? [];
  const resumes = resumesRes.data ?? [];
  const certifications = certsRes.data ?? [];

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
            <CompanyDashboard inquiries={inquiries} />
          </div>
        ) : (
          <TalentDashboard
            email={userData.user.email ?? ""}
            profile={profile ?? {}}
            applications={applications}
            resumes={resumes}
            certifications={certifications}
            actions={{
              updateProfile,
              uploadResume,
              deleteResume,
              setPrimaryResume,
              addCertification,
              deleteCertification,
              getResumeDownloadUrl,
            }}
          />
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

function CompanyDashboard({ inquiries }: { inquiries: any[] }) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Open inquiries" value={inquiries.length} icon={FileText} />
        <StatCard label="Account role" value="Company" icon={User} />
        <StatCard label="Member since" value={inquiries[0]?.created_at ? new Date(inquiries[0].created_at).toLocaleDateString() : "—"} icon={Briefcase} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/companies/hire" className="bg-[#3B5BDB] text-white rounded-2xl p-6 hover:bg-[#2f49b2] transition-colors flex items-start gap-4">
          <Building2 className="size-8 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Submit new inquiry</h3>
            <p className="text-white/80 text-sm mt-1">Tell us about another role and we&apos;ll match candidates within 48 hours.</p>
          </div>
        </Link>

        <Link href="/contact" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex items-start gap-4">
          <FileText className="size-8 shrink-0 text-[#3B5BDB]" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">Contact support</h3>
            <p className="text-gray-600 text-sm mt-1">Reach our team for any account or hiring questions.</p>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your inquiries</h2>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {inquiries.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Urgency</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{i.role_title || i.role_category || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{i.urgency || "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(i.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No inquiries yet.</p>
              <Link href="/companies/hire" className="inline-flex h-10 px-5 items-center justify-center rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors">
                Submit inquiry
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
      <div className="size-12 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB]">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    reviewing: "bg-blue-50 text-blue-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    new: "bg-amber-50 text-amber-700",
    contacted: "bg-blue-50 text-blue-700",
    qualified: "bg-emerald-50 text-emerald-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "—"}
    </span>
  );
}
