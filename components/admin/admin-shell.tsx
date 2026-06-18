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
  ChevronRight,
  FileText,
  Folder,
  LayoutDashboard,
  LogOut,
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

export function AdminShell({
  email,
  fullName,
  isSuperAdmin,
  applications,
  inquiries,
  messages,
  files,
  userCount,
}: {
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
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
  const { data: interviewData } = useSWR<{ rows: any[] }>(
    "/api/admin/interviews",
    fetcher,
    { refreshInterval: 60_000 }
  );

  const appCount = appData?.rows?.length ?? applications.length;
  const inqCount = inqData?.rows?.length ?? inquiries.length;
  const approvedCount = (appData?.rows ?? applications).filter(
    (r: any) => r?.status === "approved"
  ).length;
  const interviewCount = interviewData?.rows?.length ?? 0;

  const navGroups = [
    {
      label: "People",
      items: [
        { id: "users" as Tab, label: "Users", icon: Users, count: userCount },
        { id: "applications" as Tab, label: "Applications", icon: FileText, count: appCount },
        { id: "approved_talent" as Tab, label: "Approved Talent", icon: UserCheck, count: approvedCount },
        { id: "inquiries" as Tab, label: "Company Inquiries", icon: Building2, count: inqCount },
        { id: "placements" as Tab, label: "Placements", icon: Briefcase, count: null },
      ],
    },
    {
      label: "Comms",
      items: [
        { id: "messages" as Tab, label: "Messages", icon: Mail, count: messages.length },
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
          label: isSuperAdmin ? "Approvals" : "My Requests",
          icon: CheckSquare,
          count: pendingApprovals > 0 ? pendingApprovals : null,
          urgent: pendingApprovals > 0,
        },
        { id: "activity" as Tab, label: "Activity", icon: Activity, count: null },
      ],
    },
  ];

  const currentItem = navGroups.flatMap((g) => g.items).find((i) => i.id === tab);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1120]">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col h-full overflow-y-auto">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo-wordmark.png"
              alt="DeepTalent"
              width={120}
              height={28}
              className="brightness-0 invert"
            />
          </Link>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mb-4 px-3 py-1.5 rounded-lg bg-[#3B5BDB]/15 border border-[#3B5BDB]/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7b9ef8]">
            {isSuperAdmin ? "Super Admin" : "Admin Panel"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = tab === item.id;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          active
                            ? "bg-[#3B5BDB] text-white shadow-lg shadow-[#3B5BDB]/25"
                            : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
                        }`}
                      >
                        <Icon className={`size-4 shrink-0 ${active ? "text-white" : "text-white/40"}`} />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.count != null && item.count > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums min-w-[18px] text-center ${
                              active
                                ? "bg-white/20 text-white"
                                : (item as any).urgent
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "bg-white/10 text-white/50"
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#3B5BDB] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(fullName || email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{fullName || "Admin"}</p>
              <p className="text-[10px] text-white/35 truncate">{email}</p>
            </div>
            <Link
              href="/auth/logout"
              className="text-white/30 hover:text-white/70 transition-colors"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6fb] rounded-l-2xl overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">Admin</span>
          <ChevronRight className="size-3 text-gray-300" />
          <span className="text-xs font-semibold text-gray-700">{currentItem?.label}</span>
          <div className="ml-auto flex items-center gap-2">
            {currentItem?.count != null && currentItem.count > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                {currentItem.count} records
              </span>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
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
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <MessagesTable rows={messages} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    read: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    responded: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    archived: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function MessagesTable({ rows }: { rows: Message[] }) {
  if (rows.length === 0)
    return <div className="p-12 text-center text-gray-400 text-sm">No messages yet.</div>;
  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {["From", "Subject", "Message", "Status", "Date"].map((h) => (
            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50/60 transition-colors align-top">
            <td className="px-6 py-4">
              <p className="text-sm font-semibold text-gray-900">{r.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{r.email}</p>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{r.subject || "—"}</td>
            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
              <p className="line-clamp-2">{r.message}</p>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={r.status} />
            </td>
            <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
              {new Date(r.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
