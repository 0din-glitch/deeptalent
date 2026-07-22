"use client";

import { useMemo, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Send,
  Mail,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Users,
  Gauge,
  Loader2,
  X,
  CheckCircle2,
  Clock,
  Ban,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  CalendarPlus,
  Trash2,
} from "lucide-react";
import { parseCsv, type Recipient } from "@/lib/email/mass";
import { EmailAutomationsView } from "@/components/admin/email-automations-view";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Sender = { key: string; label: string; description: string; address: string; from: string };
type Segment = { key: string; label: string; description: string; count: number };
type Campaign = {
  id: string;
  subject: string;
  from_email: string;
  from_key: string;
  segment: string | null;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
};
type Usage = {
  sentToday: number;
  sentThisMonth: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyRemaining: number;
  monthlyRemaining: number;
};

export function MassEmailTab() {
  const { data } = useSWR<{
    campaigns: Campaign[];
    totals: { campaigns: number; sent: number; delivered: number; opened: number; clicked: number; bounced: number };
    usage: Usage;
    segments: Segment[];
    senders: Sender[];
  }>("/api/admin/mass-email", fetcher, { refreshInterval: 20_000 });

  const [view, setView] = useState<"compose" | "campaigns" | "automations">("compose");

  const usage = data?.usage;
  const totals = data?.totals;
  const openRate = totals && totals.delivered > 0 ? Math.round((totals.opened / totals.delivered) * 100) : 0;
  const clickRate = totals && totals.delivered > 0 ? Math.round((totals.clicked / totals.delivered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Send} label="Total sent" value={totals?.sent ?? 0} tone="blue" />
        <MetricCard icon={Eye} label="Open rate" value={`${openRate}%`} sub={`${totals?.opened ?? 0} opens`} tone="emerald" />
        <MetricCard icon={MousePointerClick} label="Click rate" value={`${clickRate}%`} sub={`${totals?.clicked ?? 0} clicks`} tone="violet" />
        <MetricCard icon={AlertTriangle} label="Bounced" value={totals?.bounced ?? 0} tone="amber" />
      </div>

      {/* Rate usage */}
      {usage && (
        <div className="grid sm:grid-cols-2 gap-4">
          <UsageBar
            label="Daily sending"
            used={usage.sentToday}
            limit={usage.dailyLimit}
            remaining={usage.dailyRemaining}
          />
          <UsageBar
            label="Monthly sending"
            used={usage.sentThisMonth}
            limit={usage.monthlyLimit}
            remaining={usage.monthlyRemaining}
          />
        </div>
      )}

      {/* View switch */}
      <div className="flex items-center gap-1 border-b border-gray-100">
        <SubTab active={view === "compose"} onClick={() => setView("compose")}>
          Compose
        </SubTab>
        <SubTab active={view === "campaigns"} onClick={() => setView("campaigns")}>
          Campaigns {data?.campaigns?.length ? `(${data.campaigns.length})` : ""}
        </SubTab>
        <SubTab active={view === "automations"} onClick={() => setView("automations")}>
          Automations
        </SubTab>
      </div>

      {view === "compose" && (
        <Compose senders={data?.senders ?? []} segments={data?.segments ?? []} usage={usage} />
      )}
      {view === "campaigns" && <CampaignHistory campaigns={data?.campaigns ?? []} />}
      {view === "automations" && (
        <EmailAutomationsView senders={data?.senders ?? []} segments={data?.segments ?? []} />
      )}
    </div>
  );
}

