"use client";

import useSWR from "swr";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Globe2,
  Building2,
  Code2,
  LineChart,
  PenTool,
  Megaphone,
  Headphones,
  Cpu,
  X,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

type ExternalJob = {
  id: string;
  company: string;
  title: string;
  category: string | null;
  location: string | null;
  remote: boolean;
  url: string;
  source: string;
  posted_at: string;
  tags: string[];
  salary: string | null;
};

type Alternative = {
  matchedRole: { id: string; label: string } | null;
  inNetworkCount: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* Per-category icon + accent, mirroring the New Startups card palette. */
const CATEGORY_STYLE: Record<string, { icon: typeof Code2; color: string }> = {
  Engineering: { icon: Code2, color: "#7C3AED" },
  Design: { icon: PenTool, color: "#EA580C" },
  Product: { icon: Cpu, color: "#3B5BDB" },
  Marketing: { icon: Megaphone, color: "#EF4444" },
  Sales: { icon: LineChart, color: "#0EA5E9" },
  Finance: { icon: LineChart, color: "#059669" },
  Operations: { icon: Headphones, color: "#CA8A04" },
};
function styleFor(category: string | null, i: number) {
  if (category && CATEGORY_STYLE[category]) return CATEGORY_STYLE[category];
  const fallback = [
    { icon: Building2, color: "#3B5BDB" },
    { icon: Code2, color: "#7C3AED" },
    { icon: LineChart, color: "#0EA5E9" },
    { icon: Cpu, color: "#059669" },
  ];
  return fallback[i % fallback.length];
}

export function ExternalRoles({ limit = 12, bare = false }: { limit?: number; bare?: boolean }) {
  const { data, isLoading } = useSWR<{ jobs: ExternalJob[] }>(
    "/api/public/external-jobs",
    fetcher,
    { revalidateOnFocus: false }
  );
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<ExternalJob | null>(null);
  const [alt, setAlt] = useState<Alternative | null>(null);
  const [altLoading, setAltLoading] = useState(false);

  const jobs = (data?.jobs || []).slice(0, limit);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(jobs.length / perPage));
  const paginate = (dir: number) => setPage((p) => (p + dir + totalPages) % totalPages);

  // Open the "before you go" modal, record the outbound application, and fetch
  // the in-network alternative to surface to the user. The external listing is
  // opened only after the user chooses to continue.
  async function handleApply(job: ExternalJob) {
    setActive(job);
    setAlt(null);
    setAltLoading(true);
    try {
      const res = await fetch("/api/public/external-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalJobId: job.id,
          title: job.title,
          company: job.company,
          source: job.source,
          url: job.url,
          location: job.location,
          category: job.category,
          salary: job.salary,
        }),
      });
      const json = await res.json();
      setAlt({
        matchedRole: json.matchedRole ?? null,
        inNetworkCount: json.inNetworkCount ?? 0,
      });
    } catch {
      setAlt({ matchedRole: null, inNetworkCount: 0 });
    } finally {
      setAltLoading(false);
    }
  }

  function continueToExternal() {
    if (active?.url) window.open(active.url, "_blank", "noopener,noreferrer");
    setActive(null);
  }

  const pageJobs = jobs.slice(page * perPage, page * perPage + perPage);

  const Wrapper = bare ? "div" : "section";

  return (
    <Wrapper
      id="external-roles"
      className={bare ? "scroll-mt-24" : "scroll-mt-24 py-16 lg:py-24 bg-white"}
    >
      <div
        className={`grid lg:grid-cols-[300px_1fr] gap-10 items-start ${
          bare ? "" : "max-w-7xl mx-auto px-6"
        }`}
      >
        {/* Left heading — mirrors New Startups */}
        <div className="lg:sticky lg:top-28">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/5 text-gray-600 text-xs font-semibold uppercase tracking-wide mb-4">
            <Globe2 className="size-3.5" /> Outside DeepTalent
          </span>
          <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[0.95] mb-5">
            Beyond<br />the Network
          </h2>
          <p className="text-gray-500 leading-relaxed max-w-xs mb-8 text-pretty">
            Live roles aggregated from public job boards. Explore opportunities across the web — and
            see the in-network alternative before you apply.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous roles"
              className="grid size-10 place-items-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-colors"
            >
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next roles"
              className="grid size-12 place-items-center rounded-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-3xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <Globe2 className="size-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No external roles available right now. Check back soon.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {pageJobs.map((job, i) => {
                const st = styleFor(job.category, i);
                const dark = (page * perPage + i) % 6 === 3;
                const Icon = st.icon;
                return (
                  <button
                    key={job.id}
                    onClick={() => handleApply(job)}
                    className={`text-left rounded-3xl p-6 flex flex-col transition-shadow hover:shadow-lg ${
                      dark ? "bg-gray-950 text-white" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className="grid size-11 place-items-center rounded-full"
                        style={{ backgroundColor: dark ? "#ffffff" : st.color + "1A" }}
                      >
                        <Icon className="size-5" style={{ color: st.color }} />
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          dark ? "bg-white/10 text-white/70" : "bg-white text-gray-500 border border-gray-200"
                        }`}
                      >
                        {job.source}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1.5 line-clamp-2 leading-snug">{job.title}</h3>
                    <p className={`text-sm mb-6 flex-1 inline-flex items-center gap-1.5 ${dark ? "text-white/60" : "text-gray-500"}`}>
                      <Building2 className="size-3.5 shrink-0" /> {job.company}
                    </p>
                    <div className={`flex items-center gap-4 text-xs font-medium ${dark ? "text-white/70" : "text-gray-500"}`}>
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness className="size-3.5" /> {job.remote ? "Remote" : "On-site"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <Globe2 className="size-3.5 shrink-0" /> <span className="truncate">{job.location || "Global"}</span>
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* In-network CTA card — mirrors the "Explore all" card */}
              <a
                href="/hire"
                className="rounded-3xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-gray-900 transition-colors group"
              >
                <p className="text-4xl font-extrabold text-gray-900">{jobs.length}+</p>
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-600 group-hover:text-[#3B5BDB]">
                  Hire in-network instead <ArrowRight className="size-4" />
                </p>
              </a>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Before-you-go modal: records the application + shows the in-network
          alternative. Deliberately shows NO salary amounts — only the role
          match, available talent, and the up-to-30%-below-market message. */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[9999] grid place-items-center p-4 bg-gray-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold">
                  <Sparkles className="size-3.5" /> In-network alternative
                </span>
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {altLoading ? (
                <div className="py-8 space-y-3">
                  <div className="h-5 w-2/3 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
                </div>
              ) : alt?.matchedRole ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 text-balance">
                    Hire a vetted {alt.matchedRole.label} in-network
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 text-pretty">
                    Before applying to <span className="font-medium text-gray-700">{active.title}</span> at{" "}
                    {active.company}, consider DeepTalent&apos;s pre-vetted specialists — typically{" "}
                    <span className="font-semibold text-gray-900">up to 30% below the market rate</span> for
                    this role, with no cold applications.
                  </p>
                  <div className="rounded-2xl bg-gray-50 p-4 mb-5 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                      <CheckCircle2 className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {alt.inNetworkCount > 0
                          ? `${alt.inNetworkCount} vetted ${alt.inNetworkCount === 1 ? "specialist" : "specialists"} available`
                          : "Vetted specialists on request"}
                      </p>
                      <p className="text-xs text-gray-500">Matched to {alt.matchedRole.label}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a
                      href="/hire"
                      className="h-11 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold grid place-items-center hover:bg-[#2f49b0] transition-colors"
                    >
                      Explore in-network talent
                    </a>
                    <button
                      onClick={continueToExternal}
                      className="h-11 rounded-full border border-gray-200 text-gray-600 text-sm font-medium inline-flex items-center justify-center gap-1.5 hover:border-gray-900 hover:text-gray-900 transition-colors"
                    >
                      Continue to {active.source} <ExternalLink className="size-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 text-balance">
                    Opening {active.company}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 text-pretty">
                    We don&apos;t have a direct in-network match for{" "}
                    <span className="font-medium text-gray-700">{active.title}</span> yet — but DeepTalent
                    can source vetted talent for almost any role at up to 30% below market.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={continueToExternal}
                      className="h-11 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#2f49b0] transition-colors"
                    >
                      Continue to {active.source} <ExternalLink className="size-3.5" />
                    </button>
                    <a
                      href="/hire"
                      className="h-11 rounded-full border border-gray-200 text-gray-600 text-sm font-medium grid place-items-center hover:border-gray-900 hover:text-gray-900 transition-colors"
                    >
                      Talk to DeepTalent instead
                    </a>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}
