"use client";

import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "motion/react";
import { useState, useRef, useEffect } from "react";
import {
  Check,
  Download,
  Sparkles,
  MoreVertical,
  ShieldCheck,
  Users,
  Search,
  Scale,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Globe,
  Award,
  Rocket,
  Zap,
  Share2,
  QrCode,
  Copy,
  Smile,
  Clock,
  Bell,
  AlertTriangle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { SiteNavbar } from "@/components/site/site-navbar";
import { FluidCTA } from "@/components/site/fluid-cta";

export function CompaniesPageClient() {
  return (
    <main className="bg-white overflow-x-hidden">
      <SiteNavbar />
      <Hero />
      <ProblemStatement />
      <OurSolutions />
      <OptimizeHiring />
      <TrustedPlatform />
      <PowerfulTools />
      <WorkforceVisibility />
      <GrowthPillars />
      <CustomizedAnswers />
      <RetentionMetric />
      <DarkStats />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   1. HERO — Brix dark panel with topographic backdrop + floating UI cards
   ───────────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="px-3 pt-24 md:px-5 md:pt-28">
      <div className="relative mx-auto max-w-[1300px] overflow-hidden rounded-[28px] bg-[#0a0b12] px-6 py-14 md:px-12 md:py-16">
        {/* Topographic contour backdrop */}
        <ContourBackdrop />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          {/* Left copy */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              AI-Driven
              <br />
              Talent Sourcing
              <br />
              <span className="text-white/35">Solution</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8"
            >
              <Link
                href="/companies/hire"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0a0b12] transition-transform hover:scale-[1.03]"
              >
                Try for FREE
                <ArrowRight className="size-4 -rotate-45" />
              </Link>
            </motion.div>

            <p className="mt-40 hidden max-w-sm text-sm leading-relaxed text-white/60 lg:block">
              Hire credentialled finance, compliance &amp; technology specialists
              across 120+ countries and maximize output for your remote team.
              Save cost and time today!
            </p>

            {/* Product Hunt-style badge */}
            <div className="mt-8 hidden items-center gap-5 border-t border-white/10 pt-6 lg:flex">
              <div className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase leading-tight text-white/70">
                  Talent partner
                  <br />
                  of the year
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="grid size-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                  D
                </div>
                <span className="text-xs font-medium text-white/70">DeepTalent Awards</span>
              </div>
            </div>
          </div>

          {/* Right floating card collage */}
          <HeroCards />
        </div>

        {/* Mobile paragraph */}
        <p className="relative z-10 mt-10 max-w-sm text-sm leading-relaxed text-white/60 lg:hidden">
          Hire credentialled finance, compliance &amp; technology specialists across
          120+ countries. Save cost and time today!
        </p>
      </div>
    </section>
  );
}

function ContourBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* colored glows */}
      <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#ff3b3b]/20 blur-[100px]" />
      <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-[#2fd9e8]/20 blur-[100px]" />
      {/* concentric contour lines */}
      <svg className="absolute right-0 top-1/2 h-[140%] w-[70%] -translate-y-1/2 opacity-[0.5]" viewBox="0 0 400 400" fill="none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="contour" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5b5b" />
            <stop offset="100%" stopColor="#2fd9e8" />
          </linearGradient>
        </defs>
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse
            key={i}
            cx={230}
            cy={200}
            rx={30 + i * 16}
            ry={24 + i * 13}
            stroke="url(#contour)"
            strokeWidth={0.8}
            strokeOpacity={0.35}
          />
        ))}
      </svg>
    </div>
  );
}

function HeroCards() {
  return (
    <div className="relative min-h-[440px] w-full">
      {/* ── Desktop absolute collage ── */}
      <div className="relative hidden h-[460px] lg:block">
        {/* Compliance documents (top right) */}
        <FloatCard className="absolute right-0 top-0 w-[280px]" delay={0.1}>
          <ComplianceCard />
        </FloatCard>

        {/* Chat / capacity (top center) */}
        <FloatCard className="absolute left-2 top-6 w-[270px]" delay={0.2}>
          <CapacityCard />
        </FloatCard>

        {/* Payroll (mid right) */}
        <FloatCard className="absolute right-2 top-[190px] w-[270px]" delay={0.3}>
          <PayrollCard />
        </FloatCard>

        {/* AI hire prompt (bottom left) */}
        <FloatCard className="absolute bottom-0 left-0 w-[300px]" delay={0.25}>
          <PromptCard />
        </FloatCard>

        {/* Purple promo (bottom right) */}
        <FloatCard className="absolute bottom-2 right-6 w-[220px]" delay={0.35}>
          <PromoCard />
        </FloatCard>
      </div>

      {/* ── Mobile stacked ── */}
      <div className="flex flex-col gap-4 lg:hidden">
        <ComplianceCard />
        <PromptCard />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PayrollCard />
          <PromoCard />
        </div>
      </div>
    </div>
  );
}

function FloatCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      <div className="float-y" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </motion.div>
  );
}

function ComplianceCard() {
  const docs = ["Right-to-work verification", "Signed contract & NDA", "Tax residency form"];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      <p className="text-sm font-semibold text-gray-900">Compliance Documents</p>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
        <div className="grid size-5 place-items-center rounded-full bg-emerald-500">
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
        <span className="text-xs font-medium text-emerald-700">You are fully compliant</span>
        <span className="ml-auto text-xs font-bold text-emerald-700">3/3</span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {docs.map((d) => (
          <li key={d} className="flex items-center justify-between text-xs text-gray-600">
            {d}
            <Download className="size-3.5 text-gray-400" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CapacityCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-full bg-[#3B5BDB] text-xs font-bold text-white">
          AO
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Amara Okafor</p>
        </div>
        <span className="text-base">🎯</span>
        <MoreVertical className="size-4 text-gray-400" />
      </div>
      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
        Ready for additional projects
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">30h</span>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">43h</span>
        <span className="ml-auto rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          Available
        </span>
      </div>
    </div>
  );
}

function PayrollCard() {
  const avatars = ["pro-1", "pro-2", "pro-3", "pro-4", "pro-5"];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="grid size-5 place-items-center rounded-full bg-emerald-500">
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
        <span className="text-xs font-medium text-gray-500">Payroll completed in 52 cities</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">$285,650.00</p>
      <div className="mt-3 flex items-center">
        {avatars.map((a, i) => (
          <img
            key={a}
            src={`/images/consulting/${a}.png`}
            alt=""
            className="-ml-2 size-7 rounded-full border-2 border-white object-cover first:ml-0"
            style={{ zIndex: avatars.length - i }}
          />
        ))}
        <span className="ml-2 text-xs font-semibold text-gray-400">+12</span>
      </div>
    </div>
  );
}

function PromptCard() {
  const skills = ["IFRS", "AML", "KYC", "SQL", "Python", "React", "Excel"];
  return (
    <div className="rounded-2xl bg-[#15161f] p-4 shadow-xl ring-1 ring-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Description</p>
      <div className="mt-2 rounded-lg bg-white/5 p-3">
        <p className="text-sm text-white/90">
          I want to hire a compliance analyst<span className="animate-pulse">|</span>
        </p>
        <p className="mt-2 text-right text-[10px] text-white/30">28/100</p>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-white/40">
        Add skills include
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span key={s} className="rounded-md bg-[#3B5BDB]/20 px-2 py-1 text-[11px] font-medium text-[#8ea2ff]">
            {s}
          </span>
        ))}
        <span className="rounded-md px-2 py-1 text-[11px] font-medium text-white/40">Add more +</span>
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-[#0a0b12]">
        <Sparkles className="size-4" /> AI Generate
      </button>
    </div>
  );
}

function PromoCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#3B5BDB] p-4 shadow-xl">
      <div className="relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/70">EOR</span>
        <p className="mt-1 text-[11px] font-medium leading-tight text-white/80">
          Save time &amp; local
          <br />
          hiring cost
        </p>
        <p className="mt-1 text-4xl font-extrabold text-white">30%</p>
      </div>
      <img
        src="/images/companies/promo-person.png"
        alt="DeepTalent specialist working on a laptop"
        className="pointer-events-none absolute -bottom-1 -right-2 h-28 w-auto object-contain"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   2. PROBLEM STATEMENT — Yunity (white, 4 cells + blue geometric panel)
   ───────────────────────────────────────────────────────────────────────── */

