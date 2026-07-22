"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Zap,
  Plus,
  Loader2,
  X,
  Play,
  Trash2,
  Repeat,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Power,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Sender = { key: string; label: string; description: string; address: string; from: string };
type Segment = { key: string; label: string; description: string; count: number };

type Automation = {
  id: string;
  name: string;
  kind: string;
  recurrence: "once" | "daily" | "weekly" | "monthly";
  from_key: string;
  subject: string;
  segment: string | null;
  manual_emails: string[] | null;
  enabled: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: string | null;
  last_sent_count: number | null;
  total_runs: number;
  total_sent: number;
};

const RECURRENCE_META: Record<string, { label: string; icon: any }> = {
  once: { label: "One-time", icon: CalendarClock },
  daily: { label: "Daily", icon: Repeat },
  weekly: { label: "Weekly", icon: Repeat },
  monthly: { label: "Monthly", icon: Repeat },
};

export function EmailAutomationsView({ senders, segments }: { senders: Sender[]; segments: Segment[] }) {
  const { data, isLoading } = useSWR<{ automations: Automation[] }>(
    "/api/admin/mass-email/automations",
    fetcher,
    { refreshInterval: 30_000 }
  );
  const [showCreate, setShowCreate] = useState(false);

  const automations = data?.automations ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="size-5 text-[#3B5BDB]" /> Automations
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 max-w-xl">
            Schedule one-time or recurring campaigns to a segment. They send automatically on their schedule
            (checked hourly) and respect your daily &amp; monthly sending limits.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors shrink-0"
        >
          <Plus className="size-4" /> New automation
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <Zap className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">No automations yet</p>
          <p className="text-xs text-gray-400 mt-1">Create one to send campaigns on a schedule.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {automations.map((a) => (
            <AutomationCard key={a.id} automation={a} segments={segments} />
          ))}
        </div>
      )}

      {showCreate && (
        <AutomationModal senders={senders} segments={segments} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

function AutomationCard({ automation: a, segments }: { automation: Automation; segments: Segment[] }) {
  const [busy, setBusy] = useState<null | "toggle" | "run" | "delete">(null);
  const Rec = RECURRENCE_META[a.recurrence]?.icon ?? CalendarClock;
  const segLabel = a.segment ? segments.find((s) => s.key === a.segment)?.label ?? a.segment : null;

  async function toggle() {
    setBusy("toggle");
    try {
      await fetch(`/api/admin/mass-email/automations/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !a.enabled }),
      });
      mutate("/api/admin/mass-email/automations");
    } finally {
      setBusy(null);
    }
  }

  async function runNow() {
    setBusy("run");
    try {
      const res = await fetch(`/api/admin/mass-email/automations/${a.id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) alert(json.error || "Run failed.");
      mutate("/api/admin/mass-email/automations");
      mutate("/api/admin/mass-email");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm(`Delete automation "${a.name}"?`)) return;
    setBusy("delete");
    try {
      await fetch(`/api/admin/mass-email/automations/${a.id}`, { method: "DELETE" });
      mutate("/api/admin/mass-email/automations");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4">
      <div
        className={`size-10 rounded-xl grid place-items-center shrink-0 ${
          a.enabled ? "bg-[#3B5BDB]/10 text-[#3B5BDB]" : "bg-gray-100 text-gray-400"
        }`}
      >
        <Rec className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            {RECURRENCE_META[a.recurrence]?.label ?? a.recurrence}
          </span>
          {!a.enabled && (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">
              Off
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{a.subject}</p>

        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-2 text-[11px] text-gray-400">
          {segLabel && <span>To: {segLabel}</span>}
          {a.next_run_at && a.enabled && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> Next: {new Date(a.next_run_at).toLocaleString()}
            </span>
          )}
          {a.last_run_at && (
            <span className="inline-flex items-center gap-1">
              {a.last_status === "failed" ? (
                <AlertTriangle className="size-3 text-amber-500" />
              ) : (
                <CheckCircle2 className="size-3 text-emerald-500" />
              )}
              Last: {new Date(a.last_run_at).toLocaleDateString()} · {a.last_sent_count ?? 0} sent
            </span>
          )}
          <span>{a.total_sent} sent all-time</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={runNow}
          disabled={busy !== null}
          title="Run now"
          className="p-2 rounded-lg text-gray-400 hover:text-[#3B5BDB] hover:bg-gray-50 disabled:opacity-50"
        >
          {busy === "run" ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
        </button>
        <button
          onClick={toggle}
          disabled={busy !== null}
          title={a.enabled ? "Turn off" : "Turn on"}
          className={`p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 ${
            a.enabled ? "text-emerald-500" : "text-gray-300"
          }`}
        >
          {busy === "toggle" ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
        </button>
        <button
          onClick={remove}
          disabled={busy !== null}
          title="Delete"
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-50 disabled:opacity-50"
        >
          {busy === "delete" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function AutomationModal({
  senders,
  segments,
  onClose,
}: {
  senders: Sender[];
  segments: Segment[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [recurrence, setRecurrence] = useState<"once" | "daily" | "weekly" | "monthly">("once");
  const [fromKey, setFromKey] = useState("memo");
  const [segment, setSegment] = useState("");
  const [manual, setManual] = useState("");
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [startAt, setStartAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim() || !subject.trim() || bodyHtml.trim().length < 10 || !startAt) {
      setError("Name, subject, body, and start time are required.");
      return;
    }
    if (!segment && manual.trim().length === 0) {
      setError("Choose a segment or add manual recipients.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/mass-email/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          recurrence,
          fromKey,
          segment: segment || null,
          manualEmails: manual,
          subject,
          previewText: preview,
          bodyHtml,
          startAt,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not create automation.");
        return;
      }
      mutate("/api/admin/mass-email/automations");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Zap className="size-5 text-[#3B5BDB]" /> New automation
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Automation name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="Weekly talent digest" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Frequency</label>
            <div className="grid grid-cols-4 gap-2">
              {(["once", "daily", "weekly", "monthly"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurrence(r)}
                  className={`px-2 py-2 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                    recurrence === r ? "border-[#3B5BDB] bg-[#3B5BDB]/[0.03] text-[#3B5BDB]" : "border-gray-100 text-gray-600 hover:border-gray-200"
                  }`}
                >
                  {r === "once" ? "One-time" : r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {recurrence === "once" ? "Send at" : "First send (then repeats)"}
            </label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="form-input" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Send from</label>
            <select value={fromKey} onChange={(e) => setFromKey(e.target.value)} className="form-input">
              {senders.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} ({s.address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Audience segment</label>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} className="form-input">
              <option value="">— None —</option>
              {segments.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} ({s.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Extra recipients <span className="text-gray-400">(optional, comma separated)</span>
            </label>
            <textarea rows={2} value={manual} onChange={(e) => setManual(e.target.value)} className="form-input text-[13px]" placeholder="jane@acme.com, john@corp.com" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="form-input" placeholder="This week at DeepTalent" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Preview text <span className="text-gray-400">(optional)</span>
            </label>
            <input value={preview} onChange={(e) => setPreview(e.target.value)} className="form-input" placeholder="Inbox preview snippet" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Email body <span className="text-gray-400">(HTML supported)</span>
            </label>
            <textarea
              rows={8}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              className="form-input font-mono text-[13px] leading-relaxed"
              placeholder={"<p>Hi {{name}},</p>\n<p>Here's what's new...</p>"}
            />
            <p className="text-xs text-gray-400 mt-1.5">Wrapped in the branded DeepTalent template automatically.</p>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
          Create automation
        </button>
      </div>
    </div>
  );
}
