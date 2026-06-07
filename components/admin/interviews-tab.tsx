"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import {
  Loader2,
  Play,
  X,
  ChevronDown,
  ChevronUp,
  Trophy,
  Briefcase,
  Clock,
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
  const [expanded, setExpanded] = useState<string | null>(null);
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

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3">Candidate</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Score</th>
            <th className="px-6 py-3">Qualified roles</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <Fragment key={r.id}>
                <tr className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{r.candidate_name}</p>
                    <p className="text-xs text-gray-500">{r.email || "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <p>{r.specialization || "—"}</p>
                    <p className="text-xs text-gray-400 capitalize">{r.seniority || ""}</p>
                  </td>
                  <td className="px-6 py-4">
                    {r.overall_score != null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{r.overall_score}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            bandStyles[r.score_band ?? ""] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.score_band || "—"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {r.qualified_roles?.length ? `${r.qualified_roles.length} roles` : "0"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.status === "completed" ? "Completed" : "In progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {r.video_path && (
                        <button
                          onClick={() => setVideoFor(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3B5BDB] hover:underline"
                        >
                          <Play className="size-3.5" /> Video
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                      >
                        Details {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-gray-50/60">
                    <td colSpan={7} className="px-6 py-5">
                      <InterviewDetails interview={r} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {videoFor && <VideoModal interview={videoFor} onClose={() => setVideoFor(null)} />}
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
