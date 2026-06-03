"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { useAdminMe } from "./use-admin-me";

type DeletionRequest = {
  id: string;
  requested_by: string;
  requested_by_email: string | null;
  target_type: string;
  target_id: string;
  target_label: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  created_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_META: Record<DeletionRequest["status"], { label: string; cls: string; Icon: any }> = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", Icon: Clock },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700", Icon: XCircle },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600", Icon: XCircle },
};

const TARGET_LABELS: Record<string, string> = {
  user: "User account",
  talent_application: "Talent application",
  company_inquiry: "Company inquiry",
  contact_message: "Contact message",
};

export function ApprovalsTab() {
  const { me } = useAdminMe();
  const [statusFilter, setStatusFilter] = useState<"pending" | "all">("pending");
  const url = `/api/admin/deletion-requests${statusFilter === "pending" ? "?status=pending" : ""}`;
  const { data, mutate, isLoading } = useSWR<{ requests: DeletionRequest[] }>(url, fetcher);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<{ id: string; decision: "approved" | "rejected" } | null>(null);
  const [note, setNote] = useState("");

  const isSuper = !!me?.is_super_admin;

  async function decide(id: string, decision: "approved" | "rejected" | "cancelled", noteText?: string) {
    setDecidingId(id);
    try {
      const res = await fetch(`/api/admin/deletion-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note: noteText || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error || "Could not record decision.");
      } else {
        await mutate();
        setNoteFor(null);
        setNote("");
      }
    } finally {
      setDecidingId(null);
    }
  }

  const requests = data?.requests ?? [];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-3">
        <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
          <Shield className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {isSuper ? "Pending deletion approvals" : "Your deletion requests"}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            {isSuper
              ? "Review requests from admin users. Approving will permanently delete the target."
              : "Track the status of deletion requests you have submitted. Only super admins can approve them."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === "pending"
                ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === "all"
                ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => mutate()}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading requests…</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Trash2 className="size-8 mx-auto mb-2 text-gray-300" />
            No {statusFilter === "pending" ? "pending " : ""}deletion requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">Requested by</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => {
                  const meta = STATUS_META[r.status];
                  const Icon = meta.Icon;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 align-top">
                      <td className="px-6 py-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {TARGET_LABELS[r.target_type] || r.target_type}
                        </p>
                        <p className="font-medium text-gray-900 mt-0.5 break-words">
                          {r.target_label || r.target_id}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {r.requested_by_email || r.requested_by}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                        <p className="line-clamp-3 whitespace-pre-wrap">{r.reason || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.cls}`}>
                          <Icon className="size-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1.5">
                          {r.status === "pending" && isSuper && (
                            <>
                              <button
                                onClick={() => setNoteFor({ id: r.id, decision: "approved" })}
                                disabled={decidingId === r.id}
                                className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 inline-flex items-center gap-1 disabled:opacity-60"
                              >
                                Approve & delete
                              </button>
                              <button
                                onClick={() => setNoteFor({ id: r.id, decision: "rejected" })}
                                disabled={decidingId === r.id}
                                className="h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {r.status === "pending" && !isSuper && me && r.requested_by === me.id && (
                            <button
                              onClick={() => decide(r.id, "cancelled")}
                              disabled={decidingId === r.id}
                              className="h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              Cancel request
                            </button>
                          )}
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

      {/* Decision note dialog */}
      {noteFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            onClick={() => (decidingId ? null : setNoteFor(null))}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-900">
              {noteFor.decision === "approved" ? "Approve and delete" : "Reject deletion request"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {noteFor.decision === "approved"
                ? "This permanently deletes the target. The action will be recorded in the activity log."
                : "Add a short note so the requester knows why the request was rejected."}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              rows={4}
              className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setNoteFor(null)}
                disabled={!!decidingId}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => decide(noteFor.id, noteFor.decision, note)}
                disabled={!!decidingId}
                className={`h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 ${
                  noteFor.decision === "approved"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-[#3B5BDB] text-white hover:bg-[#2d42a6]"
                }`}
              >
                {decidingId ? <RefreshCw className="size-3.5 animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
