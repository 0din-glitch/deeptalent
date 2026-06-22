"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { FilesTab } from "@/components/admin/files-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { SubmissionsTab } from "@/components/admin/submissions-tab";
import { ApprovedTalentTab } from "@/components/admin/approved-talent-tab";
import { ApprovalsTab } from "@/components/admin/approvals-tab";
import { ActivityTab } from "@/components/admin/activity-tab";
import { ContentTab } from "@/components/admin/content-tab";
import { InterviewsTab } from "@/components/admin/interviews-tab";
import { PlacementsTab } from "@/components/admin/placements-tab";
import { useAdminMe } from "@/components/admin/use-admin-me";
import {
  Activity,
  Briefcase,
  CheckSquare,
  FileText,
  Folder,
  LayoutDashboard,
  Mail,
  Mic,
  Users,
  UserCheck,
  Building2,
} from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

type LegacyFile = {
  id: string;
  bucket: "avatars" | "verification";
  storage_path: string;
  legacy_user_ref: string | null;
  file_name: string;
  size_bytes: number | null;
  content_type: string | null;
  migrated_at: string;
};

type Tab =
  | "users"
  | "applications"
  | "approved_talent"
  | "interviews"
  | "inquiries"
  | "messages"
  | "files"
  | "content"
  | "approvals"
  | "activity"
  | "placements";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AdminTabs({
  applications,
  inquiries,
  messages,
  files,
  userCount,
}: {
  applications: any[];
  inquiries: any[];
  messages: Message[];
  files: LegacyFile[];
  userCount: number;
}) {
  const [tab, setTab] = useState<Tab>("users");
  const { me } = useAdminMe();

  const { data: pendingData } = useSWR<{ requests: any[] }>(
    "/api/admin/deletion-requests?status=pending",
    fetcher,
    { refreshInterval: 60_000 }
  );
  const pendingApprovals = pendingData?.requests?.length ?? 0;

  const { data: appData } = useSWR<{ rows: any[] }>(
    "/api/admin/submissions?kind=talent_application",
    fetcher,
    { fallbackData: { rows: applications } }
  );
  const { data: inqData } = useSWR<{ rows: any[] }>(
    "/api/admin/submissions?kind=company_inquiry",
    fetcher,
    { fallbackData: { rows: inquiries } }
  );

  const appCount = appData?.rows?.length ?? applications.length;
  const inqCount = inqData?.rows?.length ?? inquiries.length;
  const approvedCount = (appData?.rows ?? applications).filter(
    (r: any) => r?.status === "approved"
  ).length;

  const { data: interviewData } = useSWR<{ rows: any[] }>(
    "/api/admin/interviews",
    fetcher,
    { refreshInterval: 60_000 }
  );
  const interviewCount = interviewData?.rows?.length ?? 0;

  const navGroups = [
    {
      label: "People",
      items: [
        { id: "users" as Tab, label: "Users", icon: Users, count: userCount },
        { id: "applications" as Tab, label: "Talent Applications", icon: FileText, count: appCount },
        { id: "approved_talent" as Tab, label: "Approved Talent", icon: UserCheck, count: approvedCount },
        { id: "inquiries" as Tab, label: "Company Inquiries", icon: Building2, count: inqCount },
        { id: "placements" as Tab, label: "Placements", icon: Briefcase, count: null },
      ],
    },
    {
      label: "Comms",
      items: [
        { id: "messages" as Tab, label: "Contact Messages", icon: Mail, count: messages.length },
        { id: "interviews" as Tab, label: "AI Interviews", icon: Mic, count: interviewCount },
      ],
    },
    {
      label: "System",
      items: [
        { id: "files" as Tab, label: "Files", icon: Folder, count: files.length },
        { id: "content" as Tab, label: "Content", icon: LayoutDashboard, count: null },
        {
          id: "approvals" as Tab,
          label: me?.is_super_admin ? "Approvals" : "My Requests",
          icon: CheckSquare,
          count: pendingApprovals > 0 ? pendingApprovals : null,
          tone: pendingApprovals > 0 ? ("amber" as const) : undefined,
        },
        { id: "activity" as Tab, label: "Activity", icon: Activity, count: null },
      ],
    },
  ];

  // Current tab label for mobile header
  const currentLabel =
    navGroups.flatMap((g) => g.items).find((i) => i.id === tab)?.label ?? "Dashboard";

  return (
    <div className="flex gap-0 min-h-[calc(100vh-220px)]">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-[#0F1629] rounded-2xl mr-6 p-3 flex flex-col gap-1 self-start sticky top-6">
        {/* Logo */}
        <div className="px-3 pt-3 pb-3 mb-1 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo-wordmark.png"
              alt="DeepTalent"
              width={120}
              height={28}
              className="brightness-0 invert"
              priority
            />
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mt-1.5">
            Admin Panel
          </p>
        </div>

        {navGroups.map((group) => (
          <div key={group.label} className="mt-3 first:mt-0">
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = tab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-[#3B5BDB] text-white shadow-md shadow-[#3B5BDB]/30"
                      : "text-white/55 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                        active
                          ? "bg-white/20 text-white"
                          : item.tone === "amber"
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-white/12 text-white/60"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {/* Section header */}
        <div className="mb-5 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{currentLabel}</h2>
        </div>

        {tab === "users" && <UsersTab />}
        {tab === "placements" && <PlacementsTab />}
        {tab === "files" && <FilesTab initialFiles={files} />}
        {tab === "applications" && <SubmissionsTab kind="talent_application" />}
        {tab === "approved_talent" && <ApprovedTalentTab />}
        {tab === "inquiries" && <SubmissionsTab kind="company_inquiry" />}
        {tab === "content" && <ContentTab />}
        {tab === "interviews" && <InterviewsTab />}
        {tab === "approvals" && <ApprovalsTab />}
        {tab === "activity" && <ActivityTab />}
        {tab === "messages" && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <MessagesTable rows={messages} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-amber-50 text-amber-700",
    read: "bg-blue-50 text-blue-700",
    responded: "bg-emerald-50 text-emerald-700",
    archived: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function MessagesTable({ rows }: { rows: Message[] }) {
  if (rows.length === 0)
    return (
      <div className="p-12 text-center text-gray-500">No messages yet.</div>
    );
  return (
    <table className="w-full">
      <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <tr>
          <th className="px-6 py-3">From</th>
          <th className="px-6 py-3">Subject</th>
          <th className="px-6 py-3">Message</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 align-top">
            <td className="px-6 py-4 font-medium text-gray-900">
              {r.name}
              <br />
              <span className="text-xs text-gray-500 font-normal">{r.email}</span>
            </td>
            <td className="px-6 py-4 text-gray-600">{r.subject || "—"}</td>
            <td className="px-6 py-4 text-gray-600 max-w-xs">
              <p className="line-clamp-2">{r.message}</p>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={r.status} />
            </td>
            <td className="px-6 py-4 text-gray-500">
              {new Date(r.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
