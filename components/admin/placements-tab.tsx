"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  Loader2,
  Mail,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Placement = {
  id: string;
  created_at: string;
  talent_user_id: string | null;
  talent_name: string;
  talent_email: string;
  talent_role: string | null;
  talent_seniority: string | null;
  company_user_id: string | null;
  company_name: string;
  company_contact: string | null;
  company_email: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  monthly_rate_usd: number | null;
  currency: string;
  notes: string | null;
  placed_by_email: string | null;
};

type TalentRow = {
  id: string;
  full_name: string;
  email: string;
  role_category: string | null;
  specialization: string | null;
  user_id: string | null;
};

type CompanyRow = {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
};

const EMPTY_FORM = {
  talent_user_id: "",
  talent_name: "",
  talent_email: "",
  talent_role: "",
  talent_seniority: "",
  company_user_id: "",
  company_name: "",
  company_contact: "",
  company_email: "",
  start_date: "",
  end_date: "",
  status: "active",
  monthly_rate_usd: "",
  currency: "USD",
  notes: "",
};

export function PlacementsTab() {
  const { data, isLoading, mutate } = useSWR<{ rows: Placement[] }>(
    "/api/admin/placements",
    fetcher,
    { refreshInterval: 0 }
  );

  // For populating dropdowns
  const { data: appsData } = useSWR<{ rows: TalentRow[] }>(
    "/api/admin/submissions?kind=talent_application",
    fetcher
  );
  const { data: usersData } = useSWR<{ users: any[] }>(
    "/api/admin/users",
    fetcher
  );

  const placements = data?.rows ?? [];
  const approvedTalent: TalentRow[] = useMemo(
    () => (appsData?.rows ?? []).filter((r: any) => r.status === "approved"),
    [appsData]
  );
  const companies: CompanyRow[] = useMemo(
    () => (usersData?.users ?? []).filter((u: any) => u.role === "company"),
    [usersData]
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = placements;
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.talent_name.toLowerCase().includes(q) ||
          r.talent_email.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          (r.talent_role || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [placements, query, statusFilter]);

  const totalActive = placements.filter((p) => p.status === "active").length;
  const totalMonthly = placements
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + (Number(p.monthly_rate_usd) || 0), 0);

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: Placement) {
    setEditId(p.id);
    setForm({
      talent_user_id: p.talent_user_id || "",
      talent_name: p.talent_name,
      talent_email: p.talent_email,
      talent_role: p.talent_role || "",
      talent_seniority: p.talent_seniority || "",
      company_user_id: p.company_user_id || "",
      company_name: p.company_name,
      company_contact: p.company_contact || "",
      company_email: p.company_email || "",
      start_date: p.start_date || "",
      end_date: p.end_date || "",
      status: p.status,
      monthly_rate_usd: p.monthly_rate_usd != null ? String(p.monthly_rate_usd) : "",
      currency: p.currency || "USD",
      notes: p.notes || "",
    });
    setError(null);
    setShowForm(true);
  }

  function fillTalent(talentId: string) {
    const t = approvedTalent.find((r) => r.user_id === talentId || r.id === talentId);
    if (!t) return;
    setForm((f) => ({
      ...f,
      talent_user_id: t.user_id || t.id,
      talent_name: t.full_name,
      talent_email: t.email,
      talent_role: t.specialization || t.role_category || f.talent_role,
    }));
  }

  function fillCompany(companyId: string) {
    const c = companies.find((r) => r.id === companyId);
    if (!c) return;
    setForm((f) => ({
      ...f,
      company_user_id: c.id,
      company_name: c.company_name || c.full_name,
      company_email: c.email,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Coerce empty-string UUIDs to null so FK constraints are satisfied
    const toUuid = (v: string) => v.trim().length > 0 ? v.trim() : null;

    try {
      const payload = {
        talent_user_id: toUuid(form.talent_user_id),
        talent_name: form.talent_name,
        talent_email: form.talent_email,
        talent_role: form.talent_role || null,
        talent_seniority: form.talent_seniority || null,
        company_user_id: toUuid(form.company_user_id),
        company_name: form.company_name,
        company_contact: form.company_contact || null,
        company_email: form.company_email || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
        monthly_rate_usd: form.monthly_rate_usd ? Number(form.monthly_rate_usd) : null,
        currency: form.currency || "USD",
        notes: form.notes || null,
        ...(editId ? { id: editId } : {}),
      };
      const res = await fetch("/api/admin/placements", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save placement");
      mutate();
      setShowForm(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this placement? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/placements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      mutate();
    } catch {
      alert("Failed to delete placement.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="size-5 text-[#3B5BDB]" />
            Talent Placements
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign vetted, interviewed talent to companies and track their placements.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] transition-colors shrink-0"
        >
          <Plus className="size-4" /> New placement
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center">
            <Users className="size-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total placements</p>
            <p className="text-xl font-bold text-gray-900">{placements.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-gray-900">{totalActive}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
            <DollarSign className="size-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Monthly value</p>
            <p className="text-xl font-bold text-gray-900">
              {totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : "$0"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, company, role..."
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
          />
        </div>
        {["all", "active", "ended", "on_hold"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 h-10 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              statusFilter === s
                ? "bg-[#3B5BDB] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Placement form (slide in) */}
      {showForm && (
        <div className="mb-6 bg-white border border-[#3B5BDB]/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {editId ? "Edit placement" : "New placement"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="size-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Talent section */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Talent
              </legend>

              {approvedTalent.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Pick from approved talent
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30"
                    defaultValue=""
                    onChange={(e) => e.target.value && fillTalent(e.target.value)}
                  >
                    <option value="">— Select vetted talent —</option>
                    {approvedTalent.map((t) => (
                      <option key={t.id} value={t.user_id || t.id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full name *</label>
                  <input required className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.talent_name} onChange={(e) => setForm((f) => ({ ...f, talent_name: e.target.value }))} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                  <input required type="email" className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.talent_email} onChange={(e) => setForm((f) => ({ ...f, talent_email: e.target.value }))} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <input className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.talent_role} onChange={(e) => setForm((f) => ({ ...f, talent_role: e.target.value }))} placeholder="Frontend Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Seniority</label>
                  <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.talent_seniority} onChange={(e) => setForm((f) => ({ ...f, talent_seniority: e.target.value }))}>
                    <option value="">Select...</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Company section */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Company
              </legend>

              {companies.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Pick from registered companies
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30"
                    defaultValue=""
                    onChange={(e) => e.target.value && fillCompany(e.target.value)}
                  >
                    <option value="">— Select company —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company name *</label>
                  <input required className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company email</label>
                  <input type="email" className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.company_email} onChange={(e) => setForm((f) => ({ ...f, company_email: e.target.value }))} placeholder="hr@acme.com" />
                </div>
              </div>
            </fieldset>

            {/* Placement details */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Placement Details
              </legend>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                    <option value="on_hold">On hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
                  <input type="date" className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
                  <input type="date" className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monthly rate (USD)</label>
                  <input type="number" min="0" step="0.01" className="form-input h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.monthly_rate_usd} onChange={(e) => setForm((f) => ({ ...f, monthly_rate_usd: e.target.value }))} placeholder="e.g. 4500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                  <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                    <option value="KES">KES</option>
                    <option value="ZAR">ZAR</option>
                    <option value="GHS">GHS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} className="form-input w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 resize-none" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
              </div>
            </fieldset>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] disabled:opacity-60 transition-colors"
              >
                {saving ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : editId ? "Save changes" : "Create placement"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Placements grid */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="size-4 animate-spin" /> Loading placements…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Users className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No placements yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Click &quot;New placement&quot; to assign vetted talent to a company.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PlacementCard
              key={p.id}
              placement={p}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p.id)}
              deleting={deleting === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlacementCard({
  placement: p,
  onEdit,
  onDelete,
  deleting,
}: {
  placement: Placement;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
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
      {/* Talent */}
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

      {/* Arrow */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-medium text-gray-600 truncate">
          {p.talent_role || "Talent"}{p.talent_seniority ? ` · ${p.talent_seniority}` : ""}
        </span>
        <ArrowUpRight className="size-3.5 shrink-0" />
        <span className="font-medium text-gray-700 truncate flex items-center gap-1">
          <Building2 className="size-3.5 text-gray-400 shrink-0" />
          {p.company_name}
        </span>
      </div>

      {/* Rate + dates */}
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Monthly rate</p>
          <p className="text-sm font-bold text-gray-900">
            {p.monthly_rate_usd != null
              ? `${p.currency} ${Number(p.monthly_rate_usd).toLocaleString()}`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Start date</p>
          <p className="text-sm font-medium text-gray-700">
            {p.start_date
              ? new Date(p.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>

      {p.notes && (
        <p className="text-xs text-gray-400 leading-relaxed">{p.notes}</p>
      )}

      <p className="text-[10px] text-gray-400">Placed by {p.placed_by_email || "admin"}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Pencil className="size-3.5" /> Edit
        </button>
        {p.talent_email && (
          <a
            href={`mailto:${p.talent_email}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Mail className="size-3.5" /> Email talent
          </a>
        )}
        <button
          onClick={onDelete}
          disabled={deleting}
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
