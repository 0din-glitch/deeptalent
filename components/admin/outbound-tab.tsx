"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  ArrowUpRight,
  Building2,
  Globe2,
  Handshake,
  Search,
  TrendingDown,
} from "lucide-react";

type OutboundRow = {
  id: string;
  created_at: string;
  applicant_name: string | null;
  applicant_email: string | null;
  external_title: string;
  external_company: string | null;
  external_source: string | null;
  external_url: string | null;
  external_location: string | null;
  external_category: string | null;
  matched_role_label: string | null;
  market_salary_usd: number | null;
  dt_rate_usd: number | null;
  in_network_count: number | null;
  via_deeptalent: boolean | null;
};

type Summary = {
  total: number;
  uniqueApplicants: number;
  matched: number;
  viaDeepTalent: number;
  totalMarketMonthlyUsd: number;
  totalDtMonthlyUsd: number;
  totalMonthlySavingsUsd: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const usd = (n: number | null | undefined) =>
  typeof n === "number" ? `$${n.toLocaleString("en-US")}` : "—";

export function OutboundTab() {
  const { data, isLoading } = useSWR<{ rows: OutboundRow[]; summary: Summary }>(
    "/api/admin/outbound-applications",
    fetcher,
    { refreshInterval: 60_000 }
  );
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const all = data?.rows ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) =>
      [
        r.applicant_name,
        r.applicant_email,
        r.external_title,
        r.external_company,
        r.matched_role_label,
      ]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [data, query]);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Globe2}
          label="Outbound applications"
          value={summary ? summary.total.toString() : "—"}
          hint={summary ? `${summary.matched} matched to a role` : ""}
        />
        <SummaryCard
          icon={Handshake}
          label="Submitted via DeepTalent"
          value={summary ? summary.viaDeepTalent.toString() : "—"}
          hint={
            summary
              ? `${summary.uniqueApplicants} unique applicants`
              : ""
          }
        />
        <SummaryCard
          icon={Building2}
          label="Market rate (monthly)"
          value={summary ? usd(summary.totalMarketMonthlyUsd) : "—"}
          hint="Sum of stated / benchmark salaries"
        />
        <SummaryCard
          icon={TrendingDown}
          label="In-network savings"
          value={summary ? usd(summary.totalMonthlySavingsUsd) : "—"}
          hint="30% below market · monthly"
          accent
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applicant, company, role…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading outbound applications…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No outbound applications yet. They appear here when someone applies to a job outside the
            DeepTalent network.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Applicant",
                    "External role",
                    "Submitted via",
                    "In-network match",
                    "Market rate",
                    "DeepTalent (-30%)",
                    "Available",
                    "Date",
                  ].map((h) => (
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
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors align-top">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {r.applicant_name || "Anonymous visitor"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.applicant_email || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-1.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-snug">
                            {r.external_url ? (
                              <a
                                href={r.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:text-[#3B5BDB]"
                              >
                                {r.external_title} <ArrowUpRight className="size-3.5 shrink-0" />
                              </a>
                            ) : (
                              r.external_title
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {r.external_company || "—"}
                            {r.external_source ? ` · ${r.external_source}` : ""}
                            {r.external_location ? ` · ${r.external_location}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {r.via_deeptalent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          <Handshake className="size-3" />
                          DeepTalent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          <ArrowUpRight className="size-3" />
                          Direct
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {r.matched_role_label ? (
                        <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                          {r.matched_role_label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No match</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 tabular-nums whitespace-nowrap">
                      {r.market_salary_usd ? `${usd(r.market_salary_usd)}/mo` : "—"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {r.dt_rate_usd ? (
                        <span className="text-sm font-bold text-emerald-600 tabular-nums">
                          {usd(r.dt_rate_usd)}/mo
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 tabular-nums">
                      {r.in_network_count ?? 0}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        accent ? "bg-emerald-50 border-emerald-100" : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`grid size-8 place-items-center rounded-lg ${
            accent ? "bg-emerald-100 text-emerald-600" : "bg-[#3B5BDB]/10 text-[#3B5BDB]"
          }`}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-emerald-700" : "text-gray-900"}`}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}
