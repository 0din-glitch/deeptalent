"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { OpenRoles } from "@/components/talents/open-roles";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

function ApplyLanding() {
  const searchParams = useSearchParams();
  // Forward any role context to the form page so prefill keeps working.
  const formHref = (() => {
    const params = new URLSearchParams();
    for (const k of ["role_id", "role_title", "role_category", "company"]) {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/talents/apply/form?${qs}` : "/talents/apply/form";
  })();

  return (
    <main className="bg-white min-h-screen">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-8 w-auto" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3B5BDB] transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <div className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-end mb-12">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wide mb-4">
                <Sparkles className="size-3.5" /> For Talent
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-balance leading-[1.05]">
                Apply to join the top 3% of DeepTalent.
              </h1>
              <p className="text-gray-600 mt-4 text-lg text-pretty max-w-xl">
                Browse open roles from vetted companies and submit your application — all in one place. Tell us your seniority level and we&apos;ll match you to the right opportunities.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={formHref}
                  className="h-12 px-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
                >
                  Start application <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Quick-glance stat tiles */}
            <div className="grid grid-cols-3 gap-3">
              <Stat n="3%" label="Acceptance rate" />
              <Stat n="15+" label="Roles supported" />
              <Stat n="50%" label="Up to, below onshore" />
            </div>
          </div>

          {/* Open roles */}
          <div className="mb-16">
            <OpenRoles />
          </div>

          {/* Final CTA */}
          <div className="rounded-3xl bg-gradient-to-br from-[#3B5BDB] to-[#2f49b2] p-8 md:p-12 text-white text-center shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-balance">Ready to apply?</h3>
            <p className="text-white/80 mt-2 text-pretty max-w-lg mx-auto">
              Four short steps. Saved automatically as you go. Most applicants finish in under five minutes.
            </p>
            <Link
              href={formHref}
              className="mt-6 h-12 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#3B5BDB] font-semibold hover:bg-gray-50 transition-colors"
            >
              Start application <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 text-center">
      <div className="text-2xl md:text-3xl font-bold text-[#3B5BDB] leading-none">{n}</div>
      <div className="text-[11px] text-gray-500 mt-1.5 leading-tight">{label}</div>
    </div>
  );
}

export default function TalentApplyLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ApplyLanding />
    </Suspense>
  );
}
