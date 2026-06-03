"use client";

import { useState } from "react";
import useSWR from "swr";
import { FilesTab } from "@/components/admin/files-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { SubmissionsTab } from "@/components/admin/submissions-tab";
import { ApprovalsTab } from "@/components/admin/approvals-tab";
import { ActivityTab } from "@/components/admin/activity-tab";
import { ContentTab } from "@/components/admin/content-tab";
import { useAdminMe } from "@/components/admin/use-admin-me";

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

type Tab = "users" | "applications" | "inquiries" | "messages" | "files" | "content" | "approvals" | "activity";

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

  // Pending deletion requests count (badge on Approvals tab)
  const { data: pendingData } = useSWR<{ requests: any[] }>(
    "/api/admin/deletion-requests?status=pending",
    fetcher,
    { refreshInterval: 60_000 }
  );
  const pendingApprovals = pendingData?.requests?.length ?? 0;

  // Live counts so badges stay in sync after admin actions
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

  return (
    <div>
      <div className="flex items-center gap-1 mb-5 border-b border-gray-200 overflow-x-auto">
        <TabButton active={tab === "users"} onClick={() => setTab("users")} count={userCount}>
          Users
        </TabButton>
        <TabButton active={tab === "applications"} onClick={() => setTab("applications")} count={appCount}>
          Talent applications
        </TabButton>
        <TabButton active={tab === "inquiries"} onClick={() => setTab("inquiries")} count={inqCount}>
          Company inquiries
        </TabButton>
        <TabButton active={tab === "messages"} onClick={() => setTab("messages")} count={messages.length}>
          Contact messages
        </TabButton>
        <TabButton active={tab === "files"} onClick={() => setTab("files")} count={files.length}>
          Files
        </TabButton>
        <TabButton active={tab === "content"} onClick={() => setTab("content")} count={0} hideCount>
          Content
        </TabButton>
        <TabButton
          active={tab === "approvals"}
          onClick={() => setTab("approvals")}
          count={pendingApprovals}
          tone={pendingApprovals > 0 ? "amber" : undefined}
        >
          {me?.is_super_admin ? "Approvals" : "My requests"}
        </TabButton>
        <TabButton active={tab === "activity"} onClick={() => setTab("activity")} count={0} hideCount>
          Activity
        </TabButton>
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "files" && <FilesTab initialFiles={files} />}
      {tab === "applications" && <SubmissionsTab kind="talent_application" />}
      {tab === "inquiries" && <SubmissionsTab kind="company_inquiry" />}
      {tab === "content" && <ContentTab />}
      {tab === "approvals" && <ApprovalsTab />}
      {tab === "activity" && <ActivityTab />}
      {tab === "messages" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <MessagesTable rows={messages} />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  count,
  tone,
  hideCount,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
  tone?: "amber";
  hideCount?: boolean;
}) {
  const countCls = active
    ? "bg-[#3B5BDB]/10 text-[#3B5BDB]"
    : tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-600";
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
        active
          ? "border-[#3B5BDB] text-[#3B5BDB]"
          : "border-transparent text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
      {!hideCount && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${countCls}`}>{count}</span>
      )}
    </button>
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
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function MessagesTable({ rows }: { rows: Message[] }) {
  if (rows.length === 0) return <div className="p-12 text-center text-gray-500">No messages yet.</div>;
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
            <td className="px-6 py-4 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
