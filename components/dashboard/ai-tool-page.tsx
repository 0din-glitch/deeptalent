"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Construction,
  FileText,
  Mail,
  Linkedin,
  Mic,
  Plus,
  Loader2,
} from "lucide-react";
import { CREDIT_PACKAGES, packageTotalCredits, type CreditPackage } from "@/lib/credits/packages";

// Per-tool credit cost
export const TOOL_COSTS: Record<string, number> = {
  coverLetter: 3,
  resumeBuilder: 2,
  linkedinReview: 4,
  emailWriter: 2,
  interviewPrep: 3,
};

const TOOL_META: Record<string, { icon: React.ElementType; color: string; label: string; desc: string }> = {
  coverLetter:    { icon: FileText,    color: "#6366f1", label: "Cover Letter Generator",  desc: "AI-crafted cover letters tailored to each role." },
  resumeBuilder:  { icon: FileText,    color: "#3B5BDB", label: "AI Resume Builder",        desc: "Build a polished resume from your profile in seconds." },
  linkedinReview: { icon: Linkedin,    color: "#0a66c2", label: "LinkedIn Profile Review",  desc: "Get actionable AI feedback on your LinkedIn profile." },
  emailWriter:    { icon: Mail,        color: "#059669", label: "Email Writer",             desc: "Draft professional outreach and follow-up emails." },
  interviewPrep:  { icon: Mic,         color: "#dc2626", label: "Interview Prep",           desc: "Role-specific Q&A, STAR stories, and mock sessions." },
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Credits display bubble ─────────────────────────────────────────────────
export function CreditsBadge() {
  const { data } = useSWR<{ credits: number }>("/api/credits", fetcher, { refreshInterval: 30_000 });
  const [showPurchase, setShowPurchase] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const credits = data?.credits;
  const low = typeof credits === "number" && credits < 5;

  // When returning from Stripe Checkout, verify the session and grant credits once.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("credits_session");
    if (!sessionId) return;

    setVerifying(true);
    fetch("/api/credits/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then(() => mutate("/api/credits"))
      .finally(() => {
        setVerifying(false);
        // Clean the query params so a refresh doesn't re-trigger
        params.delete("credits_session");
        params.delete("credits_cancelled");
        const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
        window.history.replaceState({}, "", clean);
      });
  }, []);

  return (
    <>
      {showPurchase && <PurchaseModal onClose={() => setShowPurchase(false)} />}
      <button
        onClick={() => setShowPurchase(true)}
        title="Buy more AI credits"
        className={`group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border transition-all ${
          low
            ? "bg-amber-50 border-amber-200 hover:border-amber-300"
            : "bg-[#3B5BDB]/8 border-[#3B5BDB]/15 hover:border-[#3B5BDB]/30"
        }`}
      >
        <Zap className={`size-3.5 ${low ? "text-amber-500" : "text-[#3B5BDB]"} ${verifying ? "animate-pulse" : ""}`} />
        <span className={`text-xs font-bold tabular-nums ${low ? "text-amber-700" : "text-[#3B5BDB]"}`}>
          {verifying ? "…" : credits ?? "—"}
        </span>
        <span className={`text-[10px] font-medium ${low ? "text-amber-600/70" : "text-[#3B5BDB]/60"}`}>credits</span>
        <span
          className={`ml-0.5 grid place-items-center size-5 rounded-full transition-colors ${
            low ? "bg-amber-500 text-white" : "bg-[#3B5BDB] text-white group-hover:bg-[#2f49b2]"
          }`}
        >
          <Plus className="size-3" />
        </span>
      </button>
    </>
  );
}

