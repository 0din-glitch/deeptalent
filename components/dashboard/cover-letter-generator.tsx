"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Zap,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TONES = [
  { id: "professional", label: "Professional",  desc: "Formal and polished" },
  { id: "confident",    label: "Confident",      desc: "Assertive and direct" },
  { id: "friendly",     label: "Friendly",       desc: "Warm and approachable" },
  { id: "creative",     label: "Creative",       desc: "Bold and unconventional" },
];

const CREDIT_COST = 3;

type LetterOutput = {
  subject: string;
  opening: string;
  body: string[];
  closing: string;
  signoff: string;
  tips: string[];
};

export function CoverLetterGenerator({ profile }: { profile: any }) {
  const { data: creditsData, isLoading: creditsLoading } = useSWR<{ credits: number }>(
    "/api/credits",
    fetcher,
    { refreshInterval: 30_000 }
  );
  const credits = creditsData?.credits ?? 0;

  const [jobTitle, setJobTitle]       = useState("");
  const [company, setCompany]         = useState("");
  const [jobDesc, setJobDesc]         = useState("");
  const [tone, setTone]               = useState("professional");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [result, setResult]           = useState<LetterOutput | null>(null);
  const [copied, setCopied]           = useState(false);
  const [showTips, setShowTips]       = useState(false);

  const fullName = profile?.full_name || "Your Name";
  const canGenerate = credits >= CREDIT_COST && jobTitle.trim() && company.trim() && jobDesc.trim();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, company, jobDescription: jobDesc, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }
      setResult(data.letter);
      mutate("/api/credits");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function buildPlainText(letter: LetterOutput): string {
    return [
      fullName,
      "",
      letter.subject,
      "",
      "Dear Hiring Manager,",
      "",
      letter.opening,
      "",
      ...letter.body.map((p) => p + "\n"),
      letter.closing,
      "",
      letter.signoff,
      fullName,
    ].join("\n");
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(buildPlainText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([buildPlainText(result)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center shrink-0">
            <FileText className="size-5 text-[#6366f1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cover Letter Generator</h1>
            <p className="text-sm text-gray-500">AI-crafted, tailored to each role — ready in seconds.</p>
          </div>
        </div>
        {/* Credits */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 shrink-0">
          <Zap className="size-3.5 text-[#3B5BDB]" />
          <span className="text-xs font-semibold text-gray-700">
            {creditsLoading ? "—" : credits} credits
          </span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-xs text-gray-500">{CREDIT_COST} to generate</span>
        </div>
      </div>

      {!result ? (
        /* ─── Input form ─── */
        <div className="space-y-5">
          {/* Row: Job title + Company */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Company <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                className="form-input w-full"
              />
            </div>
          </div>

          {/* Job description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={7}
              placeholder="Paste the job description here. The more detail you include, the better the letter will be tailored."
              className="form-input w-full resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              {jobDesc.length} / 1500 characters used
            </p>
          </div>

          {/* Tone selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Tone</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`flex flex-col items-start px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                    tone === t.id
                      ? "border-[#6366f1] bg-[#6366f1]/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className={`text-sm font-semibold ${tone === t.id ? "text-[#6366f1]" : "text-gray-800"}`}>
                    {t.label}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile pre-fill notice */}
          {profile?.full_name && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <Check className="size-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your profile details ({profile.full_name}
                {profile.role_category ? `, ${profile.role_category}` : ""}
                {profile.years_experience ? `, ${profile.years_experience} yrs` : ""}) will be automatically woven into the letter.
              </p>
            </div>
          )}

          {/* Insufficient credits warning */}
          {credits < CREDIT_COST && !creditsLoading && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                You need {CREDIT_COST} credits to generate a cover letter. You currently have {credits}.
                Purchase more credits from the Credits widget in the sidebar.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canGenerate && !loading
                ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                : "#e5e7eb",
              color: canGenerate && !loading ? "#fff" : "#9ca3af",
              boxShadow: canGenerate && !loading ? "0 4px 14px #6366f133" : "none",
            }}
          >
            {loading ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your letter...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Cover Letter — {CREDIT_COST} credits
              </>
            )}
          </button>
        </div>
      ) : (
        /* ─── Result view ─── */
        <div className="space-y-5">
          {/* Actions bar */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Check className="size-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Letter ready for <strong>{company}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-all"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-all"
              >
                <Download className="size-3.5" />
                Download
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white bg-[#6366f1] hover:bg-[#4f46e5] transition-all"
              >
                <RotateCcw className="size-3.5" />
                New letter
              </button>
            </div>
          </div>

          {/* Letter card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Letter header */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Subject</p>
              <p className="text-sm font-semibold text-gray-900">{result.subject}</p>
            </div>

            {/* Letter body */}
            <div className="px-6 py-6 space-y-5 font-serif" style={{ fontFamily: "'Georgia', serif", lineHeight: "1.75" }}>
              <div>
                <p className="text-sm text-gray-500 mb-3">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="text-sm text-gray-900 font-sans font-semibold">{fullName}</p>
              </div>

              <p className="text-sm text-gray-600">Dear Hiring Manager,</p>

              <p className="text-sm text-gray-800 leading-relaxed">{result.opening}</p>

              {result.body.map((para, i) => (
                <p key={i} className="text-sm text-gray-800 leading-relaxed">{para}</p>
              ))}

              <p className="text-sm text-gray-800 leading-relaxed">{result.closing}</p>

              <div className="pt-2">
                <p className="text-sm text-gray-700">{result.signoff}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{fullName}</p>
              </div>
            </div>
          </div>

          {/* Personalisation tips */}
          {result.tips?.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 overflow-hidden">
              <button
                onClick={() => setShowTips((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Personalisation tips</span>
                  <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">{result.tips.length}</span>
                </div>
                <ChevronDown className={`size-4 text-amber-600 transition-transform ${showTips ? "rotate-180" : ""}`} />
              </button>
              {showTips && (
                <div className="px-4 pb-4 space-y-2.5">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="size-5 rounded-full bg-amber-200 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-amber-900 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
