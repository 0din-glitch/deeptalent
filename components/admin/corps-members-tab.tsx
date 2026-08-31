"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  BadgeCheck,
  GraduationCap,
  MapPin,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

type Member = {
  id: string;
  email: string | null;
  full_name: string | null;
  call_up_number: string | null;
  state_of_origin: string | null;
  state_code: string | null;
  track: string | null;
  created_at: string;
  application_count: number;
  email_confirmed: boolean;
  last_sign_in_at: string | null;
};

type Payload = {
  members: Member[];
  summary: { total: number; ready: number; training: number; signed_in: number };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function TrackBadge({ track }: { track: string | null }) {
  if (track === "training") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
        <GraduationCap className="size-3.5" /> Get ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      <Rocket className="size-3.5" /> Workforce ready
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: any;
  tone: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

export function CorpsMembersTab() {
  const { data, isLoading, mutate } = useSWR<Payload>("/api/admin/nysc", fetcher, {
    refreshInterval: 60_000,
  });

  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<"all" | "ready" | "training">("all");

  const members = useMemo(() => {
    let rows = data?.members ?? [];
    if (track !== "all") rows = rows.filter((r) => (r.track || "ready") === track);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.call_up_number?.toLowerCase().includes(q) ||
          r.state_code?.toLowerCase().includes(q) ||
          r.state_of_origin?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, query, track]);

  const summary = data?.summary ?? { total: 0, ready: 0, training: 0, signed_in: 0 };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#3B5BDB]" />
            NYSC Corps Members
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Sign-ups and logins from the dedicated NYSC corps member pages.
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors self-start"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total corps members" value={summary.total} icon={ShieldCheck} tone="bg-[#3B5BDB]/10 text-[#3B5BDB]" />
        <StatCard label="Workforce ready" value={summary.ready} icon={Rocket} tone="bg-emerald-50 text-emerald-600" />
        <StatCard label="In training track" value={summary.training} icon={GraduationCap} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Have logged in" value={summary.signed_in} icon={BadgeCheck} tone="bg-blue-50 text-blue-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, call-up no., state code…"
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 bg-white">
          {(["all", "ready", "training"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`px-3 h-8 rounded-md text-xs font-medium capitalize transition-colors ${
                track === t ? "bg-[#3B5BDB] text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {t === "all" ? "All tracks" : t === "ready" ? "Ready" : "Training"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="size-4 animate-spin" /> Loading corps members…
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <ShieldCheck className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No corps members yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Sign-ups from the NYSC corps member pages will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Corps member", "Call-up number", "State", "Track", "Status", "Apps", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => {
                const lastSignIn = formatDate(m.last_sign_in_at);
                return (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors align-top">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{m.full_name || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.email || "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {m.call_up_number || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-gray-400" />
                        {m.state_of_origin || "—"}
                      </span>
                      {m.state_code && (
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{m.state_code}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <TrackBadge track={m.track} />
                    </td>
                    <td className="px-5 py-4">
                      {m.last_sign_in_at ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <BadgeCheck className="size-3.5" /> Logged in
                        </span>
                      ) : m.email_confirmed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                          <ShieldCheck className="size-3.5" /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <ShieldAlert className="size-3.5" /> Pending
                        </span>
                      )}
                      {lastSignIn && <p className="text-xs text-gray-400 mt-0.5">{lastSignIn}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 tabular-nums">{m.application_count}</td>
                    <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
