"use client";

import { useState } from "react";
import { LayoutGrid, User, FileText, Award, Briefcase } from "lucide-react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ResumesPanel } from "@/components/dashboard/resumes-panel";
import { CertificationsPanel } from "@/components/dashboard/certifications-panel";

type Tab = "overview" | "profile" | "resumes" | "certifications" | "applications";

export function TalentDashboard({
  profile,
  applications,
  resumes,
  certifications,
  overview,
  actions,
}: {
  profile: any;
  applications: any[];
  resumes: any[];
  certifications: any[];
  overview: React.ReactNode;
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

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        <TabButton icon={LayoutGrid} label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
        <TabButton icon={User} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        <TabButton icon={FileText} label="Resumes" count={resumes.length} active={tab === "resumes"} onClick={() => setTab("resumes")} />
        <TabButton icon={Award} label="Certifications" count={certifications.length} active={tab === "certifications"} onClick={() => setTab("certifications")} />
        <TabButton icon={Briefcase} label="Applications" count={applications.length} active={tab === "applications"} onClick={() => setTab("applications")} />
      </div>

      {tab === "overview" && overview}
      {tab === "profile" && <ProfileForm profile={profile} action={actions.updateProfile} />}
      {tab === "resumes" && (
        <ResumesPanel
          resumes={resumes}
          uploadAction={actions.uploadResume}
          deleteAction={actions.deleteResume}
          setPrimaryAction={actions.setPrimaryResume}
          signUrlAction={actions.getResumeDownloadUrl}
        />
      )}
      {tab === "certifications" && (
        <CertificationsPanel
          certifications={certifications}
          addAction={actions.addCertification}
          deleteAction={actions.deleteCertification}
          signUrlAction={actions.getResumeDownloadUrl}
        />
      )}
      {tab === "applications" && <ApplicationsTable applications={applications} />}
    </div>
  );
}

function TabButton({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-11 px-4 -mb-px border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
        active ? "border-[#3B5BDB] text-[#3B5BDB]" : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      <Icon className="size-4" />
      {label}
      {typeof count === "number" && (
        <span
          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
            active ? "bg-[#3B5BDB]/10 text-[#3B5BDB]" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
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
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
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