// ─── Purchase modal (real Stripe Checkout) ──────────────────────────────────
export function PurchaseModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase(pkg: CreditPackage) {
    setLoading(pkg.id);
    setError(null);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout.");
        setLoading(null);
        return;
      }
      // Redirect to Stripe hosted checkout
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center">
            <Zap className="size-5 text-[#3B5BDB]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Buy AI Credits</h3>
            <p className="text-xs text-gray-500">One balance, used across every AI tool</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        )}

        <div className="space-y-3">
          {CREDIT_PACKAGES.map((pkg) => {
            const total = packageTotalCredits(pkg);
            const price = pkg.priceInCents / 100;
            return (
              <button
                key={pkg.id}
                onClick={() => handlePurchase(pkg)}
                disabled={!!loading}
                className={`relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                  pkg.popular ? "border-[#3B5BDB] bg-[#3B5BDB]/[0.03]" : "border-gray-100 hover:border-gray-200"
                } disabled:opacity-60`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center ${
                      pkg.popular ? "bg-[#3B5BDB] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {loading === pkg.id ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {pkg.label}
                      {pkg.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#3B5BDB] bg-[#3B5BDB]/10 px-1.5 py-0.5 rounded">
                          Best value
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {total} credits{pkg.bonus ? <span className="text-emerald-600 font-medium"> · +{pkg.bonus} bonus</span> : null}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${price.toFixed(2)}</p>
                  <p className="text-[11px] text-gray-400">${(price / total).toFixed(2)}/credit</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
          <Lock className="size-3" /> Secure checkout by Stripe · Credits never expire
        </p>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Under-construction animated page ─────────────────────────────────────
export function AIToolUnderConstruction({ toolId }: { toolId: string }) {
  const [showPurchase, setShowPurchase] = useState(false);
  const { data } = useSWR<{ credits: number }>("/api/credits", fetcher, { refreshInterval: 30_000 });
  const credits = data?.credits ?? 0;
  const cost = TOOL_COSTS[toolId] ?? 2;
  const meta = TOOL_META[toolId];
  const Icon = meta?.icon ?? Sparkles;

  return (
    <>
      {showPurchase && <PurchaseModal onClose={() => setShowPurchase(false)} />}

      <div className="flex flex-col items-center justify-center min-h-[480px] px-6 py-12 text-center select-none">
        {/* Animated rings */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 rounded-full opacity-20 animate-ping"
            style={{ background: meta?.color ?? "#3B5BDB", animationDuration: "2.5s" }}
          />
          <div
            className="absolute -inset-3 rounded-full opacity-10 animate-ping"
            style={{ background: meta?.color ?? "#3B5BDB", animationDuration: "3.5s", animationDelay: "0.5s" }}
          />
          <div
            className="relative size-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: `${meta?.color ?? "#3B5BDB"}18` }}
          >
            <Icon className="size-9" style={{ color: meta?.color ?? "#3B5BDB" }} />
          </div>
        </div>

        {/* Labels */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 mb-4">
          <Construction className="size-3 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Coming Soon</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">
          {meta?.label ?? "AI Tool"}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-8">
          {meta?.desc} This tool is currently being built and will be available shortly.
        </p>

        {/* Animated progress bar */}
        <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full rounded-full animate-pulse"
            style={{
              background: `linear-gradient(90deg, ${meta?.color ?? "#3B5BDB"}, ${meta?.color ?? "#3B5BDB"}80)`,
              width: "60%",
            }}
          />
        </div>

        {/* Credits widget */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-1.5">
              <Zap className="size-4 text-[#3B5BDB]" />
              <span className="text-sm font-bold text-gray-900">{credits}</span>
              <span className="text-xs text-gray-500">credits available</span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{cost} credits</span> to use this tool
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowPurchase(true)}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: meta?.color ?? "#3B5BDB", boxShadow: `0 4px 14px ${meta?.color ?? "#3B5BDB"}35` }}
          >
            <Zap className="size-4" />
            Buy credits
          </button>
        </div>

        {/* Feature bullets */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
          {(meta?.label === "Cover Letter Generator"
            ? ["Tailored to each job description", "ATS-friendly format", "One-click generation"]
            : meta?.label === "LinkedIn Profile Review"
            ? ["Headline & summary audit", "Skills gap analysis", "Recruiter-view tips"]
            : meta?.label === "Email Writer"
            ? ["Cold outreach templates", "Follow-up sequences", "Professional tone"]
            : meta?.label === "Interview Prep"
            ? ["Role-specific question bank", "STAR method coaching", "Mock answer feedback"]
            : ["AI-powered generation", "Instant results", "Professional quality"]
          ).map((bullet) => (
            <div key={bullet} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="size-3.5 mt-0.5 shrink-0" style={{ color: meta?.color ?? "#3B5BDB" }} />
              <span className="text-xs text-gray-600 leading-snug">{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