function ProblemStatement() {
  const cells = [
    { icon: Search, title: "The Hiring Challenge", desc: "Teams struggle with inefficient, biased, and slow hiring processes." },
    { icon: Scale, title: "The Compliance Burden", desc: "Cross-border payroll, contracts, and tax compliance are complex to manage." },
    { icon: FolderKanban, title: "Inefficient Sourcing", desc: "Disorganized pipelines and poor collaboration delay hiring top talent." },
    { icon: BarChart3, title: "Lack of Vetting Insight", desc: "Hard to verify real skills and credentials before you commit to a hire." },
  ];
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-[28px] lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Problem
            <br />
            Statement
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
            Hiring specialist talent across borders is slow, risky, and expensive.
            Here is what stands between teams and the people they need.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {cells.map((c) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-[#3B5BDB]/10">
                  <c.icon className="size-4.5 text-[#3B5BDB]" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-gray-900">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Blue panel with DeepTalent logo */}
        <div className="relative hidden h-[420px] items-center justify-center overflow-hidden rounded-[28px] bg-[#3B5BDB] lg:flex">
          {/* soft radial glow */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.35) 0%, transparent 55%)" }}
          />
          {/* concentric rings */}
          <div aria-hidden className="absolute left-1/2 top-[42%] size-[120%] -translate-x-1/2 -translate-y-1/2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
                style={{ width: `${30 + i * 22}%`, height: `${30 + i * 22}%` }}
              />
            ))}
          </div>
          {/* logo lockup card */}
          <div className="relative z-10 rounded-2xl bg-white px-10 py-8 shadow-2xl">
            <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-14 w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   3. OUR SOLUTIONS — Yunity (heading left, 2x2 cards)
   ───────────────────────────────────────────────────────────────────────── */

