"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Activity, RefreshCw, Search } from "lucide-react";

type AuditEntry = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  summary: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ACTION_META: Record<string, { label: string; tone: string }> = {
  "user.delete": { label: "Deleted user", tone: "bg-rose-50 text-rose-700" },
  "user.suspend": { label: "Suspended user", tone: "bg-orange-50 text-orange-700" },
  "user.restore": { label: "Restored user", tone: "bg-emerald-50 text-emerald-700" },
  "deletion.request": { label: "Requested deletion", tone: "bg-amber-50 text-amber-700" },
  "deletion.approved": { label: "Approved deletion", tone: "bg-rose-50 text-rose-700" },
  "deletion.rejected": { label: "Rejected deletion", tone: "bg-gray-100 text-gray-700" },
  "deletion.cancelled": { label: "Cancelled deletion", tone: "bg-gray-100 text-gray-700" },
  "talent_application.approve": { label: "Approved talent", tone: "bg-emerald-50 text-emerald-700" },
  "talent_application.reject": { label: "Rejected talent", tone: "bg-rose-50 text-rose-700" },
  "talent_application.schedule": { label: "Scheduled talent meeting", tone: "bg-blue-50 text-blue-700" },
  "talent_application.custom_email": { label: "Custom email (talent)", tone: "bg-blue-50 text-blue-700" },
  "company_inquiry.approve": { label: "Approved inquiry", tone: "bg-emerald-50 text-emerald-700" },
  "company_inquiry.reject": { label: "Rejected inquiry", tone: "bg-rose-50 text-rose-700" },
  "company_inquiry.schedule": { label: "Scheduled inquiry meeting", tone: "bg-blue-50 text-blue-700" },
  "company_inquiry.custom_email": { label: "Custom email (inquiry)", tone: "bg-blue-50 text-blue-700" },
};

export function ActivityTab() {
  const { data, mutate, isLoading } = useSWR<{ entries: AuditEntry[] }>(
    "/api/admin/audit?limit=200",
    fetcher
  );
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");

  const entries = data?.entries ?? [];
  const actors = useMemo(() => {
    const set = new Map<string, string>();
    for (const e of entries) {
      if (e.actor_id) set.set(e.actor_id, e.actor_email || e.actor_id);
    }
    return Array.from(set.entries());
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (actor !== "all" && e.actor_id !== actor) return false;
      if (!q) return true;
      return (
        (e.summary || "").toLowerCase().includes(q) ||
        (e.actor_email || "").toLowerCase().includes(q) ||
        (e.action || "").toLowerCase().includes(q) ||
        (e.resource_id || "").toLowerCase().includes(q)
      );
    });
  }, [entries, query, actor]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
          <Activity className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Admin activity log</p>
          <p className="text-sm text-gray-600">
            Every approve, reject, schedule, custom email, suspension, and deletion is recorded here.
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center gap-1.5"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by summary, action, actor, or id"
            className="w-full pl-9 pr-3 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
          />
        </div>
        <select
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 text-sm px-3 bg-white"
        >
          <option value="all">All admins</option>
          {actors.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading activity…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No activity yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((e) => {
              const meta = ACTION_META[e.action] || { label: e.action, tone: "bg-gray-100 text-gray-700" };
              return (
                <li key={e.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {e.summary || `${e.action}${e.resource_id ? ` (${e.resource_id})` : ""}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium text-gray-700">{e.actor_email || "—"}</span>
                      {" · "}
                      {new Date(e.created_at).toLocaleString()}
                      {e.resource_type ? ` · ${e.resource_type}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
