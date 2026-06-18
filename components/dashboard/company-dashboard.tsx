"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  PauseCircle,
  Phone,
  Plus,
  Search,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";

const BRAND = "#3B5BDB";

type Tab = "overview" | "inquiries" | "employees";

const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "inquiries", label: "Inquiries", icon: FileText },
  { id: "employees", label: "Placed Employees", icon: Users },
];

export function CompanyDashboard({
  inquiries,
  placements,
}: {
  inquiries: any[];
  placements: any[];
}) {
  const [tab, setTab] = useState<Tab>("overview");

  const counts: Partial<Record<Tab, number>> = {
    inquiries: inquiries.length,
    employees: placements.length,
  };

  return (
    <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full">
      {/* Sidebar */}
      <aside className="lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
        <nav className="flex lg:flex-col gap-1 p-3 lg:p-4 overflow-x-auto lg:sticky lg:top-0">
          <p className="hidden lg:flex items-center gap-2 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            <Building2 className="size-3.5" /> Company Portal
          </p>
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 h-11 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-[#3B5BDB] text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
                {counts[item.id] != null && (
                  <span
                    className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                      active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {counts[item.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 md:px-8 py-8">
        {tab === "overview" && (
          <CompanyOverview
            inquiries={inquiries}
            placements={placements}
            onNavigate={setTab}
          />
        )}
        {tab === "inquiries" && <InquiriesPanel inquiries={inquiries} />}
        {tab === "employees" && <PlacedEmployeesPanel placements={placements} />}
      </div>
    </div>
  );
}

/* ─── Overview ─────────────────────────────────────────────────────────────── */

function CompanyOverview({
  inquiries,
  placements,
  onNavigate,
}: {
  inquiries: any[];
  placements: any[];
  onNavigate: (tab: Tab) => void;
}) {
  const active = placements.filter((p) => p.status === "active");
  const totalMonthly = active.reduce((s, p) => s + (Number(p.monthly_rate_usd) || 0), 0);

  const statusCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of inquiries) m[i.status] = (m[i.status] || 0) + 1;
    return m;
  }, [inquiries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">Company Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your hiring pipeline and placed talent.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={FileText} label="Total inquiries" value={inquiries.length} />
        <KpiCard
          icon={CheckCircle2}
          label="Approved"
          value={(statusCounts["approved"] || 0) + (statusCounts["qualified"] || 0)}
          color="emerald"
        />
        <KpiCard icon={Users} label="Placed employees" value={placements.length} color="blue" />
        <KpiCard
          icon={DollarSign}
          label="Monthly spend"
          value={totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : "$0"}
          color="violet"
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/companies/hire"
          className="rounded-2xl bg-[#3B5BDB] text-white p-6 hover:bg-[#2f49b2] transition-colors flex items-start gap-4"
        >
          <div className="size-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Plus className="size-5" />
          </div>
          <div>
            <p className="font-bold text-lg">Submit new inquiry</p>
            <p className="text-white/75 text-sm mt-1 leading-relaxed">
              Tell us what role you need and we&apos;ll match vetted candidates within 48 hours.
            </p>
          </div>
          <ArrowUpRight className="size-4 ml-auto shrink-0 mt-1" />
        </Link>
        <Link
          href="/contact"
          className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="size-11 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
            <Mail className="size-5" />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">Contact support</p>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              Reach our team for account or hiring questions, contract details, and more.
            </p>
          </div>
          <ArrowUpRight className="size-4 ml-auto shrink-0 mt-1 text-gray-400" />
        </Link>
      </div>

      {/* Recent inquiries preview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Inquiries</h3>
          <button
            onClick={() => onNavigate("inquiries")}
            className="text-xs font-medium text-[#3B5BDB] hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="size-3" />
          </button>
        </div>
        {inquiries.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No inquiries submitted yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {inquiries.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-3">
                <div className="size-9 rounded-lg bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {i.role_title || i.role_category || "Role inquiry"}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(i.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={i.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active employees preview */}
      {active.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Placed Employees</h3>
            <button
              onClick={() => onNavigate("employees")}
              className="text-xs font-medium text-[#3B5BDB] hover:underline flex items-center gap-1"
            >
              Manage <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {active.slice(0, 4).map((p) => (
              <EmployeeCard key={p.id} placement={p} compact />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─── Inquiries panel ───────────────────────────────────────────────────────── */

function InquiriesPanel({ inquiries }: { inquiries: any[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = inquiries;
    if (filter !== "all") rows = rows.filter((r) => r.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.role_title || "").toLowerCase().includes(q) ||
          (r.role_category || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [inquiries, query, filter]);

  const statuses = ["all", "new", "reviewing", "approved", "contacted", "closed", "rejected"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring Inquiries</h1>
        <p className="text-gray-500 mt-1 text-sm">Track every role request you&apos;ve submitted.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role..."
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 h-10 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-[#3B5BDB] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <Link
        href="/companies/hire"
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
      >
        <Plus className="size-4" /> New inquiry
      </Link>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Briefcase className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No inquiries found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Budget</th>
                <th className="px-6 py-3">Urgency</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{i.role_title || i.role_category || "—"}</p>
                    {i.team_size && <p className="text-xs text-gray-400 mt-0.5">Team size: {i.team_size}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{i.budget_range || "—"}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{i.urgency || "—"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(i.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Placed Employees panel ────────────────────────────────────────────────── */

function PlacedEmployeesPanel({ placements }: { placements: any[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = placements;
    if (filter !== "all") rows = rows.filter((r) => r.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.talent_name?.toLowerCase().includes(q) ||
          r.talent_email?.toLowerCase().includes(q) ||
          (r.talent_role || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [placements, query, filter]);

  const totalMonthly = placements
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + (Number(p.monthly_rate_usd) || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placed Employees</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Talent placed at your company through DeepTalent.
          </p>
        </div>
        {totalMonthly > 0 && (
          <div className="shrink-0 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xs text-gray-500">Monthly spend</p>
            <p className="text-xl font-bold text-emerald-700">${totalMonthly.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, role..."
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
          />
        </div>
        {["all", "active", "ended", "on_hold"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 h-10 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              filter === s
                ? "bg-[#3B5BDB] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Users className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No placed employees yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            DeepTalent will place vetted talent here once your inquiry is approved.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <EmployeeCard key={p.id} placement={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Shared sub-components ─────────────────────────────────────────────────── */

function EmployeeCard({ placement: p, compact = false }: { placement: any; compact?: boolean }) {
  const statusIcon =
    p.status === "active" ? (
      <CheckCircle2 className="size-3.5" />
    ) : p.status === "on_hold" ? (
      <PauseCircle className="size-3.5" />
    ) : (
      <XCircle className="size-3.5" />
    );

  const statusColor =
    p.status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : p.status === "on_hold"
        ? "bg-amber-50 text-amber-700"
        : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0 font-bold text-sm">
            {(p.talent_name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{p.talent_name}</p>
            <p className="text-xs text-gray-500 truncate">{p.talent_email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}>
          {statusIcon} {p.status?.replace("_", " ")}
        </span>
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {p.talent_role && (
              <span className="flex items-center gap-1">
                <Briefcase className="size-3.5 text-gray-400" />
                {p.talent_role}
              </span>
            )}
            {p.talent_seniority && (
              <span className="flex items-center gap-1">
                <User className="size-3.5 text-gray-400" />
                {p.talent_seniority}
              </span>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 grid grid-cols-2 gap-2">
            {p.monthly_rate_usd ? (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Monthly rate</p>
                <p className="text-sm font-bold text-gray-900">
                  {p.currency || "USD"} {Number(p.monthly_rate_usd).toLocaleString()}
                </p>
              </div>
            ) : null}
            {p.start_date && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Started</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(p.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>

          {p.talent_email && (
            <div className="flex gap-2 pt-1">
              <a
                href={`mailto:${p.talent_email}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Mail className="size-3.5" /> Email
              </a>
              {p.company_contact && (
                <a
                  href={`tel:${p.company_contact}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Phone className="size-3.5" /> Call
                </a>
              )}
            </div>
          )}
          {p.notes && (
            <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-2">{p.notes}</p>
          )}
        </>
      )}

      {compact && p.talent_role && (
        <p className="text-xs text-gray-500">
          {p.talent_role}{p.talent_seniority ? ` · ${p.talent_seniority}` : ""}
        </p>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: any;
  label: string;
  value: number | string;
  color?: "blue" | "emerald" | "violet" | "amber";
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#3B5BDB]/10 text-[#3B5BDB]",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
      <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-gray-100 rounded-2xl p-5">{children}</div>;
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
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "—"}
    </span>
  );
}