function OurSolutions() {
  const solutions = [
    { icon: Users, title: "Collaborative Hiring", desc: "Centralized dashboards, shared shortlists, and real-time collaboration for your whole team." },
    { icon: ShieldCheck, title: "Bias-Free Vetting", desc: "Structured evaluations and credential checks ensure fair, merit-based hiring." },
    { icon: FolderKanban, title: "All-In-One Talent Ops", desc: "Sourcing, payroll, contracts, and compliance managed in one seamless platform." },
    { icon: BarChart3, title: "Data-Driven Decisions", desc: "Real-time analytics and reporting optimize your hiring and workforce planning." },
  ];
  return (
    <section className="bg-[#F5F6FB] px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Our
            <br />
            Solutions
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-500">
            We provide cutting-edge solutions to revolutionize hiring and talent
            management — making the process smarter, faster, and more efficient.
            From AI-driven sourcing to seamless team collaboration, DeepTalent
            helps companies build and manage top-performing teams effortlessly.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${
                i === 2 ? "sm:bg-[#3B5BDB] sm:text-white" : ""
              }`}
            >
              <div
                className={`grid size-11 place-items-center rounded-xl ${
                  i === 2 ? "bg-white/15" : "bg-[#3B5BDB]/10"
                }`}
              >
                <s.icon className={`size-5 ${i === 2 ? "text-white" : "text-[#3B5BDB]"}`} />
              </div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className={`mt-1.5 text-xs leading-relaxed ${i === 2 ? "text-white/80" : "text-gray-500"}`}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   3b. OPTIMIZE HIRING — HireRight (scroll-driven accordion list + gradient card)
   ───────────────────────────────────────────────────────────────────────── */

function OptimizeHiring() {
  const steps = [
    {
      icon: Zap,
      title: "AI-driven, lightning-fast job brief creation",
      desc: "Describe the role in plain language and our AI drafts a complete, bias-checked job brief with skills, seniority, and salary band in seconds.",
    },
    {
      icon: Share2,
      title: "Effortless job sharing, increased exposure",
      desc: "Publish and share your role across social channels or inside your org in one click — enhanced visibility gets your brief in front of the right specialists faster.",
    },
    {
      icon: FolderKanban,
      title: "AI-driven Applicant Tracking System (ATS)",
      desc: "Every applicant is auto-scored, ranked, and moved through a clean pipeline — from shortlist to signed offer — so nothing slips through the cracks.",
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setActive(Math.min(Math.floor(v * steps.length * 0.999), steps.length - 1));
    });
    return () => unsub();
  }, [scrollYProgress, steps.length]);

  return (
    <section className="relative bg-white">
      <div ref={containerRef} style={{ height: `${steps.length * 60}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center px-4 py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: heading + scroll accordion */}
            <div>
              <img src="/images/logo-wordmark.png" alt="DeepTalent" className="mb-8 h-9 w-auto" />
              <div className="space-y-1">
                {steps.map((s, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={s.title}
                      onClick={() => setActive(i)}
                      className="block w-full border-t border-gray-200 py-5 text-left last:border-b"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
                            on ? "bg-[#3B5BDB] text-white" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <s.icon className="size-4.5" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-base font-bold transition-colors ${
                              on ? "text-[#3B5BDB]" : "text-gray-900"
                            }`}
                          >
                            {s.title}
                          </h3>
                          <AnimatePresence initial={false}>
                            {on && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden text-sm leading-relaxed text-gray-500"
                              >
                                <span className="block pt-2">{s.desc}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: heading + checks + gradient mock card */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Optimize hiring with AI
                <br />
                <span className="text-gray-400">from job brief to shortlist</span>
              </h2>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Check className="size-4 text-[#3B5BDB]" /> 100% vetted candidates
                </span>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Check className="size-4 text-[#3B5BDB]" /> 60% time saved on hiring
                </span>
              </div>

              <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#3B5BDB] via-[#5b74e6] to-[#8690FD] p-5 md:p-6">
                <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
                  <ShareJobMock />
                  <TalentVizMock />
                </div>
              </div>

              <div className="mt-8">
                <FluidCTA href="/companies/hire" size="lg">Start hiring with AI</FluidCTA>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShareJobMock() {
  return (
    <div className="space-y-3">
      {/* share bar */}
      <div className="rounded-xl bg-white p-3 shadow-lg">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
          <Share2 className="size-3.5 text-gray-400" />
          <span className="flex-1 truncate text-[11px] text-gray-400">deeptalent.io/roles/share...</span>
          <span className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-gray-600 shadow-sm">
            <Copy className="size-3" /> Copy
          </span>
        </div>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-md bg-[#3B5BDB] px-2 py-1 text-[10px] font-semibold text-white">Facebook</span>
          <span className="rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white">X</span>
          <span className="rounded-md bg-[#0a66c2] px-2 py-1 text-[10px] font-semibold text-white">LinkedIn</span>
        </div>
      </div>
      {/* job card */}
      <div className="rounded-xl bg-white p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <img src="/images/consulting/pro-3.png" alt="" className="size-6 rounded-full object-cover" />
          <span className="text-[11px] font-semibold text-gray-700">Esther Howard</span>
          <span className="ml-auto text-[10px] text-gray-400">May 9</span>
        </div>
        <p className="mt-2 text-xs font-bold text-gray-900">Backend Engineer (Fintech)</p>
        <p className="text-[10px] text-gray-400">Remote · Full-time · $80K–$110K/yr</p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">Node.js</span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">React</span>
        </div>
      </div>
    </div>
  );
}

function TalentVizMock() {
  return (
    <div className="flex flex-col rounded-xl bg-[#2c47b8] p-3 text-center shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/80">DeepTalent</span>
        <span className="text-[8px] font-semibold uppercase tracking-wide text-white/40">Powered by AI</span>
      </div>
      <p className="mt-3 text-sm font-bold text-white">TalentViz</p>
      <p className="text-[9px] text-white/60">Candidate recommendation</p>
      <div className="mt-3 rounded-lg bg-white p-3">
        <p className="text-[10px] font-semibold text-gray-700">Submit your application</p>
        <p className="mb-2 mt-0.5 text-[8px] text-gray-400">Scan QR code</p>
        <div className="mx-auto grid size-16 place-items-center rounded-md bg-gray-900">
          <QrCode className="size-12 text-white" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   4. TRUSTED PLATFORM — Olvera editorial (serif headline + showcase + logos)
   ───────────────────────────────────────────────────────────────────────── */

function TrustedPlatform() {
  return (
    <section className="bg-[#FBFAF7] px-4 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[#3B5BDB]">
          Connecting teams with credentialled specialists worldwide
        </p>
        <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-gray-900 md:text-6xl">
          The trusted platform for <span className="italic text-[#3B5BDB]">hiring</span> the best minds.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm text-gray-500">
          Empowering companies to connect with finance, compliance &amp; technology
          talent that drives real results.
        </p>
        <div className="mt-8 flex justify-center">
          <FluidCTA href="/companies/hire" size="lg">Get a demo</FluidCTA>
        </div>
      </div>

      {/* Showcase */}
      <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-100 to-blue-50 p-5 shadow-sm">
          <RecommendationMock />
        </div>
        <div className="relative overflow-hidden rounded-3xl">
          <img src="/images/consulting/pro-1.png" alt="A DeepTalent specialist" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
            <p className="text-sm font-semibold text-white">Smarter hiring, faster results.</p>
          </div>
        </div>
      </div>

      {/* Logo strip */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-gray-400">
          {["Finance", "Compliance", "Fintech", "Banking", "SaaS", "Insurance"].map((n) => (
            <span key={n} className="text-lg font-semibold tracking-tight">{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendationMock() {
  const rows = [
    { role: "Senior Compliance Analyst", tags: ["AML", "KYC", "Remote"], rate: "$45/hr" },
    { role: "Financial Reporting Lead", tags: ["IFRS", "Excel", "Full-time"], rate: "$52/hr" },
    { role: "Backend Engineer (Fintech)", tags: ["Python", "SQL", "Remote"], rate: "$48/hr" },
  ];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <p className="text-sm font-bold text-gray-900">Top Recommendations</p>
        <span className="text-[11px] text-gray-400">Sorted by: Relevance</span>
      </div>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <div key={r.role} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#3B5BDB]/10 text-[#3B5BDB]">
              <Users className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900">{r.role}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-xs font-bold text-[#3B5BDB]">{r.rate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   5. POWERFUL TOOLS — Olvera (serif heading + tab switcher + icon cards)
   ───────────────────────────────────────────────────────────────────────── */

function PowerfulTools() {
  const tabs = ["DeepTalent", "Agentic AI", "ATS", "CRM", "Scheduling"];
  const [active, setActive] = useState(0);

  const cards = [
    { icon: BrainCircuit, title: "AI Matching", desc: "Auto-rank candidates against your exact brief." },
    { icon: FolderKanban, title: "Pipeline Board", desc: "Track every stage from shortlist to signed." },
    { icon: CalendarClock, title: "Interview Scheduling", desc: "Book panels across time zones in one click." },
    { icon: ShieldCheck, title: "Compliance Vault", desc: "Contracts, IDs, and tax docs stored securely." },
  ];

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-xl font-serif text-4xl leading-tight text-gray-900 md:text-5xl">
          Powerful tools built to <span className="italic text-[#3B5BDB]">perform</span> seamlessly.
        </h2>
        <p className="mt-4 max-w-md text-sm text-gray-500">
          Boost productivity with connected, efficient solutions across your hiring stack.
        </p>

        {/* Tab switcher */}
        <div className="mt-8 inline-flex flex-wrap gap-1 rounded-full border border-gray-200 bg-white p-1">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === i ? "bg-[#3B5BDB] text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-[#3B5BDB]/10">
                <c.icon className="size-5 text-[#3B5BDB]" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-gray-900">{c.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   5b. WORKFORCE VISIBILITY — WorkViz (productivity feature rows w/ mock cards)
   ───────────────────────────────────────────────────────────────────────── */

function WorkforceVisibility() {
  const rows = [
    {
      title: "Daily report of every specialist",
      desc: "Detailed analysis of each remote hire's day-to-day activity — performance indicators, total working hours, daily efficiency, task logs, and work reports, all in one place.",
      tags: ["Insight Report", "Task Overview", "Work Logs"],
      mock: <DailyReportMock />,
      reverse: false,
    },
    {
      title: "Emoji feedback",
      desc: "Your team can use emojis to express emotions or stress levels — an intuitive, interactive way to surface how remote members really feel at work before it becomes a problem.",
      tags: ["Emoji Icon", "Emotion Quote"],
      mock: <EmojiFeedbackMock />,
      reverse: true,
    },
    {
      title: "Record of time distribution",
      desc: "Track and estimate how time is spent across projects and issue types, with an active-time summary and per-project distribution for every specialist on your team.",
      tags: ["Active Time Summary", "Project Time Distribution"],
      mock: <TimeDistributionMock />,
      reverse: false,
    },
    {
      title: "Productivity alerts",
      desc: "The system flags three types of alerts — on-leave, overcapacity workload, and roadblock detection — so you can step in and support your remote specialists on time.",
      tags: ["Three Types Alerts"],
      mock: <ProductivityAlertsMock />,
      reverse: true,
    },
  ];

  return (
    <section className="bg-[#F0F1FB] px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-9 w-auto" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Visualize time allocation &amp; productivity
              <br />
              <span className="text-gray-400">for your remote specialists</span>
            </h2>
          </div>
        </div>

        {/* Feature rows */}
        <div className="mt-16 space-y-6">
          {rows.map((r) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="grid items-center gap-8 rounded-[28px] bg-white p-6 shadow-sm md:grid-cols-2 md:p-10"
            >
              <div className={r.reverse ? "md:order-2" : ""}>
                <h3 className="text-2xl font-bold text-gray-900">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{r.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#3B5BDB]/10 px-3 py-1.5 text-xs font-medium text-[#3B5BDB]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className={r.reverse ? "md:order-1" : ""}>{r.mock}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyReportMock() {
  const items = [
    { label: "Code optimized", time: "6h", color: "bg-red-400" },
    { label: "General meeting", time: "2.5h", color: "bg-[#3B5BDB]" },
    { label: "Code writing", time: "30m", color: "bg-emerald-400" },
    { label: "Project management", time: "1h", color: "bg-amber-400" },
  ];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-[#3B5BDB] p-4">
      <div className="rounded-xl bg-white p-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Daily Work Report</p>
          <FileText className="size-3.5 text-gray-300" />
        </div>
        <p className="mt-2 text-[11px] font-bold text-gray-900">Wed 24</p>
        <div className="mt-2 space-y-1.5">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5">
              <span className={`h-4 w-1 rounded-full ${it.color}`} />
              <span className="flex-1 text-[10px] font-medium text-gray-700">{it.label}</span>
              <span className="text-[10px] font-bold text-gray-400">{it.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmojiFeedbackMock() {
  const cards = [
    { day: "Wed 15", label: "Meeting", time: "9am – 10:30am", emoji: "🙂", tone: "Neutral", bg: "bg-white" },
    { day: "Fri 17", label: "Fix bugs", time: "1pm – 5pm", emoji: "😣", tone: "Terrible", bg: "bg-red-50" },
    { day: "", label: "Launch party", time: "2pm – 4pm", emoji: "🥳", tone: "Excited", bg: "bg-amber-50" },
  ];
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#3B5BDB] to-[#8690FD] p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-xl ${c.bg} p-2.5 shadow-md ${i === 2 ? "sm:col-span-2" : ""}`}>
            {c.day && <p className="text-[9px] font-bold text-gray-400">{c.day}</p>}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-gray-900">{c.label}</p>
                <p className="text-[9px] text-gray-400">{c.time}</p>
              </div>
              <span className="text-lg">{c.emoji}</span>
            </div>
            <p className="mt-1 text-right text-[8px] font-medium text-gray-400">{c.tone}</p>
          </div>
        ))}
      </div>
      {/* floating quote chip */}
      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-lg">
        <Smile className="size-3.5 text-[#3B5BDB]" />
        <span className="text-[10px] font-semibold text-gray-700">Required additional care</span>
      </div>
    </div>
  );
}

