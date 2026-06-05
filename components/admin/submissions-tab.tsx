"use client";

import { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  formatRange,
  inferSeniority,
  matchSalaryRow,
  rangeForRow,
} from "@/lib/salary/scale";

type Kind = "talent_application" | "company_inquiry";

type SubmissionFile = {
  bucket: string;
  storage_path: string;
  file_name: string;
  size_bytes: number | null;
  content_type: string | null;
  source: "legacy" | "resume" | "certification";
};

type TalentRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  role_category: string | null;
  specialization: string | null;
  years_experience: number | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  bio: string | null;
  status: string;
  created_at: string;
  decision_at: string | null;
  decision_note: string | null;
  meeting_at: string | null;
  meeting_link: string | null;
  // Enrichments from /api/admin/submissions
  inferred_role?: string | null;
  legacy_user_ref?: string | null;
  profile_id?: string | null;
  files?: SubmissionFile[];
};

type CompanyRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  team_size: string | null;
  role_category: string | null;
  role_title: string | null;
  urgency: string | null;
  budget_range: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  decision_at: string | null;
  decision_note: string | null;
  meeting_at: string | null;
  meeting_link: string | null;
  payment_status: string | null;
  paid_at: string | null;
  amount_paid_cents: number | null;
  stripe_subscription_id: string | null;
};

