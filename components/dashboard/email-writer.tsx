"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Mail,
  Sparkles,
  Copy,
  Check,
  Zap,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  Send,
  ExternalLink,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CREDIT_COST = 2;

const EMAIL_TYPES = [
  { id: "outreach",    label: "Cold Outreach",   desc: "Reach a recruiter / hiring manager" },
  { id: "followup",    label: "Follow-up",       desc: "After applying or interviewing" },
  { id: "thankyou",    label: "Thank You",       desc: "After an interview" },
  { id: "networking",  label: "Networking",      desc: "Build a relationship / referral" },
  { id: "negotiation", label: "Negotiation",     desc: "Discuss salary or an offer" },
  { id: "intro",       label: "Introduction",    desc: "Intro to a new team / client" },
];

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "warm",         label: "Warm" },
  { id: "direct",       label: "Direct" },
  { id: "enthusiastic", label: "Enthusiastic" },
];

type EmailOutput = {
  subject: string;
  greeting: string;
  body: string[];
  signoff: string;
  tips: string[];
};

export function EmailWriter({ profile }: { profile: any }) {
  const { data: creditsData, isLoading: creditsLoading } = useSWR<{ credits: number }>(
    "/api/credits",
    fetcher,
    { refreshInterval: 30_000 }
  );
  const credits = creditsData?.credits ?? 0;

  const [emailType, setEmailType]     = useState("outreach");
  const [recipientName, setRecipient] = useState("");
  const [recipientEmail, setEmail]    = useState("");
  const [company, setCompany]         = useState("");
  const [context, setContext]         = useState("");
  const [tone, setTone]               = useState("professional");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [result, setResult]           = useState<EmailOutput | null>(null);
  const [copied, setCopied]           = useState(false);
  const [showTips, setShowTips]       = useState(false);

  const fullName = profile?.full_name || "Your Name";
  const canGenerate = credits >= CREDIT_COST && context.trim().length > 5;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools/email-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailType, recipientName, company, context, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }
      setResult(data.email);
      mutate("/api/credits");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function buildBodyText(email: EmailOutput): string {
    return [
      email.greeting,
      "",
      ...email.body.flatMap((p) => [p, ""]),
      email.signoff,
      fullName,
    ].join("\n");
  }

  async function handleCopy() {
    if (!result) return;
    const text = `Subject: ${result.subject}\n\n${buildBodyText(result)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Open Gmail compose window pre-filled with recipient, subject and body
  function openGmail() {
    if (!result) return;
    const url = new URL("https://mail.google.com/mail/");
    url.searchParams.set("view", "cm");
    url.searchParams.set("fs", "1");
    if (recipientEmail) url.searchParams.set("to", recipientEmail);
    url.searchParams.set("su", result.subject);
    url.searchParams.set("body", buildBodyText(result));
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  // Outlook web compose
  function openOutlook() {
    if (!result) return;
    const url = new URL("https://outlook.office.com/mail/deeplink/compose");
    if (recipientEmail) url.searchParams.set("to", recipientEmail);
    url.searchParams.set("subject", result.subject);
    url.searchParams.set("body", buildBodyText(result));
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  // Default mail client via mailto:
  function openMailto() {
    if (!result) return;
    const params = new URLSearchParams({
      subject: result.subject,
      body: buildBodyText(result),
    });
    window.location.href = `mailto:${recipientEmail}?${params.toString()}`;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-[#059669]/10 flex items-center justify-center shrink-0">
            <Mail className="size-5 text-[#059669]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Email Writer</h1>
            <p className="text-sm text-gray-500">Draft outreach &amp; follow-ups, then send straight from Gmail.</p>
          </div>
        </div>
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
          {/* Email type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Email type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {EMAIL_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEmailType(t.id)}
                  className={`flex flex-col items-start px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                    emailType === t.id
                      ? "border-[#059669] bg-[#059669]/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className={`text-sm font-semibold ${emailType === t.id ? "text-[#059669]" : "text-gray-800"}`}>
                    {t.label}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recipient name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Recipient email <span className="text-gray-400 font-normal">(to auto-fill Gmail)</span>
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                className="form-input w-full"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company / organisation</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="form-input w-full"
            />
          </div>

          {/* Context */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              What&apos;s the email about? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={5}
              placeholder="e.g. Following up on the Senior Backend role I applied for last week. I'd love to reiterate my interest and share that I recently shipped a similar payments system."
              className="form-input w-full resize-none"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3.5 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    tone === t.id
                      ? "border-[#059669] bg-[#059669]/5 text-[#059669]"
                      : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {profile?.full_name && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <Check className="size-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                Signed as <strong>{profile.full_name}</strong>
                {profile.role_category ? `, ${profile.role_category}` : ""}. Your background is used to make the email specific.
              </p>
            </div>
          )}

          {credits < CREDIT_COST && !creditsLoading && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                You need {CREDIT_COST} credits to draft an email. You currently have {credits}. Purchase more from the Credits widget in the sidebar.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
            style={{
              background: canGenerate && !loading ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "#e5e7eb",
              color: canGenerate && !loading ? "#fff" : "#9ca3af",
              boxShadow: canGenerate && !loading ? "0 4px 14px #05966933" : "none",
            }}
          >
            {loading ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Drafting your email...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Draft Email — {CREDIT_COST} credits
              </>
            )}
          </button>
        </div>
      ) : (
        /* ─── Result view ─── */
        <div className="space-y-5">
          {/* Send actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Check className="size-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Your email is ready</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-all"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-all"
              >
                <RotateCcw className="size-3.5" />
                New email
              </button>
            </div>
          </div>

          {/* Primary CTA: Gmail */}
          <div className="grid sm:grid-cols-3 gap-2.5">
            <button
              onClick={openGmail}
              className="sm:col-span-3 inline-flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #ea4335 0%, #c5221f 100%)", boxShadow: "0 4px 14px #ea433533" }}
            >
              <Send className="size-4" />
              Send with Gmail
              <ExternalLink className="size-3.5 opacity-80" />
            </button>
            <button
              onClick={openOutlook}
              className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold text-[#0078d4] bg-[#0078d4]/8 border border-[#0078d4]/20 hover:bg-[#0078d4]/12 transition-all"
            >
              Outlook
              <ExternalLink className="size-3.5" />
            </button>
            <button
              onClick={openMailto}
              className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-all"
            >
              Default mail app
              <ExternalLink className="size-3.5" />
            </button>
            <div className="hidden sm:block" />
          </div>

          {!recipientEmail && (
            <p className="text-[11px] text-gray-400 -mt-2 text-center">
              Tip: add a recipient email next time to auto-fill the “To” field. You can still paste it in Gmail.
            </p>
          )}

          {/* Email preview */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 space-y-1.5">
              {recipientEmail && (
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-14 shrink-0">To</span>
                  <span className="text-gray-900 font-medium">{recipientEmail}</span>
                </div>
              )}
              <div className="flex gap-2 text-sm">
                <span className="text-gray-400 w-14 shrink-0">Subject</span>
                <span className="text-gray-900 font-semibold">{result.subject}</span>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4 leading-relaxed">
              <p className="text-sm text-gray-800">{result.greeting}</p>
              {result.body.map((para, i) => (
                <p key={i} className="text-sm text-gray-800 leading-relaxed">{para}</p>
              ))}
              <div className="pt-1">
                <p className="text-sm text-gray-700">{result.signoff}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{fullName}</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 overflow-hidden">
              <button
                onClick={() => setShowTips((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Tips to boost your reply rate</span>
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