// ── Compose ───────────────────────────────────────────────────────────────
function Compose({
  senders,
  segments,
  usage,
}: {
  senders: Sender[];
  segments: Segment[];
  usage?: Usage;
}) {
  const [fromKey, setFromKey] = useState("noreply");
  const [segment, setSegment] = useState<string>("");
  const [manual, setManual] = useState("");
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // CSV upload
  const [csv, setCsv] = useState<Recipient[]>([]);
  const [csvName, setCsvName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Meeting invite
  const [meetingOn, setMeetingOn] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mStart, setMStart] = useState("");
  const [mDuration, setMDuration] = useState(30);
  const [mLocation, setMLocation] = useState("");

  function handleCsvFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsv(String(reader.result || ""));
        if (parsed.length === 0) {
          setError("No valid emails found in that CSV.");
          return;
        }
        setCsv(parsed);
        setCsvName(file.name);
      } catch {
        setError("Could not read that CSV file.");
      }
    };
    reader.readAsText(file);
  }

  const manualCount = useMemo(
    () => manual.split(/[\s,;]+/).map((s) => s.trim()).filter((s) => s.includes("@")).length,
    [manual]
  );
  const segmentCount = segments.find((s) => s.key === segment)?.count ?? 0;
  // Rough upper bound (may overlap); real de-dupe happens server-side.
  const estRecipients = (segment ? segmentCount : 0) + manualCount + csv.length;

  async function handleSend() {
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const meeting =
        meetingOn && mTitle.trim() && mStart
          ? { title: mTitle.trim(), start: mStart, durationMinutes: mDuration, location: mLocation.trim() || undefined }
          : null;

      const res = await fetch("/api/admin/mass-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromKey,
          segment: segment || null,
          manualEmails: manual,
          csvRecipients: csv,
          subject,
          previewText: preview,
          bodyHtml,
          meeting,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to send.");
        return;
      }
      setResult({ sent: json.sent, failed: json.failed });
      setSubject("");
      setPreview("");
      setBodyHtml("");
      setManual("");
      setSegment("");
      setCsv([]);
      setCsvName(null);
      setMeetingOn(false);
      setMTitle("");
      setMStart("");
      setMLocation("");
      mutate("/api/admin/mass-email");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
      setConfirm(false);
    }
  }

  const canSend = subject.trim() && bodyHtml.trim().length > 10 && estRecipients > 0 && !sending;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {/* Sender */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">Send from</label>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {senders.map((s) => (
              <button
                key={s.key}
                onClick={() => setFromKey(s.key)}
                className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                  fromKey === s.key ? "border-[#3B5BDB] bg-[#3B5BDB]/[0.03]" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                <p className="text-[11px] text-gray-500 truncate">{s.address}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-1.5">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="form-input" placeholder="Your subject line" />
        </div>

        {/* Preview text */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-1.5">
            Preview text <span className="text-gray-400 font-normal">(inbox preview snippet, optional)</span>
          </label>
          <input value={preview} onChange={(e) => setPreview(e.target.value)} className="form-input" placeholder="Shown after the subject in most inboxes" />
        </div>

        {/* Body */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-1.5">
            Email body <span className="text-gray-400 font-normal">(HTML supported)</span>
          </label>
          <textarea
            rows={12}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            className="form-input font-mono text-[13px] leading-relaxed"
            placeholder={"<p>Hi there,</p>\n<p>We'd love to tell you about...</p>\n<p><a href=\"https://deeptalentplatform.com\">Learn more</a></p>"}
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Content is wrapped in a branded DeepTalent template with header and reply footer automatically.
          </p>
        </div>

        {/* Meeting invite */}
        <div className="border border-gray-100 rounded-2xl p-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={meetingOn}
              onChange={(e) => setMeetingOn(e.target.checked)}
              className="size-4 rounded border-gray-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
            />
            <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <CalendarPlus className="size-4 text-[#3B5BDB]" /> Attach a meeting invite
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-6">
            Adds a scheduled meeting block with an “Add to Google Calendar” button to the email.
          </p>

          {meetingOn && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-500 block mb-1">Meeting title</label>
                <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} className="form-input" placeholder="Intro call with DeepTalent" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Date &amp; time</label>
                <input type="datetime-local" value={mStart} onChange={(e) => setMStart(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Duration (minutes)</label>
                <input type="number" min={15} step={15} value={mDuration} onChange={(e) => setMDuration(Number(e.target.value))} className="form-input" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-500 block mb-1">Location or video link</label>
                <input value={mLocation} onChange={(e) => setMLocation(e.target.value)} className="form-input" placeholder="https://meet.google.com/... or an address" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipients / send panel */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-6">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Users className="size-4 text-[#3B5BDB]" /> Recipients
          </h3>

          <label className="text-xs font-medium text-gray-500 block mb-1.5">Audience segment</label>
          <select value={segment} onChange={(e) => setSegment(e.target.value)} className="form-input mb-3">
            <option value="">— None —</option>
            {segments.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({s.count})
              </option>
            ))}
          </select>

          <label className="text-xs font-medium text-gray-500 block mb-1.5">Add emails manually</label>
          <textarea
            rows={4}
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="form-input text-[13px]"
            placeholder="jane@acme.com, john@corp.com"
          />
          {manualCount > 0 && <p className="text-[11px] text-gray-400 mt-1">{manualCount} manual email(s)</p>}

          {/* CSV upload */}
          <label className="text-xs font-medium text-gray-500 block mt-3 mb-1.5">Import from CSV</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleCsvFile(f);
              e.target.value = "";
            }}
          />
          {csv.length === 0 ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-[#3B5BDB]/40 hover:text-[#3B5BDB] transition-colors"
            >
              <Upload className="size-4" /> Upload CSV
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#3B5BDB]/[0.04] border border-[#3B5BDB]/15">
              <FileSpreadsheet className="size-4 text-[#3B5BDB] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">{csvName}</p>
                <p className="text-[11px] text-gray-500">{csv.length} recipient(s)</p>
              </div>
              <button
                onClick={() => { setCsv([]); setCsvName(null); }}
                className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-red-500"
                title="Remove CSV"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-1">
            Columns: <code className="text-gray-500">email</code>, <code className="text-gray-500">name</code> (optional). Works for internal &amp; external contacts.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">Est. recipients</span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">{estRecipients}</span>
          </div>

          {usage && estRecipients > usage.dailyRemaining && (
            <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="size-3" /> Exceeds daily limit ({usage.dailyRemaining} left)
            </p>
          )}

          {error && <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
          {result && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Sent to {result.sent} recipient(s){result.failed ? `, ${result.failed} failed` : ""}.
            </div>
          )}

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              disabled={!canSend}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="size-4" /> Review & send
            </button>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-600 text-center">
                Send to <strong>{estRecipients}</strong> recipient(s)?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirm(false)}
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-60"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {sending ? "Sending" : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Campaign history ────────────────────────────────────────────────────────
function CampaignHistory({ campaigns }: { campaigns: Campaign[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (campaigns.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500">
        No campaigns sent yet. Compose your first email to get started.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Recipients</th>
              <th className="px-5 py-3">Delivered</th>
              <th className="px-5 py-3">Opened</th>
              <th className="px-5 py-3">Clicked</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpenId(c.id)}>
                <td className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">{c.subject}</p>
                  <p className="text-[11px] text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600 tabular-nums">{c.total_recipients}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600 tabular-nums">{c.delivered_count}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600 tabular-nums">{c.opened_count}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600 tabular-nums">{c.clicked_count}</td>
                <td className="px-5 py-3.5">
                  <CampaignStatus status={c.status} failed={c.failed_count} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <ChevronRight className="size-4 text-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openId && <CampaignDetail id={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}

function CampaignDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data } = useSWR<{ campaign: Campaign; sends: any[] }>(`/api/admin/mass-email/${id}`, fetcher);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">{data?.campaign?.subject ?? "Loading..."}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data?.campaign?.from_email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="size-4" />
          </button>
        </div>

        {data?.campaign && (
          <div className="grid grid-cols-4 gap-2 p-4 border-b border-gray-100">
            <MiniStat label="Sent" value={data.campaign.sent_count} />
            <MiniStat label="Delivered" value={data.campaign.delivered_count} />
            <MiniStat label="Opened" value={data.campaign.opened_count} />
            <MiniStat label="Clicked" value={data.campaign.clicked_count} />
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.sends ?? []).map((s, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5">
                    <p className="text-sm text-gray-800 truncate max-w-[320px]">{s.email}</p>
                    {s.name && <p className="text-[11px] text-gray-400">{s.name}</p>}
                  </td>
                  <td className="px-4 py-2.5">
                    <RecipientStatus status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Small pieces ─────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  tone: "blue" | "emerald" | "violet" | "amber";
}) {
  const tones: Record<string, string> = {
    blue: "bg-[#3B5BDB]/10 text-[#3B5BDB]",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className={`size-9 rounded-lg flex items-center justify-center mb-3 ${tones[tone]}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function UsageBar({ label, used, limit, remaining }: { label: string; used: number; limit: number; remaining: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const danger = pct >= 90;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Gauge className="size-4 text-gray-400" /> {label}
        </span>
        <span className="text-xs text-gray-500 tabular-nums">
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${danger ? "bg-amber-500" : "bg-[#3B5BDB]"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5">{remaining} remaining</p>
    </div>
  );
}

function SubTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-[#3B5BDB] text-[#3B5BDB]" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-2 rounded-lg bg-gray-50">
      <p className="text-lg font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function CampaignStatus({ status, failed }: { status: string; failed: number }) {
  if (status === "sending")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
        <Loader2 className="size-3 animate-spin" /> Sending
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <Ban className="size-3" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
      <CheckCircle2 className="size-3" /> Sent{failed ? ` · ${failed} failed` : ""}
    </span>
  );
}

function RecipientStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    queued: { label: "Queued", cls: "text-gray-500 bg-gray-100", icon: Clock },
    sent: { label: "Sent", cls: "text-blue-600 bg-blue-50", icon: Send },
    delivered: { label: "Delivered", cls: "text-indigo-600 bg-indigo-50", icon: Mail },
    opened: { label: "Opened", cls: "text-emerald-600 bg-emerald-50", icon: Eye },
    clicked: { label: "Clicked", cls: "text-violet-600 bg-violet-50", icon: MousePointerClick },
    bounced: { label: "Bounced", cls: "text-amber-600 bg-amber-50", icon: AlertTriangle },
    complained: { label: "Complained", cls: "text-red-600 bg-red-50", icon: AlertTriangle },
    failed: { label: "Failed", cls: "text-red-600 bg-red-50", icon: Ban },
  };
  const s = map[status] || map.queued;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.cls}`}>
      <Icon className="size-3" /> {s.label}
    </span>
  );
}