type Row = TalentRow | CompanyRow;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SubmissionsTab({ kind }: { kind: Kind }) {
  const apiUrl =
    kind === "talent_application"
      ? "/api/admin/submissions?kind=talent_application"
      : "/api/admin/submissions?kind=company_inquiry";

  const { data, isLoading, mutate } = useSWR<{ rows: Row[] }>(apiUrl, fetcher, {
    refreshInterval: 0,
  });

  const rows = data?.rows ?? [];
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<
    | {
        type: "schedule" | "reject" | "approve" | "email" | "next_stage";
        row: Row;
        followUp?: boolean;
      }
    | null
  >(null);
  const [showAddRole, setShowAddRole] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  // Derive unique role labels from the rows (talent only).
  // Includes specialization (the most specific field on new applications),
  // plus role_category and inferred_role as fallbacks for legacy rows.
  const roleOptions = useMemo(() => {
    if (kind !== "talent_application") return [];
    const seen = new Set<string>();
    for (const r of rows) {
      const t = r as TalentRow;
      const label = t.specialization || t.role_category || t.inferred_role || null;
      if (label) seen.add(label);
    }
    return ["all", ...Array.from(seen).sort()];
  }, [rows, kind]);

  const filtered = useMemo(() => {
    let result = statusFilter === "all" ? rows : rows.filter((r) => r.status === statusFilter);
    if (kind === "talent_application" && roleFilter !== "all") {
      result = result.filter((r) => {
        const t = r as TalentRow;
        return (t.specialization || t.role_category || t.inferred_role) === roleFilter;
      });
    }
    return result;
  }, [rows, statusFilter, roleFilter, kind]);

  const openRow = openId ? rows.find((r) => r.id === openId) ?? null : null;

  const statusOptions =
    kind === "talent_application"
      ? ["all", "pending", "reviewing", "approved", "rejected"]
      : ["all", "new", "contacted", "qualified", "rejected", "closed"];

  function refreshAll() {
    mutate();
    globalMutate("/api/admin/users");
  }

  return (
    <div className="space-y-4">
      {/* Status filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-2 ${
              statusFilter === s
                ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="capitalize">{s === "all" ? "All" : s}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                statusFilter === s ? "bg-white/20" : "bg-gray-100"
              }`}
            >
              {counts[s] || 0}
            </span>
          </button>
        ))}
        <button
          onClick={() => mutate()}
          className="ml-auto h-9 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1.5"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
        {kind === "company_inquiry" && (
          <button
            onClick={() => setShowAddRole(true)}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-[#3B5BDB] text-white hover:bg-[#2d42a6] inline-flex items-center gap-1.5"
          >
            <Plus className="size-3.5" /> Add role
          </button>
        )}
      </div>

      {/* Role filter — talent applications only */}
      {kind === "talent_application" && roleOptions.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">Role</span>
          {roleOptions.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                roleFilter === r
                  ? "bg-[#3B5BDB]/10 text-[#3B5BDB] border-[#3B5BDB]/30"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {r === "all" ? "All roles" : r}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No submissions match this filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">{kind === "talent_application" ? "Applicant" : "Company"}</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Meeting</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    {kind === "talent_application" ? (
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{(r as TalentRow).full_name}</div>
                          <div className="text-xs text-gray-500 truncate">{r.email}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: "email", row: r });
                          }}
                          className="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-blue-50 text-[#3B5BDB] hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                          title="Send custom email"
                        >
                          <Mail className="size-3" />
                          Email
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{(r as CompanyRow).company_name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {(r as CompanyRow).contact_name} · {r.email}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: "email", row: r });
                          }}
                          className="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-blue-50 text-[#3B5BDB] hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                          title="Send custom email"
                        >
                          <Mail className="size-3" />
                          Email
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {kind === "talent_application" ? (
                      <RoleAndRateCell row={r as TalentRow} />
                    ) : (
                      (r as CompanyRow).role_title || (r as CompanyRow).role_category || "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={r.status} />
                      {kind === "company_inquiry" &&
                        (r as CompanyRow).payment_status === "paid" && <PaidBadge />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.meeting_at ? (
                      <div className="text-xs">
                        <div className="text-gray-900 font-medium">
                          {new Date(r.meeting_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                        <a
                          href={r.meeting_link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#3B5BDB] hover:underline inline-flex items-center gap-1"
                        >
                          Link <ExternalLink className="size-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {r.meeting_at ? (
                        <>
                          <ActionButton
                            title="Forward to next stage"
                            onClick={() => setActionModal({ type: "next_stage", row: r })}
                            color="emerald"
                          >
                            <ChevronRight className="size-3.5" />
                          </ActionButton>
                          <ActionButton
                            title="Schedule another interview"
                            onClick={() => setActionModal({ type: "schedule", row: r, followUp: true })}
                            color="blue"
                          >
                            <CalendarClock className="size-3.5" />
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton
                            title="Schedule meeting"
                            onClick={() => setActionModal({ type: "schedule", row: r })}
                            color="blue"
                          >
                            <CalendarClock className="size-3.5" />
                          </ActionButton>
                          <ActionButton
                            title="Approve & send welcome email"
                            onClick={() => setActionModal({ type: "approve", row: r })}
                            color="emerald"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </ActionButton>
                          <ActionButton
                            title="Reject"
                            onClick={() => setActionModal({ type: "reject", row: r })}
                            color="rose"
                          >
                            <XCircle className="size-3.5" />
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DetailDrawer
        kind={kind}
        row={openRow}
        onClose={() => setOpenId(null)}
        onAction={(t, followUp) => openRow && setActionModal({ type: t, row: openRow, followUp })}
      />

      <ActionModal
        kind={kind}
        modal={actionModal}
        onClose={() => setActionModal(null)}
        onDone={() => {
          setActionModal(null);
          refreshAll();
        }}
      />

      {kind === "company_inquiry" && showAddRole && (
        <AddRoleModal
          onClose={() => setShowAddRole(false)}
          onCreated={() => {
            setShowAddRole(false);
            refreshAll();
          }}
        />
      )}
    </div>
  );
}

function SalaryScalePanel({ row }: { row: TalentRow }) {
  const matched =
    matchSalaryRow(row.specialization) ||
    matchSalaryRow(row.role_category) ||
    matchSalaryRow(row.inferred_role) ||
    null;
  if (!matched) return null;
  const seniority = inferSeniority(
    row.years_experience,
    row.specialization || row.role_category || row.inferred_role
  );
  const cells: Array<{ key: "junior" | "mid" | "senior"; label: string; value: number }> = [
    { key: "junior", label: "Junior", value: matched.usd.junior },
    { key: "mid", label: "Mid", value: matched.usd.mid },
    { key: "senior", label: "Senior", value: matched.usd.senior },
  ];
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-emerald-700" />
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            DeepTalent rate
          </p>
        </div>
        <span className="text-[10px] text-emerald-700/70 font-medium">
          {formatRange(matched.usd.junior, matched.usd.senior)} · monthly
        </span>
      </div>
      <p className="text-sm text-gray-800 font-medium mb-3">{matched.label}</p>
      <div className="grid grid-cols-3 gap-2">
        {cells.map((c) => {
          const active = c.key === seniority;
          return (
            <div
              key={c.key}
              className={`rounded-lg p-2.5 border text-center ${
                active
                  ? "border-emerald-400 bg-white shadow-sm"
                  : "border-emerald-100 bg-white/60"
              }`}
            >
              <div
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  active ? "text-emerald-700" : "text-gray-500"
                }`}
              >
                {c.label}
                {active ? " · match" : ""}
              </div>
              <div
                className={`text-sm font-bold ${
                  active ? "text-emerald-700" : "text-gray-700"
                }`}
              >
                ${c.value.toLocaleString("en-US")}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
        Indicative DeepTalent monthly rate (30% discounted local-market, 2026). Seniority inferred from
        {row.years_experience != null ? ` ${row.years_experience} yrs experience.` : " applicant title."}
      </p>
    </div>
  );
}

function RoleAndRateCell({ row }: { row: TalentRow }) {
  const label = row.specialization || row.role_category || row.inferred_role || "—";
  const matched =
    matchSalaryRow(row.specialization) ||
    matchSalaryRow(row.role_category) ||
    matchSalaryRow(row.inferred_role) ||
    null;
  if (!matched) {
    return <span className="text-gray-600">{label}</span>;
  }
  const seniority = inferSeniority(row.years_experience, label);
  const value = matched.usd[seniority];
  return (
    <div className="space-y-1">
      <div className="text-gray-700">{label}</div>
      <div
        title={`Indicative DeepTalent rate · ${matched.label} · ${rangeForRow(matched)} (junior → senior)`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold"
      >
        <Wallet className="size-3" />
        ${value.toLocaleString("en-US")}/mo
        <span className="font-normal opacity-70 capitalize">· {seniority}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    reviewing: "bg-blue-50 text-blue-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
    new: "bg-amber-50 text-amber-700",
    contacted: "bg-blue-50 text-blue-700",
    qualified: "bg-emerald-50 text-emerald-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function PaidBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      <CreditCard className="size-3" />
      Paid
    </span>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  color,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  color: "blue" | "emerald" | "rose";
}) {
  const styles =
    color === "blue"
      ? "hover:bg-blue-50 text-gray-400 hover:text-[#3B5BDB]"
      : color === "emerald"
      ? "hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"
      : "hover:bg-rose-50 text-gray-400 hover:text-rose-600";
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-8 rounded-lg flex items-center justify-center transition-colors ${styles}`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Detail Drawer
// ---------------------------------------------------------------------------
function DetailDrawer({
  kind,
  row,
  onClose,
  onAction,
}: {
  kind: Kind;
  row: Row | null;
  onClose: () => void;
  onAction: (
    type: "schedule" | "approve" | "reject" | "email" | "next_stage",
    followUp?: boolean
  ) => void;
}) {
  if (!row) return null;
  const isTalent = kind === "talent_application";
  const t = row as TalentRow;
  const c = row as CompanyRow;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto">
        <header className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              {isTalent ? "Talent application" : "Company inquiry"}
            </p>
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {isTalent ? t.full_name : c.company_name}
            </h2>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="size-4 text-gray-500" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-2">
            <StatusBadge status={row.status} />
            <span className="text-xs text-gray-400">
              · Submitted {new Date(row.created_at).toLocaleDateString()}
            </span>
          </div>

          <Section title="Contact">
            <Field icon={Mail} label="Email" value={row.email} href={`mailto:${row.email}`} />
            {row.phone && <Field icon={Phone} label="Phone" value={row.phone} />}
            {isTalent && t.country && <Field icon={MapPin} label="Country" value={t.country} />}
            {!isTalent && c.website && (
              <Field icon={Globe} label="Website" value={c.website} href={c.website} />
            )}
            {isTalent && t.linkedin_url && (
              <Field icon={Linkedin} label="LinkedIn" value={t.linkedin_url} href={t.linkedin_url} />
            )}
          </Section>

          {isTalent ? (
            <Section title="Profile">
              <Field
                icon={Briefcase}
                label="Applied for"
                value={
                  t.specialization ||
                  t.role_category ||
                  t.inferred_role ||
                  "—"
                }
              />
              <Field icon={Sparkles} label="Category" value={t.role_category || "—"} />
              <Field icon={Sparkles} label="Experience" value={t.years_experience != null ? `${t.years_experience} yrs` : "—"} />
              {t.bio && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {t.bio}
                </div>
              )}
              <SalaryScalePanel row={t} />
            </Section>
          ) : (
            <Section title="Hiring need">
              <Field icon={Briefcase} label="Role" value={c.role_title || c.role_category || "—"} />
              <Field icon={Sparkles} label="Team size" value={c.team_size || "—"} />
              <Field icon={Sparkles} label="Urgency" value={c.urgency || "—"} />
              <Field icon={Sparkles} label="Budget" value={c.budget_range || "—"} />
              {c.notes && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {c.notes}
                </div>
              )}
            </Section>
          )}

          {!isTalent && (
            <Section title="Payment">
              {c.payment_status === "paid" ? (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="size-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800">
                      Subscription active
                    </span>
                  </div>
                  <dl className="text-sm space-y-1.5">
                    {c.amount_paid_cents != null && (
                      <div className="flex items-center justify-between">
                        <dt className="text-gray-500">Monthly amount</dt>
                        <dd className="font-semibold text-gray-900">
                          ${(c.amount_paid_cents / 100).toLocaleString("en-US")}/mo
                        </dd>
                      </div>
                    )}
                    {c.paid_at && (
                      <div className="flex items-center justify-between">
                        <dt className="text-gray-500">Paid on</dt>
                        <dd className="font-medium text-gray-900">
                          {new Date(c.paid_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </dd>
                      </div>
                    )}
                    {c.stripe_subscription_id && (
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-gray-500 shrink-0">Subscription</dt>
                        <dd className="font-mono text-xs text-gray-600 truncate">
                          {c.stripe_subscription_id}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="size-4 text-gray-400" />
                  No payment received yet.
                </div>
              )}
            </Section>
          )}

          {isTalent && t.files && t.files.length > 0 && (
            <Section title={`Files (${t.files.length})`}>
              <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                {t.files.map((f, i) => (
                  <FileRowAdmin key={`${f.bucket}-${f.storage_path}-${i}`} file={f} />
                ))}
              </ul>
            </Section>
          )}

          {row.meeting_at && (
            <Section title="Scheduled meeting">
              <Field
                icon={CalendarClock}
                label="When"
                value={new Date(row.meeting_at).toLocaleString()}
              />
              {row.meeting_link && (
                <Field icon={Globe} label="Link" value={row.meeting_link} href={row.meeting_link} />
              )}
            </Section>
          )}

          {row.decision_note && (
            <Section title="Internal note">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{row.decision_note}</p>
            </Section>
          )}
        </div>

        <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-3 flex flex-wrap items-center gap-2">
          {row.meeting_at ? (
            <>
              <button
                onClick={() => onAction("next_stage")}
                className="flex-1 min-w-[160px] h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5"
              >
                <ChevronRight className="size-4" /> Forward to next stage
              </button>
              <button
                onClick={() => onAction("schedule", true)}
                className="h-10 px-4 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] inline-flex items-center gap-1.5"
              >
                <CalendarClock className="size-4" /> Schedule another interview
              </button>
              <button
                onClick={() => onAction("email")}
                className="h-10 px-4 rounded-lg bg-blue-50 text-[#3B5BDB] text-sm font-semibold hover:bg-blue-100 inline-flex items-center gap-1.5"
                title="Send a custom email"
              >
                <Mail className="size-4" /> Email
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAction("schedule")}
                className="flex-1 min-w-[160px] h-10 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] inline-flex items-center justify-center gap-1.5"
              >
                <CalendarClock className="size-4" /> Schedule meeting
              </button>
              <button
                onClick={() => onAction("email")}
                className="h-10 px-4 rounded-lg bg-blue-50 text-[#3B5BDB] text-sm font-semibold hover:bg-blue-100 inline-flex items-center gap-1.5"
                title="Send a custom email"
              >
                <Mail className="size-4" /> Email
              </button>
              <button
                onClick={() => onAction("approve")}
                className="h-10 px-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-4" /> Approve
              </button>
              <button
                onClick={() => onAction("reject")}
                className="h-10 px-4 rounded-lg bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 inline-flex items-center gap-1.5"
              >
                <XCircle className="size-4" /> Reject
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: any;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="text-sm text-gray-700 truncate">{value}</span>
  );
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-4 text-gray-400 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-sm text-[#3B5BDB] hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action Modal (schedule | approve | reject | email)
// ---------------------------------------------------------------------------
function ActionModal({
  kind,
  modal,
  onClose,
  onDone,
}: {
  kind: Kind;
  modal: {
    type: "schedule" | "approve" | "reject" | "email" | "next_stage";
    row: Row;
    followUp?: boolean;
  } | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [meetingAt, setMeetingAt] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [note, setNote] = useState<string>("");
  // Custom email fields
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [emailCtaLabel, setEmailCtaLabel] = useState<string>("");
  const [emailCtaUrl, setEmailCtaUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!modal) return null;
  const { type, row, followUp } = modal;
  const recipientName =
    kind === "talent_application" ? (row as TalentRow).full_name : (row as CompanyRow).contact_name;

  const titleMap = {
    schedule: followUp ? "Schedule another interview" : "Schedule a meeting",
    approve: "Approve & send welcome",
    reject: "Reject application",
    email: "Send custom email",
    next_stage: "Forward to next stage",
  } as const;

  const descMap = {
    schedule: followUp
      ? `Set up a follow-up interview with ${recipientName}. They'll receive a branded email with the new time and a Google Calendar add link.`
      : `Pick a time and paste the meeting link. ${recipientName} will get a branded email with a Google Calendar add link.`,
    approve: `Mark as approved and send the branded welcome email to ${recipientName}.`,
    reject: `Reject and permanently remove this application. A polite rejection email is sent to ${recipientName} and a snapshot is archived for your records.`,
    email: `Compose a one-off email to ${recipientName}. It's wrapped in the DeepTalent template and replies route to mail@deeptalentplatform.com.`,
    next_stage: `Advance ${recipientName} to the next stage after the meeting. They'll get a branded email letting them know they're moving forward.`,
  };

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        kind,
        id: row.id,
        action: type === "email" ? "custom_email" : type,
        note: note || undefined,
      };
      if (type === "schedule") {
        if (!meetingAt || !meetingLink) {
          setError("Please pick a time and paste the meeting link.");
          setSubmitting(false);
          return;
        }
        // datetime-local gives us a local timestamp; convert to ISO via Date()
        payload.meetingAt = new Date(meetingAt).toISOString();
        payload.meetingLink = meetingLink;
        if (followUp) payload.followUp = true;
      }
      if (type === "email") {
        if (!emailSubject.trim() || !emailMessage.trim()) {
          setError("Subject and message are required.");
          setSubmitting(false);
          return;
        }
        if (emailCtaLabel.trim() && !emailCtaUrl.trim()) {
          setError("Please add a URL for the button, or remove the button label.");
          setSubmitting(false);
          return;
        }
        payload.subject = emailSubject.trim();
        payload.message = emailMessage.trim();
        if (emailCtaLabel.trim() && emailCtaUrl.trim()) {
          payload.ctaLabel = emailCtaLabel.trim();
          payload.ctaUrl = emailCtaUrl.trim();
        }
      }
      const res = await fetch("/api/admin/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Something went wrong.");
      } else {
        // Reset state for next open
        setMeetingAt("");
        setMeetingLink("");
        setNote("");
        setEmailSubject("");
        setEmailMessage("");
        setEmailCtaLabel("");
        setEmailCtaUrl("");
        onDone();
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                type === "schedule"
                  ? "bg-blue-50 text-[#3B5BDB]"
                  : type === "approve" || type === "next_stage"
                  ? "bg-emerald-50 text-emerald-600"
                  : type === "reject"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-blue-50 text-[#3B5BDB]"
              }`}
            >
              {type === "schedule" ? (
                <CalendarClock className="size-4" />
              ) : type === "approve" ? (
                <CheckCircle2 className="size-4" />
              ) : type === "next_stage" ? (
                <ChevronRight className="size-4" />
              ) : type === "reject" ? (
                <XCircle className="size-4" />
              ) : (
                <Mail className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{titleMap[type]}</h3>
              <p className="text-xs text-gray-500 truncate">{recipientName} · {row.email}</p>
            </div>
          </div>
          <button onClick={() => !submitting && onClose()} className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center shrink-0">
            <X className="size-4 text-gray-500" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-600 leading-relaxed">{descMap[type]}</p>

          {type === "schedule" && (
            <>
              <Field2 label="Meeting date & time">
                <input
                  type="datetime-local"
                  value={meetingAt}
                  onChange={(e) => setMeetingAt(e.target.value)}
                  className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                />
              </Field2>
              <Field2 label="Meeting link (Zoom / Google Meet / Teams)">
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                />
              </Field2>
            </>
          )}

          {type === "email" && (
            <>
              <Field2 label="Subject">
                <input
                  type="text"
                  maxLength={200}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Quick question about your application"
                  className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                />
              </Field2>
              <Field2 label="Message">
                <textarea
                  rows={8}
                  maxLength={8000}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder={`Hi ${recipientName.split(" ")[0] || "there"},\n\nThanks for your application — I wanted to follow up about...\n\n— DeepTalent Team`}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB] resize-y leading-relaxed"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Tip: leave a blank line between paragraphs. {emailMessage.length}/8000
                </p>
              </Field2>

              <div className="grid grid-cols-2 gap-3">
                <Field2 label="Button label (optional)">
                  <input
                    type="text"
                    maxLength={40}
                    value={emailCtaLabel}
                    onChange={(e) => setEmailCtaLabel(e.target.value)}
                    placeholder="Book a call"
                    className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                  />
                </Field2>
                <Field2 label="Button URL (optional)">
                  <input
                    type="url"
                    value={emailCtaUrl}
                    onChange={(e) => setEmailCtaUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                  />
                </Field2>
              </div>
            </>
          )}

          {type !== "email" && (
            <Field2
              label={
                type === "reject"
                  ? "Reason (optional, included in the email)"
                  : "Personal note (optional, shown to the recipient)"
              }
            >
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  type === "reject"
                    ? "We're prioritizing candidates with experience in..."
                    : "Looking forward to connecting!"
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB] resize-none"
              />
            </Field2>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-rose-700">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-4 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className={`h-10 px-5 rounded-lg text-sm font-semibold text-white inline-flex items-center gap-1.5 disabled:opacity-60 ${
              type === "schedule"
                ? "bg-[#3B5BDB] hover:bg-[#2d42a6]"
                : type === "approve" || type === "next_stage"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : type === "reject"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#3B5BDB] hover:bg-[#2d42a6]"
            }`}
          >
            {submitting ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : type === "schedule" ? (
              <Send className="size-4" />
            ) : type === "approve" ? (
              <CheckCircle2 className="size-4" />
            ) : type === "next_stage" ? (
              <ChevronRight className="size-4" />
            ) : type === "reject" ? (
              <XCircle className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
            {submitting
              ? "Sending…"
              : type === "schedule"
              ? "Send invite"
              : type === "approve"
              ? "Approve & send"
              : type === "next_stage"
              ? "Forward & notify"
              : type === "reject"
              ? "Reject & notify"
              : "Send email"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Add Role Modal — admin-authored open role, posted to /talents/apply#roles
// ---------------------------------------------------------------------------

function FileRowAdmin({ file }: { file: SubmissionFile }) {
  const [opening, setOpening] = useState(false);
  const isImage =
    (file.content_type && file.content_type.startsWith("image/")) ||
    /\.(png|jpe?g|gif|webp)$/i.test(file.file_name);

  const sourceLabel =
    file.source === "resume"
      ? "Resume"
      : file.source === "certification"
        ? "Certification"
        : file.bucket === "avatars"
          ? "Profile photo"
          : "Verification doc";

  async function open() {
    setOpening(true);
    try {
      const res = await fetch("/api/admin/file-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: file.bucket, path: file.storage_path }),
      });
      const json = await res.json();
      if (!res.ok || !json?.url) {
        alert(json?.error || "Could not open file.");
        return;
      }
      window.open(json.url, "_blank", "noopener");
    } finally {
      setOpening(false);
    }
  }

  function fmtBytes(b: number | null | undefined) {
    if (!b) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 bg-white">
      <div
        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
          isImage ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#3B5BDB]"
        }`}
      >
        {isImage ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{file.file_name}</p>
        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-[10px]">
            {sourceLabel}
          </span>
          {file.size_bytes ? <span>· {fmtBytes(file.size_bytes)}</span> : null}
        </p>
      </div>
      <button
        onClick={open}
        disabled={opening}
        className="shrink-0 inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        <ExternalLink className="size-3.5" /> {opening ? "Opening…" : "Open"}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
const ROLE_CATEGORIES = [
  "Finance, Accounting & Compliance",
  "Engineering & Cloud",
  "Data & AI",
  "Cybersecurity & Risk",
  "Executive & Business Operations",
  "Customer Experience & Support",
  "Other",
];
const URGENCY_OPTIONS = ["Immediate", "Within 1 month", "1-3 months", "Exploring"];
const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

function AddRoleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [roleCategory, setRoleCategory] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [urgency, setUrgency] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!companyName.trim() || !roleTitle.trim()) {
      setError("Company name and role title are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          role_title: roleTitle.trim(),
          role_category: roleCategory || undefined,
          team_size: teamSize || undefined,
          urgency: urgency || undefined,
          budget_range: budgetRange.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      onCreated();
    } catch (e: any) {
      setError(e?.message || String(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-50 text-[#3B5BDB] flex items-center justify-center">
              <Plus className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add a new role</h3>
              <p className="text-xs text-gray-500">Posted as an approved open role on /talents/apply</p>
            </div>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="size-4 text-gray-500" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field2 label="Company name *">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
              />
            </Field2>
            <Field2 label="Role title *">
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Senior Backend Engineer"
                className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
              />
            </Field2>
          </div>

          <Field2 label="Category">
            <select
              value={roleCategory}
              onChange={(e) => setRoleCategory(e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
            >
              <option value="">Select a category</option>
              {ROLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field2 label="Team size">
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
              >
                <option value="">—</option>
                {TEAM_SIZES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field2>
            <Field2 label="Urgency">
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
              >
                <option value="">—</option>
                {URGENCY_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field2>
          </div>

          <Field2 label="Budget range (optional)">
            <input
              type="text"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              placeholder="$120k – $180k"
              className="h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
            />
          </Field2>

          <Field2 label="Notes / description (optional)">
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What the company is looking for, must-have skills, location, etc."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB] resize-y leading-relaxed"
            />
            <p className="text-[11px] text-gray-400 mt-1">Shown publicly on the apply page.</p>
          </Field2>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-rose-700">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-4 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="h-10 px-5 rounded-lg text-sm font-semibold text-white bg-[#3B5BDB] hover:bg-[#2d42a6] inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {submitting ? "Posting…" : "Post role"}
          </button>
        </footer>
      </div>
    </div>
  );
}
