"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  User,
  FileText,
  Award,
  Briefcase,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ResumesPanel } from "@/components/dashboard/resumes-panel";
import { CertificationsPanel } from "@/components/dashboard/certifications-panel";
import { TalentOverview } from "@/components/dashboard/talent-overview";
import { SALARY_SCALE } from "@/lib/salary/scale";

type Tab = "overview" | "profile" | "resumes" | "certifications" | "applications" | "openRoles";

const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "profile", label: "Profile", icon: User },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "applications", label: "Applications", icon: Briefcase },
  { id: "openRoles", label: "Open Roles", icon: TrendingUp },
];

export function TalentDashboard({
  email,
  profile,
  applications,
  resumes,
  certifications,
  interview,
  actions,
}: {
  email: string;
  profile: any;
  applications: any[];
  resumes: any[];
  certifications: any[];
  interview: any | null;
  actions: {
    updateProfile: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
    uploadResume: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
    deleteResume: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
    setPrimaryResume: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
    addCertification: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
    deleteCertification: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
    getResumeDownloadUrl: (path: string) => Promise<{ ok: boolean; url?: string; error?: string }>;
  };
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const counts: Partial<Record<Tab, number>> = {
    resumes: resumes.length,
    certifications: certifications.length,
    applications: applications.length,
  };

  return (
    <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full">
      {/* Sidebar */}
      <aside className="lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
        <nav className="flex lg:flex-col gap-1 p-3 lg:p-4 overflow-x-auto lg:sticky lg:top-0">
          <p className="hidden lg:flex items-center gap-2 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            <LayoutDashboard className="size-3.5" /> Dashboard
          </p>
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 h-11 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-[#3B5BDB] text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
                {counts[item.id] != null && (
                  <span
                    className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                      active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {counts[item.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 md:px-8 py-8">
        {tab === "overview" && (
          <TalentOverview
            email={email}
            profile={profile}
            applications={applications}
            resumes={resumes}
            certifications={certifications}
            interview={interview}
            onNavigate={(t) => setTab(t)}
          />
        )}
        {tab === "profile" && (
          <Section title="Profile" subtitle="Keep your details current so recruiters can find you.">
            <ProfileForm profile={profile} action={actions.updateProfile} />
          </Section>
        )}
        {tab === "resumes" && (
          <Section title="Resumes" subtitle="Upload and manage the resumes you send to recruiters.">
            <ResumesPanel
              resumes={resumes}
              uploadAction={actions.uploadResume}
              deleteAction={actions.deleteResume}
              setPrimaryAction={actions.setPrimaryResume}
              signUrlAction={actions.getResumeDownloadUrl}
            />
          </Section>
        )}
        {tab === "certifications" && (
          <Section title="Certifications" subtitle="Showcase verified credentials that set you apart.">
            <CertificationsPanel
              certifications={certifications}
              addAction={actions.addCertification}
              deleteAction={actions.deleteCertification}
              signUrlAction={actions.getResumeDownloadUrl}
            />
          </Section>
        )}
        {tab === "applications" && (
          <Section title="Applications" subtitle="Track the status of every role you've applied to.">
            <ApplicationsTable applications={applications} />
          </Section>
        )}
        {tab === "openRoles" && (
          <Section title="Open Roles" subtitle="In-demand roles hiring through DeepTalent, with live monthly rates.">
            <OpenRoles profile={profile} />
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function OpenRoles({ profile }: { profile: any }) {
  const yrs = Number(profile?.years_experience ?? 0);
  const seniority: "junior" | "mid" | "senior" = yrs >= 6 ? "senior" : yrs >= 3 ? "mid" : "junior";

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {SALARY_SCALE.map((r) => (
        <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 leading-tight">{r.label}</h3>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{seniority} • Remote</p>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${r.usd[seniority].toLocaleString()}
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </p>
              <p className="text-[11px] text-gray-400">
                Range ${r.usd.junior.toLocaleString()}–${r.usd.senior.toLocaleString()}
              </p>
            </div>
            <Link
              href="/talents/apply"
              className="inline-flex h-9 px-4 items-center justify-center rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
            >
              Apply
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationsTable({ applications }: { applications: any[] }) {
  if (applications.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-500">
        No applications yet.
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3">Role category</th>
            <th className="px-6 py-3">Specialization</th>
            <th className="px-6 py-3">Years</th>
            <th className="px-6 py-3">Country</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-900 font-medium">{a.role_category || "—"}</td>
              <td className="px-6 py-4 text-gray-600">{a.specialization || "—"}</td>
              <td className="px-6 py-4 text-gray-600">{a.years_experience ?? "—"}</td>
              <td className="px-6 py-4 text-gray-600">{a.country || "—"}</td>
              <td className="px-6 py-4">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-6 py-4 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
