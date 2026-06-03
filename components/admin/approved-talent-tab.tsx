"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  CalendarClock,
  CheckCircle2,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

type TalentRow = {
  id: string;
  full_name: string;
  email: string;
  country: string | null;
  role_category: string | null;
  specialization: string | null;
  status: string;
  created_at: string;
  decision_at: string | null;
  decision_note: string | null;
  meeting_at: string | null;
  meeting_link: string | null;
  inferred_role?: string | null;
  welcome_email_sent_at?: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDateTime(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ApprovedTalentTab() {
  const { data, isLoading, mutate } = useSWR<{ rows: TalentRow[] }>(
    "/api/admin/submissions?kind=talent_application",
    fetcher,
    { refreshInterval: 0 }
  );

  const [query, setQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const approved = useMemo(() => {
    const rows = (data?.rows ?? []).filter((r) => r.status === "approved");
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter(
          (r) =>
            r.full_name?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            (r.inferred_role || r.specialization || r.role_category || "")
              .toLowerCase()
              .includes(q)
        )
      : rows;
    // Most recently approved first
    return [...filtered].sort((a, b) => {
      const at = new Date(a.decision_at || a.created_at).getTime();
      const bt = new Date(b.decision_at || b.created_at).getTime();
      return bt - at;
    });
  }, [data, query]);

  async function sendWelcome(row: TalentRow) {
    setError(null);
    setSendingId(row.id);
    try {
      const res = await fetch("/api/admin/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "talent_application",
          id: row.id,
          action: "welcome",
        }),
      });
      const json = await res.json();
      if (!res.ok || json?.email?.success === false) {
        throw new Error(json?.error || json?.email?.error || "Failed to send welcome email");
      }
      setSentIds((prev) => ({ ...prev, [row.id]: new Date().toISOString() }));
      mutate();
    } catch (e: any) {
      setError(e?.message || "Could not send welcome email");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div>
      {/* Header / search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="size-5 text-[#3B5BDB]" />
            Approved talent
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Candidates approved after their meeting. Send the branded welcome email when you&apos;re ready.
          </p>
        </div>
        <div className="relative">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role…"
            className="h-10 w-full sm:w-72 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="size-4 animate-spin" /> Loading approved talent…
        </div>
      ) : approved.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <CheckCircle2 className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No approved talent yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Approve candidates from the Talent applications tab and they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {approved.map((row) => {
            const meeting = formatDateTime(row.meeting_at);
            const justSent = sentIds[row.id];
            const sending = sendingId === row.id;
            const role =
              row.inferred_role || row.specialization || row.role_category || "Talent";
            return (
              <div
                key={row.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{row.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">{row.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Approved
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-gray-400">Role:</span>
                    <span className="font-medium text-gray-700">{role}</span>
                  </span>
                  {row.country && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-gray-400" />
                      {row.country}
                    </span>
                  )}
                </div>

                {/* Meeting time */}
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="size-4 text-[#3B5BDB] shrink-0" />
                    {meeting ? (
                      <span className="text-gray-700">
                        <span className="text-gray-400">Met:</span>{" "}
                        <span className="font-medium">{meeting}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">No meeting on record</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => sendWelcome(row)}
                  disabled={sending}
                  className={`mt-auto h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 ${
                    justSent
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-[#3B5BDB] text-white hover:bg-[#2d42a6]"
                  }`}
                >
                  {sending ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" /> Sending…
                    </>
                  ) : justSent ? (
                    <>
                      <CheckCircle2 className="size-4" /> Welcome email sent
                    </>
                  ) : (
                    <>
                      <Mail className="size-4" /> Send welcome email
                    </>
                  )}
                </button>
                {justSent && (
                  <p className="text-xs text-gray-400 -mt-2 text-center">
                    Sent {formatDateTime(justSent)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
