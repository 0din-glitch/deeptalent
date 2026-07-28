"use client";

import { useState, useRef } from "react";
import useSWR, { mutate } from "swr";
import {
  Linkedin,
  Sparkles,
  Zap,
  AlertCircle,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  TrendingUp,
  Star,
  Lightbulb,
  Shield,
  User,
  Briefcase,
  BookOpen,
  ImagePlus,
  X,
  Camera,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const CREDIT_COST = 4;
const MAX_SCREENSHOTS = 3;

type ReviewOutput = {
  overall_score: number;
  headline: { score: number; feedback: string; rewrite: string };
  about: { score: number; feedback: string; rewrite: string };
  experience: { score: number; feedback: string; top_tips: string[] };
  skills: { score: number; feedback: string; missing_skills: string[] };
  visual_presence?: { score: number; feedback: string; issues: string[] };
  recruiter_view: { first_impression: string; ats_score: number; quick_wins: string[] };
  summary: string;
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : score >= 6
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      <Star className="size-3" /> {score}/10
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = score >= 8 ? "#10b981" : score >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative size-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{score}</p>
        <p className="text-[10px] text-gray-400 font-medium">/ 10</p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0a66c2] hover:text-[#004182] transition-colors"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy rewrite"}
    </button>
  );
}

function SectionCard({
  icon: Icon,
  title,
  score,
  feedback,
  rewrite,
  bullets,
  bulletLabel,
}: {
  icon: React.ElementType;
  title: string;
  score: number;
  feedback: string;
  rewrite?: string;
  bullets?: string[];
  bulletLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#0a66c2]/8 flex items-center justify-center">
            <Icon className="size-4 text-[#0a66c2]" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={score} />
          <ChevronDown className={`size-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>

          {rewrite && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#0a66c2] uppercase tracking-wide">AI Rewrite</span>
                <CopyButton text={rewrite} />
              </div>
              <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{rewrite}&rdquo;</p>
            </div>
          )}

          {bullets && bullets.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{bulletLabel}</p>
              <ul className="space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="size-5 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Reads a File as a base64 data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function LinkedInReview({ profile }: { profile: any }) {
  const { data: creditsData } = useSWR<{ credits: number }>("/api/credits", fetcher, {
    refreshInterval: 30_000,
  });
  const credits = creditsData?.credits ?? 0;

  const [url, setUrl] = useState("");
  const [manual, setManual] = useState(false);
  const [manualNotice, setManualNotice] = useState<string | null>(null);

  const [headline, setHeadline] = useState(profile?.headline || "");
  const [about, setAbout] = useState(profile?.bio || "");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState(profile?.skills || "");
  const [targetRole, setTargetRole] = useState(profile?.specialization || "");

  // Screenshot upload state
  const [screenshots, setScreenshots] = useState<{ file: File; dataUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewOutput | null>(null);

  const hasScreenshots = screenshots.length > 0;
  const canReview =
    credits >= CREDIT_COST &&
    (hasScreenshots ||
      (manual ? headline.trim() || about.trim() : url.trim().length > 3));

  async function handleScreenshotAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_SCREENSHOTS - screenshots.length;
    const toAdd = files.slice(0, remaining);
    const loaded = await Promise.all(
      toAdd.map(async (file) => ({ file, dataUrl: await fileToDataUrl(file) }))
    );
    setScreenshots((prev) => [...prev, ...loaded]);
    // Reset input so same file can be re-added if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeScreenshot(idx: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleReview() {
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, any> = { target_role: targetRole };

      if (hasScreenshots) {
        payload.screenshots = screenshots.map((s) => s.dataUrl);
        // Also include any text they filled in
        if (headline.trim()) payload.headline = headline;
        if (about.trim()) payload.about = about;
        if (experience.trim()) payload.experience = experience;
        if (skills.trim()) payload.skills = skills;
      } else if (manual) {
        payload.headline = headline;
        payload.about = about;
        payload.experience = experience;
        payload.skills = skills;
      } else {
        payload.url = url;
      }

      const res = await fetch("/api/tools/linkedin-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.needsManual) {
        setManual(true);
        setManualNotice(
          data.message ||
            "We couldn't read that page. Paste your details below — or upload screenshots of your profile."
        );
        return;
      }

      if (!res.ok) {
        setError(data.error || "Generation failed.");
        return;
      }
      setResult(data.review);
      mutate("/api/credits");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-[#0a66c2]/10 flex items-center justify-center">
            <Linkedin className="size-6 text-[#0a66c2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">LinkedIn Profile Review</h2>
            <p className="text-sm text-gray-500">
              AI-powered audit — paste a URL, enter details, or upload screenshots.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a66c2]/8 border border-[#0a66c2]/20 shrink-0">
          <Zap className="size-3.5 text-[#0a66c2]" />
          <span className="text-xs font-semibold text-[#0a66c2]">{credits} credits</span>
        </div>
      </div>

      {!result ? (
        <div className="space-y-4">
          {/* Target role */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Target role / job title{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="form-input"
              placeholder="e.g. Senior Backend Engineer, FP&A Analyst, Data Scientist"
            />
          </div>

          {/* Screenshot upload — always visible */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Upload screenshots{" "}
                <span className="text-gray-400 font-normal">(up to {MAX_SCREENSHOTS}, optional)</span>
              </label>
              {screenshots.length < MAX_SCREENSHOTS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a66c2] hover:text-[#004182] transition-colors"
                >
                  <ImagePlus className="size-3.5" /> Add image
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleScreenshotAdd}
            />

            {screenshots.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {screenshots.map((s, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.dataUrl}
                      alt={`Screenshot ${i + 1}`}
                      className="h-24 w-36 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => removeScreenshot(i)}
                      className="absolute -top-1.5 -right-1.5 size-5 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="size-3 text-gray-500" />
                    </button>
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-white bg-black/50 rounded px-1">
                      {i + 1}/{MAX_SCREENSHOTS}
                    </span>
                  </div>
                ))}
                {screenshots.length < MAX_SCREENSHOTS && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-36 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#0a66c2]/40 hover:text-[#0a66c2] transition-colors"
                  >
                    <Camera className="size-5" />
                    <span className="text-[11px] font-medium">Add more</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:border-[#0a66c2]/40 hover:text-[#0a66c2] transition-colors"
              >
                <Camera className="size-5" />
                <span className="text-sm font-medium">
                  Click to upload profile screenshots (PNG, JPG, WebP)
                </span>
              </button>
            )}

            {hasScreenshots && (
              <p className="text-xs text-gray-400 mt-1.5">
                Screenshots will be analysed visually by AI — profile photo, banner, layout, and overall
                presentation.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {hasScreenshots ? "Add text details too (optional)" : "Or review by URL / text"}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* URL mode */}
          {!manual && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Profile URL
              </label>
              <div className="relative">
                <Linkedin className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input pl-9"
                  placeholder="https://linkedin.com/in/you  ·  or your portfolio / personal site"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                We&apos;ll read the page automatically. LinkedIn often blocks scraping — if it fails we&apos;ll ask
                you to paste details or use screenshots instead.
              </p>
              <button
                type="button"
                onClick={() => {
                  setManual(true);
                  setManualNotice(null);
                }}
                className="text-xs font-semibold text-[#0a66c2] hover:text-[#004182] transition-colors mt-2"
              >
                Or paste my profile details manually
              </button>
            </div>
          )}

          {/* Manual mode */}
          {manual && (
            <>
              {manualNotice && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  {manualNotice}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  LinkedIn Headline
                </label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="form-input"
                  placeholder='e.g. "Senior DevOps Engineer | AWS | Kubernetes | Helping startups ship faster"'
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">About section</label>
                <textarea
                  rows={5}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="form-input"
                  placeholder="Paste your LinkedIn About / Summary section here..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Experience highlights{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="form-input"
                  placeholder="Paste your top 2–3 job descriptions or bullet points..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Skills <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Python, React, AWS, Financial Modelling..."
                />
              </div>

              <button
                type="button"
                onClick={() => setManual(false)}
                className="text-xs font-semibold text-[#0a66c2] hover:text-[#004182] transition-colors"
              >
                ← Back to reviewing by URL
              </button>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="size-4 text-[#0a66c2]" />
              <span>
                Costs <strong className="text-gray-900">{CREDIT_COST} credits</strong> — you have {credits}
              </span>
            </div>
            <button
              onClick={handleReview}
              disabled={!canReview || loading}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Sparkles className="size-4 animate-pulse" />
                  {hasScreenshots ? "Analysing images..." : manual ? "Analysing..." : "Reading page..."}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Review my profile
                </>
              )}
            </button>
          </div>

          {credits < CREDIT_COST && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              You need {CREDIT_COST} credits to run a review. Buy credits from the credits badge in the sidebar.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Overall score */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={result.overall_score} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Overall LinkedIn Score
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">{result.summary}</p>
            </div>
          </div>

          {/* ATS & quick wins */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="size-4 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-900">Recruiter first impression</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{result.recruiter_view.first_impression}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">ATS score:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    result.recruiter_view.ats_score >= 8
                      ? "bg-emerald-50 text-emerald-700"
                      : result.recruiter_view.ats_score >= 6
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {result.recruiter_view.ats_score}/10
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="size-4 text-[#0a66c2]" />
                <span className="text-sm font-semibold text-gray-900">Quick wins</span>
              </div>
              <ul className="space-y-1.5">
                {result.recruiter_view.quick_wins.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section breakdown */}
          <div className="space-y-2">
            <SectionCard
              icon={User}
              title="Headline"
              score={result.headline.score}
              feedback={result.headline.feedback}
              rewrite={result.headline.rewrite}
            />
            <SectionCard
              icon={BookOpen}
              title="About / Summary"
              score={result.about.score}
              feedback={result.about.feedback}
              rewrite={result.about.rewrite}
            />
            <SectionCard
              icon={Briefcase}
              title="Experience"
              score={result.experience.score}
              feedback={result.experience.feedback}
              bullets={result.experience.top_tips}
              bulletLabel="Top tips to improve your experience section"
            />
            <SectionCard
              icon={Star}
              title="Skills"
              score={result.skills.score}
              feedback={result.skills.feedback}
              bullets={result.skills.missing_skills}
              bulletLabel="Skills worth adding"
            />
            {result.visual_presence && (
              <SectionCard
                icon={Camera}
                title="Visual Presence (Photo, Banner, Layout)"
                score={result.visual_presence.score}
                feedback={result.visual_presence.feedback}
                bullets={result.visual_presence.issues}
                bulletLabel="Visual issues to fix"
              />
            )}
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setResult(null);
              setUrl("");
              setManualNotice(null);
              setScreenshots([]);
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="size-4" /> Review a different profile
          </button>
        </div>
      )}
    </div>
  );
}
