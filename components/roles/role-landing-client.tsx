"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, DollarSign, Menu, X } from "lucide-react";
import type { SalaryRow } from "@/lib/salary/scale";
import type { RoleContent } from "@/lib/roles/content";

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
/*  Interest form (inline, not modal)                                  */
/* ------------------------------------------------------------------ */

function InterestForm({ row }: { row: SalaryRow }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
        body: JSON.stringify({ email, name, role_id: row.id }),
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

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
        <CheckCircle2 className="size-8 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">Interest noted</p>
        <p className="text-sm text-gray-600 mt-1">
          We&apos;ll reach out when a {row.shortLabel} role opens that matches your profile.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="form-input w-full"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address *"
        className="form-input w-full"
      />
      {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-11 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60 text-sm"
      >
        {status === "loading" ? "Sending…" : "Express interest"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function RoleLandingClient({
  row,
  content,
}: {
  row: SalaryRow;
  content: RoleContent;
}) {
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 bg-gradient-to-br from-[#1e3a8a] via-[#3B5BDB] to-[#4f6ee8] text-white">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/roles"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="size-4" /> All open roles
          </Link>

          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wide">
                {content.discipline}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4 leading-tight">
                {content.headline}
              </h1>
              <p className="text-lg text-white/80 text-pretty max-w-2xl">
                {content.subheadline}
              </p>
            </div>

            {/* Salary badge */}
            <div className="shrink-0 bg-white/10 border border-white/20 rounded-2xl p-5 text-center min-w-[180px]">
              <div className="flex items-center justify-center gap-1.5 text-xs text-white/60 uppercase tracking-wide mb-2">
                <DollarSign className="size-3.5" /> Monthly USD
              </div>
              <div className="text-2xl font-bold">{fmt(row.usd.junior)}</div>
              <div className="text-white/50 text-xs my-1">to</div>
              <div className="text-2xl font-bold">{fmt(row.usd.senior)}</div>
              <div className="text-xs text-white/60 mt-2">Junior → Senior</div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px] gap-12">

          {/* Left: content */}
          <div className="space-y-10">
            {/* Overview */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this role</h2>
              <p className="text-gray-600 leading-relaxed">{content.description}</p>
            </div>

            {/* Responsibilities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What you will do</h2>
              <ul className="space-y-3">
                {content.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <ChevronRight className="size-4 text-[#3B5BDB] shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What we look for</h2>
              <ul className="space-y-3">
                {content.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <CheckCircle2 className="size-4 text-[#3B5BDB] shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Salary table */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Published salary range</h2>
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#3B5BDB] text-white">
                      <th className="px-5 py-3 text-left font-semibold">Level</th>
                      <th className="px-5 py-3 text-right font-semibold">Monthly USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["junior", "mid", "senior"] as const).map((level, i) => (
                      <tr key={level} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-5 py-3 capitalize font-medium text-gray-900">{level}</td>
                        <td className="px-5 py-3 text-right text-gray-700">{fmt(row.usd[level])}/mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Figures are monthly USD. Rate reflects the local-market price — the same calibre of talent costs significantly more in the Global North.
              </p>
            </div>

            {/* Process */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">How placement works</h2>
              <ol className="space-y-3">
                {[
                  "Submit a full application or express interest below",
                  "Vetting & verification — fewer than 8% of applicants proceed",
                  "Your profile is matched against live company briefs by our AI",
                  "You receive curated opportunities — no cold applications",
                  "DeepTalent handles contracting, compliance, and global payroll",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="flex items-center justify-center size-6 rounded-full bg-[#3B5BDB] text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: sticky sidebar */}
          <aside className="space-y-5">
            <div className="sticky top-28">
              {/* CTA card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
                <h3 className="font-bold text-gray-900 mb-1">Ready to apply?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Submit a full application and our team will match you against live briefs.
                </p>
                <Link
                  href={`/talents/apply?role_id=${row.id}&role_title=${encodeURIComponent(row.label)}&role_category=${encodeURIComponent(content.discipline)}`}
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-full bg-[#3B5BDB] text-white font-semibold text-sm hover:bg-[#2f49b2] transition-colors mb-3"
                >
                  Start application <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/companies/hire"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Hire this role
                </Link>
              </div>

              {/* Express interest card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-1">Not ready to apply?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Leave your email and we&apos;ll notify you when a matching role opens.
                </p>
                <InterestForm row={row} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="bg-gray-900 text-white py-10 px-6 text-center">
        <p className="text-sm text-gray-400">
          &copy; 2026 DeepTalent Platform.{" "}
          <Link href="/roles" className="underline hover:text-white transition-colors">
            View all open roles
          </Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-white transition-colors">
            Privacy
          </Link>
        </p>
      </footer>
    </main>
  );
}
