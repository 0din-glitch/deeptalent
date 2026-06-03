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
import { Briefcase, Building2, FileText, User, Award, ExternalLink, MapPin, Phone, Mail, Globe } from "lucide-react";

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

      <section className="flex-1 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-balance">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-gray-600 mt-1">
            {isCompany
              ? "Track your hiring inquiries and account."
              : "Manage your profile, resumes, certifications, and applications."}
          </p>
        </div>

        {isCompany ? (
          <CompanyDashboard inquiries={inquiries} />
        ) : (
          <TalentDashboard
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
            overview={
              <TalentOverview
                email={userData.user.email ?? ""}
                profile={profile ?? {}}
                applications={applications}
                resumes={resumes}
                certifications={certifications}
              />
            }
          />
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

function TalentOverview({
  email,
  profile,
  applications,
  resumes,
  certifications,
}: {
  email: string;
  profile: any;
  applications: any[];
  resumes: any[];
  certifications: any[];
}) {
  const primaryResume = resumes.find((r) => r.is_primary) || resumes[0];
  const completion = profileCompletion(profile);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Applications" value={applications.length} icon={Briefcase} />
        <StatCard label="Resumes" value={resumes.length} icon={FileText} />
        <StatCard label="Certifications" value={certifications.length} icon={Award} />
        <StatCard label="Profile completion" value={`${completion}%`} icon={User} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="size-16 rounded-2xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center text-xl font-semibold">
              {(profile?.full_name || email || "?")
                .split(/[\s@]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((s: string) => s[0]?.toUpperCase())
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">{profile?.full_name || "Add your name"}</h2>
              {profile?.headline && <p className="text-gray-600 mt-0.5">{profile.headline}</p>}
              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-gray-500 mt-3">
                <Info icon={Mail}>{email}</Info>
                {profile?.phone && <Info icon={Phone}>{profile.phone}</Info>}
                {(profile?.city || profile?.country || profile?.location) && (
                  <Info icon={MapPin}>
                    {[profile.city, profile.country].filter(Boolean).join(", ") || profile.location}
                  </Info>
                )}
                {profile?.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#3B5BDB] hover:underline">
                    <Globe className="size-4" />
                    Website
                  </a>
                )}
              </div>
              {(profile?.linkedin_url || profile?.portfolio_url || profile?.github_url) && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {profile?.linkedin_url && <LinkPill href={profile.linkedin_url}>LinkedIn</LinkPill>}
                  {profile?.portfolio_url && <LinkPill href={profile.portfolio_url}>Portfolio</LinkPill>}
                  {profile?.github_url && <LinkPill href={profile.github_url}>GitHub</LinkPill>}
                </div>
              )}
            </div>
          </div>

          {profile?.bio && <p className="text-sm text-gray-700 mt-5 whitespace-pre-wrap">{profile.bio}</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <KvCell label="Role" value={profile?.role_category || profile?.primary_skill} />
            <KvCell label="Specialization" value={profile?.specialization} />
            <KvCell label="Experience" value={profile?.years_experience != null ? `${profile.years_experience}+ years` : null} />
            <KvCell label="Availability" value={profile?.availability} />
            <KvCell
              label="Hourly rate"
              value={profile?.hourly_rate ? `${profile.currency || "USD"} ${profile.hourly_rate}` : null}
            />
            <KvCell label="Verification" value={profile?.verification_status} />
          </div>

          {(profile?.skills?.length || profile?.languages?.length || profile?.tools?.length || profile?.secondary_skills?.length) ? (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              {profile?.skills?.length ? <Tags label="Skills" items={profile.skills} /> : null}
              {!profile?.skills?.length && profile?.secondary_skills?.length ? (
                <Tags label="Skills" items={profile.secondary_skills} />
              ) : null}
              {profile?.tools?.length ? <Tags label="Tools" items={profile.tools} /> : null}
              {profile?.languages?.length ? <Tags label="Languages" items={profile.languages} /> : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 text-sm">Primary resume</h3>
            {primaryResume ? (
              <div className="mt-3">
                <p className="font-medium text-gray-900 truncate">{primaryResume.title}</p>
                <p className="text-xs text-gray-500 truncate">{primaryResume.file_name}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Upload a resume in the Resumes tab.</p>
            )}
          </div>

          <Link
            href="/talents/apply"
            className="block bg-[#3B5BDB] text-white rounded-2xl p-5 hover:bg-[#2f49b2] transition-colors"
          >
            <p className="font-bold">Apply for a new role</p>
            <p className="text-white/80 text-sm mt-1">Submit a tailored application.</p>
          </Link>

          <Link
            href="/contact"
            className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <p className="font-bold text-gray-900">Contact support</p>
            <p className="text-gray-600 text-sm mt-1">Get help with your account or applications.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function profileCompletion(p: any): number {
  const fields = ["full_name", "headline", "phone", "country", "city", "bio", "linkedin_url", "role_category", "specialization", "years_experience"];
  const filled = fields.filter((f) => {
    const v = p?.[f];
    return v != null && String(v).trim() !== "";
  }).length;
  return Math.round((filled / fields.length) * 100);
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

function Info({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4" />
      {children}
    </span>
  );
}

function LinkPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-3 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
    >
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

function KvCell({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function Tags({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-medium">
            {s}
          </span>
        ))}
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
