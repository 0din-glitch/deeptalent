"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Search,
  Users as UsersIcon,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Calendar,
  Shield,
  Briefcase,
  Building2,
  ExternalLink,
  KeyRound,
  MailWarning,
  BadgeCheck,
  Send,
  Trash2,
  Ban,
  RotateCcw,
} from "lucide-react";
import { useAdminMe } from "./use-admin-me";

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
  application_count: number;
  inquiry_count: number;
  email_confirmed: boolean;
  email_confirmed_at: string | null;
  is_super_admin: boolean;
  suspended_at: string | null;
  suspension_reason: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-purple-50 text-purple-700" },
  company: { label: "Company", cls: "bg-blue-50 text-blue-700" },
  talent: { label: "Talent", cls: "bg-emerald-50 text-emerald-700" },
};

export function UsersTab() {
  const { data, isLoading, mutate, error } = useSWR<{ users: User[] }>("/api/admin/users", fetcher);
  const { me } = useAdminMe();
  const isSuper = !!me?.is_super_admin;
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "company" | "talent">("all");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetDoneId, setResetDoneId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendDoneId, setResendDoneId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [suspending, setSuspending] = useState<{ user: User; restore: boolean } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendBusy, setSuspendBusy] = useState(false);

  async function handleReset(e: React.MouseEvent, userId: string) {
    e.stopPropagation();
    if (resettingId) return;
    setResettingId(userId);
    setResetDoneId(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setResetDoneId(userId);
        setTimeout(() => setResetDoneId(null), 3000);
      }
    } finally {
      setResettingId(null);
    }
  }

  async function handleResend(e: React.MouseEvent, userId: string) {
    e.stopPropagation();
    if (resendingId) return;
    setResendingId(userId);
    setResendDoneId(null);
    try {
      const res = await fetch("/api/admin/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendDoneId(userId);
        setTimeout(() => setResendDoneId(null), 3000);
      } else {
        alert(`Failed to send: ${json?.error || "Unknown error"}`);
      }
    } finally {
      setResendingId(null);
    }
  }

  async function handleDelete(user: User, reason: string) {
    if (deletingId) return;
    setDeletingId(user.id);
    try {
      if (isSuper) {
        // Super admin deletes immediately
        const res = await fetch("/api/admin/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, reason }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setConfirmDelete(null);
          setDeleteReason("");
          await mutate();
        } else {
          alert(`Failed to delete: ${json?.error || "Unknown error"}`);
        }
      } else {
        // Regular admin: file a deletion request for super-admin approval
        const res = await fetch("/api/admin/deletion-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_type: "user",
            target_id: user.id,
            target_label: user.full_name || user.email || user.id,
            reason,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setConfirmDelete(null);
          setDeleteReason("");
          alert("Deletion request submitted. A super admin will review it.");
        } else {
          alert(`Failed to submit: ${json?.error || "Unknown error"}`);
        }
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSuspend(user: User, reason: string, restore: boolean) {
    setSuspendBusy(true);
    try {
      const res = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, reason, restore }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuspending(null);
        setSuspendReason("");
        await mutate();
      } else {
        alert(json?.error || "Action failed");
      }
    } finally {
      setSuspendBusy(false);
    }
  }

  const users = data?.users ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (verifiedFilter === "verified" && !u.email_confirmed) return false;
      if (verifiedFilter === "unverified" && u.email_confirmed) return false;
      if (!q) return true;
      return (
        (u.email || "").toLowerCase().includes(q) ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter, verifiedFilter]);

  const stats = useMemo(() => {
    const s: Record<string, number> = { admin: 0, company: 0, talent: 0, unverified: 0 };
    for (const u of users) {
      if (u.role) s[u.role] = (s[u.role] || 0) + 1;
      if (!u.email_confirmed) s.unverified += 1;
    }
    return s;
  }, [users]);

  function downloadCsv() {
    const rows = [["name", "email", "role", "applications", "inquiries", "joined"]];
    for (const u of filtered) {
      rows.push([
        u.full_name || "",
        u.email || "",
        u.role || "",
        String(u.application_count),
        String(u.inquiry_count),
        u.created_at || "",
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `deeptalent-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">
      {/* Stats + migration bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBlock label="Total users" value={users.length} />
        <StatBlock label="Talent" value={stats.talent || 0} />
        <StatBlock label="Companies" value={stats.company || 0} />
        <StatBlock label="Admins" value={stats.admin || 0} />
        <StatBlock label="Unverified" value={stats.unverified || 0} highlight={stats.unverified > 0 ? "amber" : undefined} />
      </div>

            <MigrationCard onComplete={() => mutate()} />
      <BackfillCard onComplete={() => mutate()} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or role"
            className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "talent", "company", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                roleFilter === r
                  ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {r === "all" ? "All" : r === "company" ? "Companies" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <span className="w-px h-5 bg-gray-200" aria-hidden />
          {(
            [
              { v: "all", label: "Any" },
              { v: "verified", label: "Verified" },
              { v: "unverified", label: "Unverified" },
            ] as const
          ).map((f) => (
            <button
              key={f.v}
              onClick={() => setVerifiedFilter(f.v)}
              className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                verifiedFilter === f.v
                  ? f.v === "unverified"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.v === "unverified" && <MailWarning className="size-3.5" />}
              {f.v === "verified" && <BadgeCheck className="size-3.5" />}
              {f.label}
            </button>
          ))}
          <button
            onClick={() => mutate()}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center gap-1.5"
            title="Refresh"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
          <button
            onClick={downloadCsv}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="size-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600 text-sm">Failed to load users.</div>
        ) : isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UsersIcon className="size-8 mx-auto mb-2 text-gray-300" />
            No users match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => {
                  const role = u.role || "talent";
                  const meta = ROLE_LABELS[role] || ROLE_LABELS.talent;
                  const initials = (u.full_name || u.email || "?")
                    .split(/[\s@]+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("");
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setOpenUserId(u.id)}
                      className="hover:bg-gray-50 align-middle cursor-pointer"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center text-xs font-semibold">
                            {initials || "?"}
                          </div>
                          <span className="font-medium text-gray-900">{u.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{u.email || "—"}</span>
                          {u.email && (
                            u.email_confirmed ? (
                              <span
                                title="Email verified"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 shrink-0"
                              >
                                <BadgeCheck className="size-3" />
                                Verified
                              </span>
                            ) : (
                              <span
                                title="Email not yet verified"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 shrink-0"
                              >
                                <MailWarning className="size-3" />
                                Unverified
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${meta.cls}`}>{meta.label}</span>
                          {u.is_super_admin && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#3B5BDB]/10 text-[#3B5BDB]">
                              <Shield className="size-3" /> Super
                            </span>
                          )}
                          {u.suspended_at && (
                            <span
                              title={u.suspension_reason || "Account suspended"}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700"
                            >
                              <Ban className="size-3" /> Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-sm">
                        {u.application_count > 0 && <span className="mr-3">{u.application_count} application{u.application_count === 1 ? "" : "s"}</span>}
                        {u.inquiry_count > 0 && <span>{u.inquiry_count} inquir{u.inquiry_count === 1 ? "y" : "ies"}</span>}
                        {u.application_count === 0 && u.inquiry_count === 0 && <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-sm">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {!u.email_confirmed && u.email && (
                            <button
                              title="Resend confirmation email"
                              onClick={(e) => handleResend(e, u.id)}
                              disabled={resendingId === u.id}
                              className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                                resendDoneId === u.id
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "hover:bg-blue-50 text-gray-400 hover:text-[#3B5BDB]"
                              } disabled:opacity-50`}
                            >
                              {resendingId === u.id ? (
                                <RefreshCw className="size-3.5 animate-spin" />
                              ) : resendDoneId === u.id ? (
                                <CheckCircle2 className="size-3.5" />
                              ) : (
                                <Send className="size-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            title="Reset password to deeptalent1"
                            onClick={(e) => handleReset(e, u.id)}
                            disabled={resettingId === u.id}
                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                              resetDoneId === u.id
                                ? "bg-emerald-50 text-emerald-600"
                                : "hover:bg-amber-50 text-gray-400 hover:text-amber-600"
                            } disabled:opacity-50`}
                          >
                            {resettingId === u.id ? (
                              <RefreshCw className="size-3.5 animate-spin" />
                            ) : resetDoneId === u.id ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <KeyRound className="size-3.5" />
                            )}
                          </button>
                          <button
                            title={isSuper ? "Suspend account" : "Suspend (super admins only)"}
                            disabled={!isSuper || u.is_super_admin}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSuper || u.is_super_admin) return;
                              setSuspending({ user: u, restore: !!u.suspended_at });
                              setSuspendReason("");
                            }}
                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                              u.suspended_at
                                ? "hover:bg-emerald-50 text-emerald-600"
                                : "hover:bg-orange-50 text-gray-400 hover:text-orange-600"
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            {u.suspended_at ? <RotateCcw className="size-3.5" /> : <Ban className="size-3.5" />}
                          </button>
                          <button
                            title={isSuper ? "Delete user" : "Request deletion (needs super admin approval)"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(u);
                              setDeleteReason("");
                            }}
                            disabled={u.is_super_admin}
                            className="size-8 rounded-lg flex items-center justify-center transition-colors hover:bg-rose-50 text-gray-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserDetailDrawer userId={openUserId} onClose={() => setOpenUserId(null)} />

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            onClick={() => deletingId ? null : setConfirmDelete(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {isSuper ? "Delete this user?" : "Request deletion of this user?"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isSuper ? (
                    <>
                      This permanently deletes{" "}
                      <span className="font-medium text-gray-900">
                        {confirmDelete.full_name || confirmDelete.email}
                      </span>
                      &apos;s account, profile, and login. Their submitted applications and inquiries
                      will be detached but kept for records. This cannot be undone.
                    </>
                  ) : (
                    <>
                      Admin users can&apos;t delete accounts directly. This will create a deletion
                      request for{" "}
                      <span className="font-medium text-gray-900">
                        {confirmDelete.full_name || confirmDelete.email}
                      </span>
                      {" "}that a super admin must approve.
                    </>
                  )}
                </p>
              </div>
            </div>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder={isSuper ? "Optional reason (recorded in activity log)" : "Reason for deletion request"}
              rows={3}
              className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={!!deletingId}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete, deleteReason)}
                disabled={!!deletingId || (!isSuper && !deleteReason.trim())}
                className={`h-9 px-4 rounded-lg text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-1.5 ${
                  isSuper ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-[#3B5BDB] text-white hover:bg-[#2d42a6]"
                }`}
              >
                {deletingId ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                {deletingId ? "Working…" : isSuper ? "Delete user" : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / restore dialog */}
      {suspending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            onClick={() => (suspendBusy ? null : setSuspending(null))}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div
                className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                  suspending.restore ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                }`}
              >
                {suspending.restore ? <RotateCcw className="size-5" /> : <Ban className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {suspending.restore ? "Restore access?" : "Suspend this user?"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {suspending.restore ? (
                    <>
                      This will reinstate sign-in for{" "}
                      <span className="font-medium text-gray-900">
                        {suspending.user.full_name || suspending.user.email}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-gray-900">
                        {suspending.user.full_name || suspending.user.email}
                      </span>{" "}
                      will be locked out immediately. Their data is preserved and you can restore
                      access later.
                    </>
                  )}
                </p>
              </div>
            </div>
            {!suspending.restore && (
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={3}
                className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
              />
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setSuspending(null)}
                disabled={suspendBusy}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSuspend(suspending.user, suspendReason, suspending.restore)}
                disabled={suspendBusy}
                className={`h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 ${
                  suspending.restore
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {suspendBusy ? <RefreshCw className="size-3.5 animate-spin" /> : null}
                {suspending.restore ? "Restore access" : "Suspend user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, highlight }: { label: string; value: number; highlight?: "amber" }) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 ${
        highlight === "amber" ? "border-amber-200 bg-amber-50/50" : "border-gray-100"
      }`}
    >
      <p className={`text-xs ${highlight === "amber" ? "text-amber-700" : "text-gray-500"}`}>{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${highlight === "amber" ? "text-amber-900" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

type DetailData = {
  profile: { id: string; email: string | null; full_name: string | null; role: string | null; created_at: string | null } | null;
  auth: {
    email: string | null;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
    created_at: string | null;
    provider: string | null;
    legacy_user_id: string | null;
    source: string | null;
  };
  applications: Array<Record<string, unknown> & { id: string; created_at: string | null }>;
  inquiries: Array<Record<string, unknown> & { id: string; created_at: string | null }>;
};

function UserDetailDrawer({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useSWR<DetailData>(
    userId ? `/api/admin/users/${userId}` : null,
    fetcher,
  );
  const open = !!userId;
  const fullName = data?.profile?.full_name ?? data?.auth.email ?? "User";
  const email = data?.profile?.email ?? data?.auth.email ?? "";
  const role = data?.profile?.role ?? "talent";
  const meta = ROLE_LABELS[role] || ROLE_LABELS.talent;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center text-sm font-semibold shrink-0">
              {(fullName || "?")
                .split(/[\s@]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase())
                .join("")}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{fullName}</h2>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
            <span className={`ml-2 inline-flex px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${meta.cls}`}>
              {meta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {!userId ? null : isLoading ? (
            <p className="text-sm text-gray-500">Loading user details…</p>
          ) : error ? (
            <p className="text-sm text-red-600">Failed to load user details.</p>
          ) : !data ? null : (
            <>
              <DetailSection title="Account">
                <DetailRow icon={Mail} label="Email" value={email || "—"} />
                <DetailRow
                  icon={Calendar}
                  label="Joined"
                  value={data.auth.created_at ? new Date(data.auth.created_at).toLocaleString() : "—"}
                />
                <DetailRow
                  icon={Calendar}
                  label="Last sign-in"
                  value={data.auth.last_sign_in_at ? new Date(data.auth.last_sign_in_at).toLocaleString() : "Never"}
                />
                <DetailRow icon={Shield} label="Provider" value={data.auth.provider || "email"} />
                {data.auth.source && <DetailRow icon={Shield} label="Source" value={data.auth.source} />}
                {data.auth.legacy_user_id && (
                  <DetailRow icon={Shield} label="Legacy user ID" value={data.auth.legacy_user_id} mono />
                )}
              </DetailSection>

              <DetailSection
                title={`Talent applications (${data.applications.length})`}
                empty={data.applications.length === 0 ? "No applications submitted." : undefined}
              >
                {data.applications.map((a: any) => (
                  <div key={a.id} className="rounded-xl border border-gray-100 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate inline-flex items-center gap-2">
                          <Briefcase className="size-4 text-gray-400" />
                          {a.role_category || "Talent application"}
                          {a.specialization ? ` • ${a.specialization}` : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <StatusPill status={a.status} />
                    </div>
                    <KvGrid
                      items={[
                        ["Full name", a.full_name],
                        ["Email", a.email],
                        ["Phone", a.phone],
                        ["Country", a.country],
                        ["Years of experience", a.years_experience != null ? String(a.years_experience) : null],
                        ["LinkedIn", a.linkedin_url],
                        ["Portfolio", a.portfolio_url],
                      ]}
                    />
                    {a.bio && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mt-2 mb-1">Bio</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.bio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </DetailSection>

              <DetailSection
                title={`Company inquiries (${data.inquiries.length})`}
                empty={data.inquiries.length === 0 ? "No company inquiries submitted." : undefined}
              >
                {data.inquiries.map((i: any) => (
                  <div key={i.id} className="rounded-xl border border-gray-100 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate inline-flex items-center gap-2">
                          <Building2 className="size-4 text-gray-400" />
                          {i.company_name || "Inquiry"}
                          {i.role_title ? ` • ${i.role_title}` : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted {i.created_at ? new Date(i.created_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <StatusPill status={i.status} />
                    </div>
                    <KvGrid
                      items={[
                        ["Contact", i.contact_name],
                        ["Email", i.email],
                        ["Phone", i.phone],
                        ["Website", i.website],
                        ["Team size", i.team_size],
                        ["Role category", i.role_category],
                        ["Urgency", i.urgency],
                        ["Budget", i.budget_range],
                      ]}
                    />
                    {i.notes && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mt-2 mb-1">Notes</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{i.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </DetailSection>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function DetailSection({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty?: string;
}) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">{title}</h3>
      {empty ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="size-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm text-gray-900 break-words ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function KvGrid({ items }: { items: Array<[string, string | null | undefined]> }) {
  const filtered = items.filter(([, v]) => v != null && v !== "");
  if (filtered.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
      {filtered.map(([k, v]) => {
        const isUrl = typeof v === "string" && /^https?:\/\//i.test(v);
        return (
          <div key={k} className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{k}</p>
            {isUrl ? (
              <a
                href={v as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3B5BDB] hover:underline inline-flex items-center gap-1 break-all"
              >
                <span className="truncate">{v}</span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="text-gray-900 break-words">{v}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: string | null | undefined }) {
  const s = (status || "pending").toLowerCase();
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    new: "bg-blue-50 text-blue-700",
    reviewing: "bg-blue-50 text-blue-700",
    contacted: "bg-blue-50 text-blue-700",
    approved: "bg-emerald-50 text-emerald-700",
    accepted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${map[s] || "bg-gray-100 text-gray-700"}`}>
      {s}
    </span>
  );
}

