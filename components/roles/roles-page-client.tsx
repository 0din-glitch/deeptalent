"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, DollarSign, Menu, X } from "lucide-react";
import { SALARY_SCALE, type SalaryRow } from "@/lib/salary/scale";

/* ------------------------------------------------------------------ */
/*  Grouped discipline layout                                           */
/* ------------------------------------------------------------------ */

const GROUPS: { label: string; ids: string[] }[] = [
  {
    label: "Finance & Accounting",
    ids: ["fpa-analyst", "accountant", "credit-analyst"],
  },
  {
    label: "Compliance & Risk",
    ids: ["kyc-aml", "cybersecurity-analyst"],
  },
  {
    label: "Technology & Engineering",
    ids: ["full-stack-developer", "devops-cloud", "ai-prompt-engineer"],
  },
  {
    label: "Data & Analytics",
    ids: ["data-analyst", "bi-analyst"],
  },
  {
    label: "Product & Design",
    ids: ["product-manager", "project-manager", "ux-ui-designer"],
  },
  {
    label: "Operations & Support",
    ids: ["executive-assistant", "customer-service"],
  },
];

function fmt(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

/* ------------------------------------------------------------------ */
/*  Interest form modal                                                 */
/* ------------------------------------------------------------------ */

function InterestModal({
  row,
  onClose,
}: {
  row: SalaryRow;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/roles/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role_id: row.id, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {status === "done" ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="size-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Interest noted</h3>
            <p className="text-gray-600 text-sm">
              We&apos;ve recorded your interest in <strong>{row.shortLabel}</strong>. Our team will be in touch when a matching role opens.
            </p>
            <button
              onClick={onClose}
              className="mt-6 h-11 px-8 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Express interest</h3>
            <p className="text-sm text-gray-500 mb-6">
              Role: <span className="font-semibold text-[#3B5BDB]">{row.label}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interest-name">
                  Your name
                </label>
                <input
                  id="interest-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interest-email">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  id="interest-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interest-message">
                  Anything else? (optional)
                </label>
                <textarea
                  id="interest-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Years of experience, availability, timezone..."
                  className="form-input w-full resize-none"
                />
              </div>

              {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-12 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Submit interest"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Or go straight to the full application —{" "}
              <Link href="/talents/apply" className="underline hover:text-[#3B5BDB]">
                Apply now
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Role card                                                           */
/* ------------------------------------------------------------------ */

function RoleCard({
  row,
  onExpress,
}: {
  row: SalaryRow;
  onExpress: (row: SalaryRow) => void;
}) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-[#3B5BDB]/40 hover:shadow-md transition-all p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{row.label}</h3>
        <Link
          href={`/roles/${row.id}`}
          className="shrink-0 text-[#3B5BDB] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`View ${row.shortLabel} landing page`}
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <DollarSign className="size-3.5 text-[#3B5BDB] shrink-0" />
        <span className="font-medium text-gray-700">{fmt(row.usd.junior)} – {fmt(row.usd.senior)}/mo</span>
        <span className="text-gray-400">· Junior → Senior</span>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onExpress(row)}
          className="flex-1 h-9 rounded-full border border-[#3B5BDB] text-[#3B5BDB] text-xs font-semibold hover:bg-[#3B5BDB]/5 transition-colors"
        >
          Express interest
        </button>
        <Link
          href={`/roles/${row.id}`}
          className="flex-1 h-9 rounded-full bg-[#3B5BDB] text-white text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#2f49b2] transition-colors"
        >
          View role <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Home", href: "/" },
    { label: "For Talents", href: "/talents" },
    { label: "For Companies", href: "/companies" },
    { label: "About Us", href: "/about" },
  ];
  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[90%] max-w-7xl -translate-x-1/2 flex items-center justify-between rounded-2xl p-4 shadow-lg md:px-8 bg-[#3B5BDB]">
      <Link href="/">
        <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-12 w-auto" />
      </Link>
      <div className="hidden md:flex items-center gap-1">
        {links.map((l) => (
          <Link key={l.label} href={l.href} className="px-4 py-2 text-white/75 hover:text-white text-sm font-medium transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="hidden md:inline-flex h-11 px-6 items-center justify-center rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors">
          Login
        </Link>
        <Link href="/talents/apply" className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors">
          Apply Now
        </Link>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl p-6 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export function RolesPageClient() {
  const [interestRow, setInterestRow] = useState<SalaryRow | null>(null);

  const byId = Object.fromEntries(SALARY_SCALE.map((r) => [r.id, r]));

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 bg-gradient-to-br from-[#1e3a8a] via-[#3B5BDB] to-[#4f6ee8] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm text-sm font-medium">
            <span className="flex size-2 rounded-full bg-green-400 animate-pulse" />
            Accepting expressions of interest
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4 leading-tight">
            Open disciplines & salary ranges
          </h1>
          <p className="text-lg text-white/80 text-pretty max-w-xl mx-auto">
            Every role DeepTalent places, with published monthly USD compensation. Click any card to express interest or read the full role brief.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/talents/apply" className="h-12 px-8 rounded-full bg-white text-[#3B5BDB] font-semibold inline-flex items-center gap-2 hover:bg-gray-100 transition-colors">
              Full application <ArrowRight className="size-4" />
            </Link>
            <Link href="/companies/hire" className="h-12 px-8 rounded-full border border-white/30 text-white font-semibold inline-flex items-center gap-2 hover:bg-white/10 transition-colors">
              Hire talent
            </Link>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-white/10 px-6 py-5">
          <div className="text-center px-4">
            <div className="text-2xl font-bold">&lt;8%</div>
            <div className="text-xs text-white/60 mt-1">Acceptance rate</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold">14–21 days</div>
            <div className="text-xs text-white/60 mt-1">Time to placement</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-bold">60-day</div>
            <div className="text-xs text-white/60 mt-1">Free replacement</div>
          </div>
        </div>
      </div>

      {/* Disciplines */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-14">
          {GROUPS.map((group) => {
            const rows = group.ids.map((id) => byId[id]).filter(Boolean);
            return (
              <div key={group.label}>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  {group.label}
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{rows.length} role{rows.length !== 1 ? "s" : ""}</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rows.map((row) => (
                    <RoleCard key={row.id} row={row} onExpress={setInterestRow} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-balance">Ready to apply?</h2>
          <p className="text-gray-600 text-pretty mb-6">Submit a full application and our team will match you against live company briefs using our AI system.</p>
          <Link href="/talents/apply" className="h-12 px-10 rounded-full bg-[#3B5BDB] text-white font-semibold inline-flex items-center gap-2 hover:bg-[#2f49b2] transition-colors">
            Start application <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Modal */}
      {interestRow && (
        <InterestModal row={interestRow} onClose={() => setInterestRow(null)} />
      )}
    </main>
  );
}
