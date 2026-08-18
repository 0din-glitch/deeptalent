"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Loader2,
  Play,
  X,
  ChevronRight,
  Trophy,
  Briefcase,
  Clock,
  AlertTriangle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type QualifiedRole = {
  id: string;
  label: string;
  seniority: string;
  monthlyUsd: number;
  matchScore: number;
};

type AnswerRow = {
  questionId: string;
  question: string;
  focus?: string | null;
  transcript: string;
  score?: number | null;
  feedback?: string | null;
  classification?: string | null;
};

type Interview = {
  id: string;
  candidate_name: string;
  email: string | null;
  role_category: string | null;
  specialization: string | null;
  seniority: string | null;
  skills: string[] | null;
  years_experience: number | null;
  overall_score: number | null;
  score_band: string | null;
  ai_summary: string | null;
  strengths: string[] | null;
  improvements: string[] | null;
  qualified_roles: QualifiedRole[] | null;
  answers: AnswerRow[] | null;
  video_path: string | null;
  video_duration_seconds: number | null;
  tab_switch_count: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
};

const bandStyles: Record<string, string> = {
  excellent: "bg-green-50 text-green-700",
  strong: "bg-blue-50 text-blue-700",
  promising: "bg-amber-50 text-amber-700",
  developing: "bg-gray-100 text-gray-600",
};

export function InterviewsTab() {
  const { data, isLoading } = useSWR<{ rows: Interview[] }>("/api/admin/interviews", fetcher, {
    refreshInterval: 30_000,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [videoFor, setVideoFor] = useState<Interview | null>(null);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Loading interviews…
      </div>
    );
  }

  const rows = data?.rows ?? [];
  if (rows.length === 0) {
    return <div className="p-12 text-center text-gray-500">No interviews yet.</div>;
  }

  const openInterview = openId ? rows.find((r) => r.id === openId) ?? null : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {rows.map((r) => (
          <li key={r.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(r.id);
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-left focus:outline-none focus:bg-gray-50"
            >
              <div className="size-9 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-sm font-bold flex items-center justify-center shrink-0">
                {(r.candidate_name || r.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-gray-900 truncate">{r.candidate_name}</span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                      r.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {r.status === "completed" ? "Completed" : "In progress"}
                  </span>
                  {r.tab_switch_count != null && r.tab_switch_count > 0 && (
                    <span
                      title={`Switched tabs ${r.tab_switch_count} time(s) during interview`}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0"
                    >
                      <AlertTriangle className="size-3" />
                      {r.tab_switch_count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {r.specialization || "—"}
                  {r.seniority ? ` · ${r.seniority}` : ""} · {r.email || "no email"}
                </div>
              </div>
              {r.overall_score != null && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-base font-bold text-gray-900">{r.overall_score}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full capitalize hidden sm:inline ${
                      bandStyles[r.score_band ?? ""] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.score_band || "—"}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-400 shrink-0 hidden md:block">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
              <ChevronRight className="size-4 text-gray-300 shrink-0" />
            </div>
          </li>
        ))}
      </ul>

      {openInterview && (
        <InterviewDrawer
          interview={openInterview}
          onClose={() => setOpenId(null)}
          onPlayVideo={() => setVideoFor(openInterview)}
        />
      )}
      {videoFor && <VideoModal interview={videoFor} onClose={() => setVideoFor(null)} />}
    </div>
  );
}

function InterviewDrawer({
  interview,
  onClose,
  onPlayVideo,
}: {
  interview: Interview;
  onClose: () => void;
  onPlayVideo: () => void;
}) {
  const r = interview;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <header className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">AI interview</p>
            <h2 className="text-lg font-bold text-gray-900 truncate">{r.candidate_name}</h2>
            <p className="text-xs text-gray-500 truncate">
              {r.specialization || "—"}
              {r.seniority ? ` · ${r.seniority}` : ""} · {r.email || "no email"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {r.video_path && (
              <button
                onClick={onPlayVideo}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6]"
              >
                <Play className="size-3.5" /> Video
              </button>
            )}
            <button onClick={onClose} className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <X className="size-4 text-gray-500" />
            </button>
          </div>
        </header>

        <div className="px-6 py-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            {r.overall_score != null && (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">{r.overall_score}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    bandStyles[r.score_band ?? ""] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.score_band || "—"}
                </span>
              </div>
            )}
            {r.tab_switch_count != null && r.tab_switch_count > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                <AlertTriangle className="size-3" />
                {r.tab_switch_count} tab switch{r.tab_switch_count > 1 ? "es" : ""}
              </span>
            )}
          </div>
          <InterviewDetails interview={r} />
        </div>
      </aside>
    </div>
  );
}

function InterviewDetails({ interview: r }: { interview: Interview }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {r.ai_summary && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
              <Trophy className="size-3.5" /> AI summary
            </h4>
            <p className="text-sm text-gray-700">{r.ai_summary}</p>
          </div>
        )}
        {r.skills && r.skills.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {r.skills.map((s) => (
                <span key={s} className="text-xs bg-[#3B5BDB]/10 text-[#3B5BDB] px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {r.strengths && r.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-green-700 uppercase mb-1.5">Strengths</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                {r.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {r.improvements && r.improvements.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-700 uppercase mb-1.5">Improve</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                {r.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {r.qualified_roles && r.qualified_roles.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
              <Briefcase className="size-3.5" /> Qualified roles
            </h4>
            <div className="space-y-1.5">
              {r.qualified_roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{role.label}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {role.seniority} · {role.matchScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Questions &amp; answers</h4>
        <div className="space-y-3">
          {(r.answers ?? []).map((a, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">{a.question}</p>
                {a.score != null && (
                  <span className="text-xs font-semibold text-[#3B5BDB] shrink-0">{a.score}/100</span>
                )}
              </div>
              <p className="text-sm text-gray-600 italic">
                {a.transcript?.trim() ? `"${a.transcript}"` : "No audible answer."}
              </p>
              {a.feedback && <p className="text-xs text-gray-500 mt-1">{a.feedback}</p>}
            </div>
          ))}
          {(!r.answers || r.answers.length === 0) && (
            <p className="text-sm text-gray-400">No answers recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoModal({ interview, onClose }: { interview: Interview; onClose: () => void }) {
  const { data, isLoading } = useSWR(
    interview.video_path ? ["interview-video", interview.video_path] : null,
    async () => {
      const res = await fetch("/api/admin/file-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "interview-videos", path: interview.video_path }),
      });
      return res.json() as Promise<{ url?: string; error?: string }>;
    },
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">{interview.candidate_name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              {interview.specialization || "Interview"}
              {interview.video_duration_seconds ? (
                <>
                  <Clock className="size-3" />
                  {Math.floor(interview.video_duration_seconds / 60)}m {interview.video_duration_seconds % 60}s
                </>
              ) : null}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="bg-black aspect-video flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="size-6 text-white/70 animate-spin" />
          ) : data?.url ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={data.url} controls autoPlay className="w-full h-full" />
          ) : (
            <p className="text-white/70 text-sm">{data?.error || "Video unavailable."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
