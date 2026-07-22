"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Mic,
  Sparkles,
  Zap,
  RotateCcw,
  ChevronDown,
  Target,
  Lightbulb,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Dumbbell,
  X,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COST_QUESTIONS = 3;
const COST_FEEDBACK = 1;

type Question = {
  question: string;
  category: "technical" | "behavioral" | "situational" | "role-specific";
  difficulty: "warm-up" | "core" | "challenging";
  whatTheyWant: string;
  talkingPoints: string[];
  sampleAnswer: string;
};

type Feedback = {
  score: number;
  band: string;
  strengths: string[];
  improvements: string[];
  missingElements: string[];
  starVersion: string;
};

const CATEGORY_STYLES: Record<string, string> = {
  technical: "bg-blue-50 text-blue-700 border-blue-200",
  behavioral: "bg-purple-50 text-purple-700 border-purple-200",
  situational: "bg-amber-50 text-amber-700 border-amber-200",
  "role-specific": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  "warm-up": "bg-gray-100 text-gray-600",
  core: "bg-[#dc2626]/10 text-[#dc2626]",
  challenging: "bg-orange-100 text-orange-700",
};

export function InterviewPrep({ profile }: { profile: any }) {
  const { data: creditsData } = useSWR<{ credits: number }>("/api/credits", fetcher, {
    refreshInterval: 30_000,
  });
  const credits = creditsData?.credits ?? 0;

  const [targetRole, setTargetRole] = useState(profile?.specialization || profile?.role_category || "");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [practiceIdx, setPracticeIdx] = useState<number | null>(null);

  const canGenerate = credits >= COST_QUESTIONS && targetRole.trim().length > 1;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "questions", targetRole, focus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed.");
        return;
      }
      setQuestions(data.questions);
      setOpenIdx(0);
      mutate("/api/credits");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Setup / empty state ────────────────────────────────────────────────
  if (!questions) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="size-12 rounded-2xl bg-[#dc2626]/10 flex items-center justify-center shrink-0">
            <Mic className="size-6 text-[#dc2626]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Prepare for your interview</h3>
            <p className="text-sm text-gray-500 leading-relaxed mt-0.5">
              Generate a tailored question bank based on your profile, then practise your answers and get
              instant AI feedback using the STAR method.
            </p>
          </div>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Role you&apos;re interviewing for <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Target className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="form-input pl-9"
                placeholder="e.g. Senior Frontend Engineer, Product Designer, DevOps Lead"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Areas to focus on <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="form-input"
              placeholder="e.g. System design, leadership, React performance"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Zap className="size-3.5 text-[#dc2626]" />
              <span className="font-semibold text-gray-700">{COST_QUESTIONS} credits</span> · you have {credits}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-semibold text-white bg-[#dc2626] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 4px 14px #dc262635" }}
            >
              {loading ? (
                <>
                  <Sparkles className="size-4 animate-pulse" /> Building your question bank...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate questions
                </>
              )}
            </button>
          </div>
          {credits < COST_QUESTIONS && (
            <p className="text-xs text-amber-600 text-right">
              You need {COST_QUESTIONS} credits. Top up from the credits badge above.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── Question bank ──────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#dc2626]">Question bank</p>
          <h3 className="text-lg font-bold text-gray-900">{questions.length} tailored questions</h3>
        </div>
        <button
          onClick={() => {
            setQuestions(null);
            setError(null);
            setPracticeIdx(null);
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RotateCcw className="size-4" /> New set
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50/60 transition-colors"
              >
                <span className="size-6 shrink-0 rounded-full bg-[#dc2626]/10 text-[#dc2626] text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{q.question}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[q.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {q.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[q.difficulty] || "bg-gray-100 text-gray-600"}`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`size-4 shrink-0 text-gray-400 transition-transform mt-1 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pl-13 space-y-4">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                    <Target className="size-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">What they&apos;re assessing</p>
                      <p className="text-xs text-blue-800/80 mt-0.5 leading-relaxed">{q.whatTheyWant}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                      <Lightbulb className="size-3.5 text-amber-500" /> Hit these points
                    </p>
                    <ul className="space-y-1.5">
                      {q.talkingPoints.map((pt, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="size-3.5 text-[#dc2626]" /> Model answer
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {q.sampleAnswer}
                    </p>
                  </div>

                  <button
                    onClick={() => setPracticeIdx(i)}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold text-[#dc2626] bg-[#dc2626]/8 border border-[#dc2626]/20 hover:bg-[#dc2626]/12 transition-colors"
                  >
                    <Dumbbell className="size-3.5" /> Practise this answer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {practiceIdx !== null && (
        <PracticeModal
          question={questions[practiceIdx].question}
          targetRole={targetRole}
          credits={credits}
          onClose={() => setPracticeIdx(null)}
        />
      )}
    </div>
  );
}

// ─── Practice modal ─────────────────────────────────────────────────────────
function PracticeModal({
  question,
  targetRole,
  credits,
  onClose,
}: {
  question: string;
  targetRole: string;
  credits: number;
  onClose: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit = credits >= COST_FEEDBACK && answer.trim().length >= 10;

  async function handleFeedback() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feedback", question, answer, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Feedback failed.");
        return;
      }
      setFeedback(data.feedback);
      mutate("/api/credits");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    !feedback ? "#dc2626" : feedback.score >= 75 ? "#059669" : feedback.score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-4 text-[#dc2626]" />
            <h3 className="text-sm font-bold text-gray-900">Practice answer</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-900 leading-snug bg-gray-50 rounded-lg p-3 border border-gray-100">
            {question}
          </p>

          {!feedback && (
            <>
              <textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="form-input"
                placeholder="Type your answer here as you would say it in the interview..."
              />
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-[#dc2626]" />
                  <span className="font-semibold text-gray-700">{COST_FEEDBACK} credit</span> for feedback
                </span>
                <button
                  onClick={handleFeedback}
                  disabled={!canSubmit || loading}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold text-white bg-[#dc2626] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Sparkles className="size-4 animate-pulse" /> Analysing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Get feedback
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {feedback && (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="relative size-16 shrink-0">
                  <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="3"
                      strokeDasharray={`${feedback.score}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: scoreColor }}>
                      {feedback.score}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{feedback.band}</p>
                  <p className="text-xs text-gray-500">Answer strength score</p>
                </div>
              </div>

              {feedback.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="size-3.5" /> Strengths
                  </p>
                  <ul className="space-y-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                        <span className="text-emerald-500 mt-0.5">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="size-3.5" /> Improvements
                </p>
                <ul className="space-y-1.5">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                      <span className="text-amber-500 mt-0.5">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {feedback.missingElements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Missing elements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.missingElements.map((m, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* STAR rewrite */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-[#dc2626] flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> STAR-structured rewrite
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(feedback.starVersion);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700"
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed bg-[#dc2626]/[0.03] rounded-lg p-3 border border-[#dc2626]/15">
                  {feedback.starVersion}
                </p>
              </div>

              <button
                onClick={() => {
                  setFeedback(null);
                  setAnswer("");
                }}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="size-4" /> Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