function BackfillCard({ onComplete }: { onComplete: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/backfill-legacy-data", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Backfill failed");
      setResult(json);
      onComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900 text-sm">Backfill complete</p>
            <p className="text-emerald-800 text-sm mt-1">
              Updated {result.updatedProfiles} profile{result.updatedProfiles === 1 ? "" : "s"}, imported{" "}
              {result.insertedResumes} resume{result.insertedResumes === 1 ? "" : "s"} and{" "}
              {result.insertedCerts} certification{result.insertedCerts === 1 ? "" : "s"}.
              {result.skippedNoUser > 0 && (
                <> Skipped {result.skippedNoUser} user{result.skippedNoUser === 1 ? "" : "s"} not yet in Supabase &mdash; run the import first.</>
              )}
            </p>
            <button
              onClick={() => setResult(null)}
              className="mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-violet-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-violet-900 text-sm">Backfill legacy profile data</p>
          <p className="text-violet-800 text-sm mt-1">
            Pulls every legacy talent profile, client profile, resume, certification and verification document
            from the previous DeepTalent platform and saves it onto each matching user&apos;s Supabase account.
            Resumes and certifications keep their original download links. Safe to re-run.
          </p>
          {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
          <button
            onClick={run}
            disabled={running}
            className="mt-3 h-8 px-3 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {running ? <RefreshCw className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            {running ? "Backfilling..." : "Backfill all legacy data"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MigrationCard({ onComplete }: { onComplete: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/migrate-users", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Migration failed");
      setResult(json);
      onComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
      setConfirming(false);
    }
  }

  function downloadCredentials() {
    if (!result?.credentials) return;
    const rows = [["email", "name", "role", "status", "hasLegacyPassword"]];
    for (const c of result.credentials) {
      rows.push([c.email, c.name || "", c.role, c.status, c.hasLegacyPassword ? "yes" : "no"]);
    }
    const csv = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `deeptalent-migration-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (result) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900 text-sm">Migration complete</p>
            <p className="text-emerald-800 text-sm mt-1">
              {result.summary.created} accounts created, {result.summary.existing} already existed.{" "}
              Linked {result.summary.linkedApps} application{result.summary.linkedApps === 1 ? "" : "s"} and{" "}
              {result.summary.linkedInquiries} inquir{result.summary.linkedInquiries === 1 ? "y" : "ies"} to user IDs.
              {result.summary.errorCount > 0 && (
                <> {result.summary.errorCount} error{result.summary.errorCount === 1 ? "" : "s"} occurred.</>
              )}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={downloadCredentials}
                className="h-8 px-3 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                Download summary CSV
              </button>
              <button
                onClick={() => setResult(null)}
                className="h-8 px-3 rounded-lg text-xs font-medium bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-blue-900 text-sm">Import legacy users (151 from Neon)</p>
          <p className="text-blue-800 text-sm mt-1">
            Creates Supabase Auth accounts for the legacy users, sets up their profile, links any existing
            applications/inquiries by email, and stores their original Better-Auth password hash so they can
            log in with their <strong>existing password</strong>. No password reset is needed.
          </p>
          {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
          <div className="mt-3 flex gap-2">
            {confirming ? (
              <>
                <button
                  onClick={run}
                  disabled={running}
                  className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#3B5BDB] text-white hover:bg-[#2f49b2] disabled:opacity-60"
                >
                  {running ? "Importing…" : "Yes, import all 151"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="h-8 px-3 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#3B5BDB] text-white hover:bg-[#2f49b2]"
              >
                Run migration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