function TimeDistributionMock() {
  const bars = [30, 55, 45, 70, 60, 85, 75];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-[#3B5BDB] p-4">
      <div className="rounded-xl bg-white p-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <p className="text-[10px] font-bold text-gray-900">Time Distribution</p>
          <Clock className="size-3.5 text-gray-300" />
        </div>
        <div className="mt-3 flex h-24 items-end justify-between gap-1.5">
          {bars.map((h, i) => (
            <div key={i} className="w-full rounded-t bg-[#3B5BDB]" style={{ height: `${h}%`, opacity: 0.35 + i * 0.09 }} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px] text-gray-400">
          <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
}

function ProductivityAlertsMock() {
  const users = [
    { name: "Huang", hrs: "13 hrs", w: "90%", color: "bg-red-400" },
    { name: "Zhou", hrs: "9 hrs", w: "60%", color: "bg-emerald-400" },
    { name: "Wang", hrs: "7.5 hrs", w: "45%", color: "bg-[#3B5BDB]" },
  ];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#2fd9e8] to-[#3B5BDB] p-4">
      <div className="rounded-xl bg-white p-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <p className="text-xs font-bold text-gray-900">Work Hours</p>
          <span className="flex items-center gap-1 rounded-md bg-[#3B5BDB] px-2 py-1 text-[9px] font-semibold text-white">
            <Bell className="size-2.5" /> Overwork warning
          </span>
        </div>
        <div className="mt-3 space-y-2.5">
          {users.map((u) => (
            <div key={u.name} className="flex items-center gap-2">
              <span className="w-10 text-[10px] font-medium text-gray-600">{u.name}</span>
              <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${u.color}`} style={{ width: u.w }} />
              </div>
              <span className="w-10 text-right text-[10px] font-bold text-gray-400">{u.hrs}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-1.5">
          <AlertTriangle className="size-3.5 text-red-500" />
          <span className="text-[10px] font-semibold text-red-600">Over capacity — 13 hrs today</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   6. GROWTH PILLARS — Yunity (blue panel, 4 arched columns)
   ───────────────────────────────────────────────────────────────────────── */

function GrowthPillars() {
  const pillars = [
    { n: "01", icon: Globe, title: "Growing Talent Pool", desc: "Thousands of credentialled specialists join our vetted network every month." },
    { n: "02", icon: TrendingUp, title: "Placement Milestones", desc: "Steady placement growth as our matching engine improves with every hire." },
    { n: "03", icon: Rocket, title: "Product Enhancements", desc: "Continuously shipping features that make sourcing and onboarding faster." },
    { n: "04", icon: Award, title: "Partnerships & Recognition", desc: "Backed by strategic partners and recognized across the industry." },
  ];
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#3B5BDB] px-6 py-14 md:px-12">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            How DeepTalent
            <br />
            Is Growing
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            We are continuously evolving by innovating, strengthening our network,
            and enhancing user experience. Here are the key pillars driving
            DeepTalent&apos;s growth.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-t-[999px] bg-white/10 px-5 pb-6 pt-10 text-center ring-1 ring-white/15"
            >
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-white/15">
                <p.icon className="size-5 text-white" />
              </div>
              <p className="mt-4 text-xs font-bold text-white/50">{p.n}</p>
              <h3 className="mt-1 text-sm font-bold text-white">{p.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/60">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   7. CUSTOMIZED ANSWERS — Olvera (serif + 3 feature rows w/ screenshots)
   ───────────────────────────────────────────────────────────────────────── */

function CustomizedAnswers() {
  const rows = [
    {
      tag: "Startups",
      title: "Build your team with DeepTalent's hiring platform.",
      desc: "Attract, manage, and hire top talent through powerful recruiting tools designed to streamline workflows and accelerate company growth with confidence.",
      mock: <TeamMock />,
      reverse: false,
    },
    {
      tag: "Growth",
      title: "All-in-one recruiting platform built to scale efficiently.",
      desc: "Streamline hiring, improve candidate experience, and optimize team performance with our unified recruiting platform built to adapt and grow.",
      mock: <CandidatesMock />,
      reverse: true,
    },
    {
      tag: "Enterprise",
      title: "AI-powered recruiting tools for faster hiring.",
      desc: "Streamline hiring with AI-driven sourcing, scheduling, and analytics — all seamlessly integrated to accelerate recruitment and attract top talent efficiently.",
      mock: <AnalyticsMock />,
      reverse: false,
    },
  ];
  return (
    <section className="bg-[#FBFAF7] px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-4xl leading-tight text-gray-900 md:text-5xl">
          Customized answers designed for your <span className="italic text-[#3B5BDB]">requirements</span>.
        </h2>
        <p className="mt-4 text-sm text-gray-500">Custom strategies built to match your hiring goals.</p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl space-y-16">
        {rows.map((r) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className={`grid items-center gap-8 md:grid-cols-2 ${r.reverse ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#3B5BDB]">{r.tag}</span>
              <h3 className="mt-3 text-2xl font-bold text-gray-900">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{r.desc}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">{r.mock}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TeamMock() {
  return (
    <div className="space-y-2">
      {["Amara Okafor", "Thabo Nkosi", "Fatima Diallo"].map((n, i) => (
        <div key={n} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
          <img src={`/images/consulting/pro-${i + 2}.png`} alt="" className="size-8 rounded-full object-cover" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-900">{n}</p>
            <p className="text-[10px] text-gray-400">Available for work</p>
          </div>
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">Vetted</span>
        </div>
      ))}
    </div>
  );
}

function CandidatesMock() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2 text-[10px] font-medium text-gray-400">
        <span className="rounded bg-[#3B5BDB]/10 px-2 py-0.5 text-[#3B5BDB]">Active</span>
        <span>Shortlist</span>
        <span>Interview</span>
        <span>Offer</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["pro-4", "pro-5", "pro-6", "pro-7", "pro-8", "pro-1"].map((a) => (
          <div key={a} className="rounded-lg border border-gray-100 p-2 text-center">
            <img src={`/images/consulting/${a}.png`} alt="" className="mx-auto size-9 rounded-full object-cover" />
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMock() {
  const bars = [40, 65, 50, 80, 60, 90];
  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <p className="text-xs font-bold text-gray-900">Attendance Rate</p>
        <span className="text-[10px] text-gray-400">This month</span>
      </div>
      <div className="mt-4 flex h-28 items-end justify-between gap-2">
        {bars.map((h, i) => (
          <div key={i} className="w-full rounded-t-md bg-[#3B5BDB]" style={{ height: `${h}%`, opacity: 0.4 + i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   8. RETENTION METRIC — Yunity (blue panel, bar charts + big stats)
   ───────────────────────────────────────────────────────────────────────── */

function RetentionMetric() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] bg-[#3B5BDB] lg:grid-cols-[1fr_1.4fr]">
        {/* Left: stats */}
        <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
          <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
            Growth and
            <br />
            Retention Metric
          </h2>
          <div className="grid grid-cols-2 gap-6 border-t border-white/20 pt-6">
            <div>
              <p className="text-4xl font-extrabold text-white">5,000+</p>
              <p className="mt-1 text-xs text-white/60">Companies hiring with DeepTalent</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white">85%</p>
              <p className="mt-1 text-xs text-white/60">12-month placement retention</p>
            </div>
          </div>
        </div>

        {/* Right: bar charts */}
        <div className="grid gap-6 bg-white/5 p-8 md:grid-cols-2 md:p-12">
          <ChartBlock label="Placements filled" values={[45, 70, 90]} captions={["Q1", "Q2", "Q3"]} />
          <ChartBlock label="Avg. days to hire" values={[80, 55, 35]} captions={["Q1", "Q2", "Q3"]} />
        </div>
      </div>
    </section>
  );
}

function ChartBlock({ label, values, captions }: { label: string; values: number[]; captions: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-white/60">{label}</p>
      <div className="mt-4 flex h-40 items-end justify-around gap-3">
        {values.map((v, i) => (
          <div key={i} className="flex w-full flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${v}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
              className="w-full rounded-t-lg bg-white"
              style={{ minHeight: 8 }}
            />
            <span className="text-[10px] text-white/50">{captions[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   9. DARK STATS — Olvera (dark section, dashboard mock + 500+/70%/3x/98%)
   ───────────────────────────────────────────────────────────────────────── */

function DarkStats() {
  const stats = [
    { v: "500+", l: "Specialists placed" },
    { v: "70%", l: "Faster time-to-hire" },
    { v: "3x", l: "Pipeline quality" },
    { v: "98%", l: "Client satisfaction" },
  ];
  return (
    <section className="bg-[#0a0b12] px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl leading-tight text-white md:text-5xl">
          Everything you need to hire, manage &amp; retain.
        </h2>
        <p className="mt-4 text-sm text-white/50">
          A comprehensive talent and hiring management dashboard for your business.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <img src="/images/consulting/pro-6.png" alt="" className="size-9 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-white">Jordan Perez</p>
                <p className="text-[10px] text-white/40">UI/UX Designer · $40–$60 / hr</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {["Right-to-work verified", "Contract signed", "Onboarding complete"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs text-white/70">
                  <Check className="size-3.5 text-emerald-400" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs font-semibold text-white">Summary of expertise</p>
            <p className="mt-2 text-[11px] leading-relaxed text-white/50">
              A vetted finance &amp; compliance specialist with strong reporting,
              risk, and cross-border payroll experience — matched to your brief.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[11px] text-white/60">
              <Search className="size-3.5" /> Search for candidates
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-extrabold text-white">{s.v}</p>
              <p className="mt-1 text-[11px] text-white/50">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   10. FINAL CTA + FOOTER
   ───────────────────────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="bg-[#0a0b12] px-4 py-20 md:py-28">
      <div className="relative mx-auto max-w-5xl">
        {/* stacked cards peeking behind */}
        <div aria-hidden className="absolute inset-x-8 -top-3 h-8 rounded-t-[28px] bg-[#3B5BDB]/40" />
        <div aria-hidden className="absolute inset-x-4 -top-1.5 h-8 rounded-t-[28px] bg-[#3B5BDB]/70" />

        <div className="relative overflow-hidden rounded-[28px] bg-[#3B5BDB] px-6 py-20 text-center md:px-12 md:py-24">
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold leading-[1.15] text-white md:text-5xl">
            Hire talents worldwide and maximize work productivity for remote members today
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/70">
            Shaping the future of work with our AI-driven talent sourcing and
            management solution.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/companies/hire"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Hire Talent <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/consulting"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Try Consulting <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#3B5BDB] transition-transform hover:scale-[1.03]"
            >
              Request A Demo <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 px-6 py-12 text-white">
      <div className="mx-auto mb-8 grid max-w-6xl gap-8 md:grid-cols-4">
        <div>
          <h3 className="mb-4 font-bold">DeepTalent</h3>
          <p className="text-sm text-gray-400">Connecting top talent with world-class opportunities.</p>
        </div>
        <div>
          <h4 className="mb-4 font-bold">Product</h4>
          <Link href="/talents" className="mb-2 block text-sm text-gray-400 hover:text-white">For Talents</Link>
          <Link href="/companies" className="mb-2 block text-sm text-gray-400 hover:text-white">For Companies</Link>
          <Link href="/consulting" className="mb-2 block text-sm text-gray-400 hover:text-white">Consulting</Link>
        </div>
        <div>
          <h4 className="mb-4 font-bold">Company</h4>
          <Link href="/about" className="mb-2 block text-sm text-gray-400 hover:text-white">About</Link>
          <Link href="/contact" className="mb-2 block text-sm text-gray-400 hover:text-white">Contact</Link>
        </div>
        <div>
          <h4 className="mb-4 font-bold">Legal</h4>
          <Link href="/privacy" className="mb-2 block text-sm text-gray-400 hover:text-white">Privacy</Link>
          <Link href="/terms" className="mb-2 block text-sm text-gray-400 hover:text-white">Terms</Link>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
        <p>&copy; 2026 DeepTalent Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
