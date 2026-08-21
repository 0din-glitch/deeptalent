"use client";

import {
  ArrowUpRight, ArrowRight, Command, Menu, X, Mail, Phone, MapPin,
  Instagram, Linkedin, HelpCircle, Plus, Minus,
  FileText, Users, ShieldCheck, ChevronRight,
  Star, Globe, Zap, Check, Paperclip, ArrowUp, Sparkles,
  Search, BadgeCheck, GitMerge, Rocket, Gauge, GraduationCap, BarChart3,
  Building2, Landmark, Briefcase, Quote, Target, Heart, Layers,
  Network, Cpu, Scale, Lightbulb, TrendingUp,
} from "lucide-react";
import { ConsentBot } from "@/components/site/consent-bot";
import { YouTubePopup } from "@/components/site/youtube-popup";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  motion, useScroll, AnimatePresence,
} from "motion/react";
import { FluidCTA } from "@/components/site/fluid-cta";
import { fadeInUp, staggerContainer, scaleIn, viewport } from "@/lib/motion";

/* ─── light palette shortcuts ─── */
const C = {
  primary: "#3B5BDB",
  primaryDark: "#2F49B0",
  ink: "#111827",
  body: "#6B7280",
  border: "#E5E7EB",
  soft: "#F9FAFB",
} as const;

/* ─── responsive helper: true at lg (1024px) and up ─── */
function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isDesktop;
}

/* ════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="bg-white text-gray-900 overflow-x-clip">
      <Navbar />
      <Hero />
      <SupportingStatement />
      <TrustedBy />
      <WhatWeAre />
      <ProblemSolve />
      <SolutionLifecycle />
      <ServiceShowcase />
      <PlatformPillars />
      <GlobeSection />
      <LearningPartnerships />
      <HowItWorks />
      <WhoWeServe />
      <WhyChooseUs />
      <StrategicAdvantages />
      <EnterpriseGovernment />
      <HumanLayer />
      <FounderMessage />
      <VisionValues />
      <TestimonialCarousel />
      <IndustryInsights />
      <FaqSection />
      <FinalCTA />
      <Footer />
      <ConsentBot />
      <YouTubePopup />
    </main>
  );
}

/* ════════════════════════════════════════════════════
   SUPPORTING STATEMENT — bold positioning band
═══════════════════════════════════════════════════════ */
function SupportingStatement() {
  return (
    <section className="relative bg-[#F7F8FF] border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "radial-gradient(50% 60% at 50% 0%, rgba(134,144,253,0.14) 0%, transparent 70%)" }}
      />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer(0.12)}
        className="relative max-w-4xl mx-auto text-center"
      >
        <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-5">
          The Opportunity
        </motion.p>
        <motion.h2 variants={fadeInUp()} className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1] text-balance">
          The world does not have a talent shortage. It has a talent-access,{" "}
          <span className="text-[#3B5BDB]">trust and deployment problem.</span>
        </motion.h2>
        <motion.p variants={fadeInUp()} className="mt-6 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto text-pretty">
          Millions of capable professionals remain disconnected from global opportunities, while
          organisations struggle with skills shortages, rising costs, slow recruitment and fragmented
          cross-border systems.
        </motion.p>
        <motion.p variants={fadeInUp()} className="mt-6 text-lg md:text-xl font-semibold text-gray-900 max-w-2xl mx-auto text-pretty">
          DeepTalent is building the infrastructure that connects human potential to economic opportunity.
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   WHAT WE ARE — more than a talent platform
═══════════════════════════════════════════════════════ */
function WhatWeAre() {
  const enables = [
    { icon: Search, label: "Discover", desc: "Exceptional talent across global markets." },
    { icon: BadgeCheck, label: "Verify", desc: "Skills, experience, identity and credibility." },
    { icon: GitMerge, label: "Match", desc: "Talent to requirements with intelligent systems." },
    { icon: Rocket, label: "Deploy", desc: "Individuals and teams across borders." },
    { icon: Gauge, label: "Manage", desc: "Performance, compliance and workforce quality." },
    { icon: GraduationCap, label: "Develop", desc: "Structured learning and career pathways." },
    { icon: BarChart3, label: "Analyse", desc: "Workforce intelligence for better decisions." },
  ];
  const notList = ["A recruitment agency", "A freelance marketplace", "An outsourcing company", "A job board", "A staffing database"];

  return (
    <section className="relative bg-white border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.12)}
          className="max-w-3xl mb-12"
        >
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">What DeepTalent Is</motion.p>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05] mb-4">
            More Than a <span className="text-[#3B5BDB]">Talent Platform</span>
          </motion.h2>
          <motion.p variants={fadeInUp()} className="text-gray-500 text-lg leading-relaxed">
            A global Human Capital Infrastructure company designed to support the full lifecycle of
            modern workforce deployment — enabling organisations to:
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.06)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {enables.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              variants={fadeInUp()}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#3B5BDB]/30 hover:shadow-md transition-all"
            >
              <div className="size-11 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center mb-4">
                <Icon className="size-5 text-[#3B5BDB]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}

          {/* What we are NOT */}
          <motion.div variants={fadeInUp()} className="rounded-2xl border border-dashed border-gray-300 bg-[#F9FAFB] p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">What we are not</p>
            <ul className="space-y-2">
              {notList.map((n) => (
                <li key={n} className="flex items-center gap-2 text-sm text-gray-500">
                  <X className="size-3.5 shrink-0 text-gray-400" />
                  <span className="line-through decoration-gray-300">{n}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   PROBLEM WE SOLVE — three fragmented audiences
═══════════════════════════════════════════════════════ */
function ProblemSolve() {
  const groups = [
    { icon: Building2, title: "For Employers", points: ["Critical skills are difficult to source", "Hiring cycles are slow and expensive", "Local labour costs keep rising", "Candidate quality is inconsistent", "Cross-border hiring adds complexity", "Distributed teams lack structured management"] },
    { icon: Users, title: "For Talent", points: ["Capability is overlooked because of geography", "Qualifications are hard to verify across borders", "Access to credible employers is limited", "Skills don't always align with global demand", "Career and mobility pathways are fragmented"] },
    { icon: Landmark, title: "For Governments", points: ["Graduate unemployment remains high", "Human capital is underutilised", "Training is disconnected from employer demand", "Diaspora opportunities are poorly coordinated", "Skills data is incomplete or outdated"] },
  ];
  return (
    <section className="relative bg-[#F9FAFB] border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.12)} className="max-w-3xl mb-12">
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">The Problem We Solve</motion.p>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05] mb-4">
            The Global Workforce System <span className="text-[#3B5BDB]">Is Fragmented</span>
          </motion.h2>
          <motion.p variants={fadeInUp()} className="text-gray-500 text-lg leading-relaxed">
            Organisations need talent. Talent needs access. Governments need employment and growth. Yet
            the systems connecting them remain inefficient, inconsistent and difficult to trust.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.1)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map(({ icon: Icon, title, points }) => (
            <motion.div key={title} variants={fadeInUp()} className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="size-11 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center mb-5">
                <Icon className="size-5 text-[#3B5BDB]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="mt-1.5 size-1.5 rounded-full bg-[#3B5BDB]/60 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SOLUTION LIFECYCLE — Discover → Analyse
═══════════════════════════════════════════════════════ */
function SolutionLifecycle() {
  const steps = [
    { icon: Search, title: "Discover", desc: "Access carefully sourced professionals across high-potential global talent corridors." },
    { icon: BadgeCheck, title: "Verify", desc: "Assess skills, experience, identity, work readiness and professional credibility." },
    { icon: GitMerge, title: "Match", desc: "Use data, domain expertise and intelligent matching to connect the right people." },
    { icon: Rocket, title: "Deploy", desc: "Support mobilisation, onboarding, contracting and cross-border engagement." },
    { icon: Gauge, title: "Manage", desc: "Provide performance oversight, reporting and client success management." },
    { icon: GraduationCap, title: "Develop", desc: "Equip talent with the capabilities required to perform in global environments." },
    { icon: BarChart3, title: "Analyse", desc: "Generate workforce intelligence on availability, cost, risk and future skills." },
  ];
  return (
    <section className="relative bg-white border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.12)} className="text-center max-w-3xl mx-auto mb-12">
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Our Solution</motion.p>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
            One Infrastructure. <span className="text-[#3B5BDB]">Multiple Outcomes.</span>
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.07)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} variants={fadeInUp()} className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#3B5BDB]/30 hover:shadow-md transition-all">
              <span className="absolute top-5 right-5 font-mono text-xs font-bold text-[#3B5BDB]/30">0{i + 1}</span>
              <div className="size-11 rounded-xl bg-[#3B5BDB] flex items-center justify-center mb-4 shadow-md">
                <Icon className="size-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   PLATFORM PILLARS — the connected system
═══════════════════════════════════════����═══════════════ */
function PlatformPillars() {
  const pillars = [
    { icon: Globe, title: "Global Talent Infrastructure", desc: "A connected system for sourcing, assessing, verifying and deploying professionals across regions." },
    { icon: ShieldCheck, title: "Trust & Verification", desc: "Structured verification across identity, qualifications, skills, references, communication and role suitability." },
    { icon: BarChart3, title: "Workforce Intelligence", desc: "Insight on skills availability, compensation benchmarks, hiring demand, capability gaps and retention risk." },
    { icon: Layers, title: "Managed Workforce Solutions", desc: "Embedded teams, dedicated remote professionals and managed programmes without the full operational burden." },
    { icon: GraduationCap, title: "Talent Development", desc: "Role-specific training, global work-readiness, digital and AI skills, and career pathway support." },
    { icon: Cpu, title: "AI-Enabled Operations", desc: "Intelligent discovery, screening, matching and analytics — with human judgement kept central." },
    { icon: Landmark, title: "Government & Economic Development", desc: "Programmes that convert human capital into measurable local and global economic opportunity." },
  ];
  return (
    <section className="relative bg-[#F9FAFB] border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.12)} className="max-w-3xl mb-12">
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Our Platform Pillars</motion.p>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05] mb-4">
            Seven Systems. <span className="text-[#3B5BDB]">One Operating System.</span>
          </motion.h2>
          <motion.p variants={fadeInUp()} className="text-gray-500 text-lg leading-relaxed">
            The integrated foundations through which talent, organisations and economies participate more
            effectively in the global workforce.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.07)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeInUp()} className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm hover:border-[#3B5BDB]/30 hover:shadow-md transition-all">
              <div className="size-12 rounded-2xl bg-[#3B5BDB]/10 flex items-center justify-center mb-5">
                <Icon className="size-6 text-[#3B5BDB]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   WHO WE SERVE — audiences
═══════════════════════════════════════════════════════ */
function WhoWeServe() {
  const audiences = [
    { icon: Building2, title: "Enterprises", desc: "Reliable, flexible and globally distributed talent for organisations of every size." },
    { icon: Landmark, title: "Governments & Institutions", desc: "Better employment outcomes, workforce competitiveness and global participation." },
    { icon: Briefcase, title: "Professional Bodies", desc: "Career pathways, international opportunities and member-value programmes." },
    { icon: GraduationCap, title: "Universities & Training", desc: "Connecting learning, employability and global workforce demand." },
    { icon: TrendingUp, title: "Investors & Partners", desc: "Supporting employment, skills, digital economies and inclusive growth." },
    { icon: Users, title: "Talent", desc: "Access to global work, career development and credible opportunities." },
  ];
  return (
    <section className="relative bg-white border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.12)} className="text-center max-w-3xl mx-auto mb-12">
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Who We Serve</motion.p>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
            Built for Every Side of the <span className="text-[#3B5BDB]">Workforce</span>
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.07)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {audiences.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeInUp()} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#3B5BDB]/30 hover:shadow-md transition-all">
              <div className="size-11 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center shrink-0">
                <Icon className="size-5 text-[#3B5BDB]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   ENTERPRISE & GOVERNMENT SOLUTIONS
═══════════════════════════════════════════════════════ */
function EnterpriseGovernment() {
  const enterprise = ["Global talent acquisition", "Managed workforce services", "Dedicated remote teams", "Specialist & technical recruitment", "Executive & strategic appointments", "Workforce advisory & market intelligence"];
  const government = ["National talent mapping", "Global employability programmes", "Human-capital export strategy", "Youth & graduate employment", "Digital workforce programmes", "Diaspora talent networks"];

  return (
    <section className="relative bg-[#F9FAFB] border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enterprise */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.5 }} className="rounded-[2rem] border border-gray-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="size-12 rounded-2xl bg-[#3B5BDB]/10 flex items-center justify-center mb-5">
            <Building2 className="size-6 text-[#3B5BDB]" />
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Enterprise Solutions</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-3">Build Your Global Workforce with Confidence</h3>
          <p className="text-gray-500 leading-relaxed mb-6">Solve workforce challenges through talent, technology, operational support and intelligence.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
            {enterprise.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-gray-700"><Check className="mt-0.5 size-4 shrink-0 text-[#3B5BDB]" /><span>{e}</span></li>
            ))}
          </ul>
          <FluidCTA href="/companies/hire" size="md">Explore enterprise solutions</FluidCTA>
        </motion.div>

        {/* Government */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-[2rem] border border-transparent bg-[#3B5BDB] p-8 md:p-10 shadow-[0_24px_60px_rgba(59,91,219,0.28)]">
          <div className="size-12 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
            <Landmark className="size-6 text-white" />
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-2">Government & Institutions</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">Human Capital as Economic Infrastructure</h3>
          <p className="text-white/75 leading-relaxed mb-6">The most renewable asset any country possesses is its people. We help identify, develop, package and connect human capability to demand.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
            {government.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-white/90"><Check className="mt-0.5 size-4 shrink-0 text-white" /><span>{g}</span></li>
            ))}
          </ul>
          <Link href="/consulting" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 font-semibold text-[#3B5BDB] hover:bg-gray-100 transition-colors">
            Partner with us <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   FOUNDER'S MESSAGE
═══════════════════════════════════════════════════════ */
function FounderMessage() {
  return (
    <section className="relative bg-white border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer(0.12)}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.div variants={scaleIn()} className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#3B5BDB]/10 text-[#3B5BDB] mb-6">
          <Quote className="size-6" />
        </motion.div>
        <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-4">Founder&apos;s Message</motion.p>
        <motion.blockquote variants={fadeInUp()} className="font-serif text-2xl md:text-3xl leading-snug text-gray-900 tracking-tight text-balance">
          &ldquo;The problem was not always the absence of capability. It was the absence of trusted
          infrastructure connecting capability to demand. DeepTalent was created to help solve that
          problem.&rdquo;
        </motion.blockquote>
        <motion.p variants={fadeInUp()} className="mt-6 text-gray-500 leading-relaxed text-pretty">
          We want to help organisations build stronger workforces, professionals build better careers,
          and institutions turn human capital into economic growth — contributing to a world in which
          opportunity is determined less by geography and more by capability, integrity and potential.
        </motion.p>
        <motion.div variants={fadeInUp()} className="mt-8">
          <p className="font-bold text-gray-900">Joshua Omoniyi Raymond Onifade</p>
          <p className="text-sm text-gray-400">Founder &amp; Chief Executive Officer, DeepTalent Platform</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   VISION, MISSION, VALUES
═══════════════════════════════════════════════════════ */
function VisionValues() {
  const vmp = [
    { icon: Target, label: "Vision", text: "To become the global operating system for human capital — connecting talent, organisations and economies through trusted workforce infrastructure." },
    { icon: Rocket, label: "Mission", text: "To discover, develop, verify, deploy and manage exceptional talent across borders while helping organisations build future-ready workforces." },
    { icon: Lightbulb, label: "Purpose", text: "To unlock human potential and connect it to meaningful economic opportunity." },
  ];
  const values = [
    { icon: Star, label: "Excellence" },
    { icon: ShieldCheck, label: "Integrity" },
    { icon: Globe, label: "Opportunity" },
    { icon: Lightbulb, label: "Innovation" },
    { icon: Scale, label: "Accountability" },
    { icon: Heart, label: "Inclusion" },
    { icon: TrendingUp, label: "Impact" },
  ];
  return (
    <section className="relative bg-[#F9FAFB] border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.1)} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {vmp.map(({ icon: Icon, label, text }) => (
            <motion.div key={label} variants={fadeInUp()} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="size-11 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center mb-5">
                <Icon className="size-5 text-[#3B5BDB]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB]">Our Values</p>
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.05)} className="flex flex-wrap justify-center gap-3">
          {values.map(({ icon: Icon, label }) => (
            <motion.span key={label} variants={scaleIn()} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm">
              <Icon className="size-4 text-[#3B5BDB]" />
              {label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   FINAL CTA — closing band
═══════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="relative bg-white py-16 md:py-20 px-4 md:px-8 lg:px-12 border-t border-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6 }}
        className="relative max-w-6xl mx-auto overflow-hidden rounded-[2.5rem] bg-[#3B5BDB] px-6 md:px-14 py-14 md:py-20 text-center shadow-[0_30px_80px_rgba(59,91,219,0.3)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35) 0%, transparent 70%)" }} />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.05] text-balance max-w-3xl mx-auto">
            Build the workforce your ambition demands.
          </h2>
          <p className="mt-5 text-lg text-white/80 max-w-xl mx-auto text-pretty">
            Connect human potential to global opportunity — with infrastructure built for trust, scale
            and long-term performance.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/companies/hire" className="inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-[#3B5BDB] hover:bg-gray-100 transition-colors shadow-xl">
              Build your global workforce <ArrowRight className="size-5" />
            </Link>
            <Link href="/talents/apply" className="inline-flex h-13 items-center rounded-full border-2 border-white/40 px-8 py-3.5 font-bold text-white hover:bg-white/10 transition-colors">
              Join as talent
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "For Talents", href: "/talents" },
    { label: "For Companies", href: "/companies" },
    { label: "Consulting", href: "/consulting" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 z-50 w-[92%] max-w-7xl -translate-x-1/2 flex items-center justify-between rounded-2xl px-5 py-3 md:px-8 transition-all duration-300 border border-white/20 ${
        scrolled
          ? "bg-[#3B5BDB]/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(59,91,219,0.45)]"
          : "bg-[#3B5BDB]/75 backdrop-blur-lg shadow-[0_8px_32px_rgba(59,91,219,0.30)]"
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-xl bg-white px-2.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
          <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-7 w-auto" />
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 text-white/85 hover:text-white text-sm font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden md:inline-flex h-9 px-5 items-center justify-center rounded-full border border-white/40 bg-transparent text-white text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/companies/hire"
          className="inline-flex h-9 px-5 items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
        >
          Hire Talent
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 border-gray-200" />
              <Link href="/auth/login" className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">
                Login
              </Link>
              <Link href="/companies/hire" className="px-4 py-3 bg-[#3B5BDB] text-white rounded-lg font-semibold text-center">
                Hire Talent
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


/* ════════════════════════════════════════════════════
   LEARNING PARTNERSHIPS — platform logo matrix
════════════════════════════════════�����══════════════════ */
const GRID_COLS = 7;
const GRID_ROWS = 5;

const PLATFORM_LOGOS: Record<string, { src: string; name: string }> = {
  "0-1": { src: "/icons/platforms/microsoft.svg", name: "Microsoft" },
  "0-3": { src: "/icons/platforms/pytorch.svg", name: "PyTorch" },
  "0-5": { src: "/icons/platforms/databricks.svg", name: "Databricks" },
  "1-0": { src: "/icons/platforms/google.svg", name: "Google" },
  "1-6": { src: "/icons/platforms/nvidia.svg", name: "NVIDIA" },
  "2-0": { src: "/icons/platforms/kubernetes.svg", name: "Kubernetes" },
  "2-6": { src: "/icons/platforms/aws.svg", name: "AWS" },
  "3-0": { src: "/icons/platforms/huggingface.svg", name: "Hugging Face" },
  "3-6": { src: "/icons/platforms/meta.svg", name: "Meta" },
  "4-1": { src: "/icons/platforms/azure.svg", name: "Azure" },
  "4-3": { src: "/icons/platforms/github.svg", name: "GitHub" },
  "4-5": { src: "/icons/platforms/tensorflow.svg", name: "TensorFlow" },
};

/* Center block (cols 2–4, rows 1–3) left clear for the headline. */
function isTextZone(r: number, c: number) {
  return c >= 2 && c <= 4 && r >= 1 && r <= 3;
}

function LearningPartnerships() {
  const cells = Array.from({ length: GRID_COLS * GRID_ROWS });
  const logoList = Object.values(PLATFORM_LOGOS);

  return (
    <section className="relative bg-[#F9FAFB] border-t border-gray-200 py-20 md:py-28 px-4 md:px-8 lg:px-12 overflow-hidden">
      {/* Desktop: floating logo matrix with centered text */}
      <div className="hidden md:block relative max-w-6xl mx-auto h-[560px]">
        <div
          className="grid h-full w-full gap-4 lg:gap-6"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((_, i) => {
            const r = Math.floor(i / GRID_COLS);
            const c = i % GRID_COLS;
            if (isTextZone(r, c)) return <div key={i} />;

            const logo = PLATFORM_LOGOS[`${r}-${c}`];
            const delay = (r + c) * 0.05;

            if (logo) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 12 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0, margin: "0px 0px -120px 0px" }}
                  transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center"
                >
                  <div className="float-y size-16 lg:size-20 rounded-2xl bg-white flex items-center justify-center p-3.5 border border-gray-200 shadow-[0_10px_30px_rgba(17,24,39,0.08)]">
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="max-h-full max-w-full w-auto h-auto object-contain"
                    />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
                transition={{ duration: 0.3, delay }}
                className="flex items-center justify-center"
              >
                <div className="size-16 lg:size-20 rounded-2xl border border-gray-100 bg-gray-100/60" />
              </motion.div>
            );
          })}
        </div>

        {/* radial fade so the centered copy stays readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 42% 52% at 50% 50%, #F9FAFB 0%, #F9FAFB 42%, rgba(249,250,251,0.75) 62%, transparent 80%)",
          }}
        />

        {/* centered text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Talent Development</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug max-w-md text-balance mb-6">
            Talent developed and verified on the platforms and tools global employers actually run on.
          </h2>
          <Link
            href="/companies/hire"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition-colors shadow-lg"
          >
            Start Hiring
          </Link>
        </motion.div>
      </div>

      {/* Mobile: text + wrapped logos */}
      <div className="md:hidden max-w-md mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Talent Development</p>
        <h2 className="text-2xl font-bold text-gray-900 leading-snug text-balance mb-6">
          Talent developed and verified on the platforms and tools global employers actually run on.
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {logoList.map((logo) => (
            <div key={logo.name} className="size-14 rounded-2xl bg-white flex items-center justify-center p-3 border border-gray-200 shadow-[0_6px_20px_rgba(17,24,39,0.06)]">
              <img src={logo.src} alt={logo.name} className="max-h-full max-w-full w-auto h-auto object-contain" />
            </div>
          ))}
        </div>
        <Link href="/companies/hire" className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#111827] text-white text-sm font-semibold shadow-lg">Start Hiring</Link>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F8FF] pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-8 lg:px-12">
      {/* soft radial tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: "radial-gradient(60% 50% at 50% 0%, rgba(134,144,253,0.18) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ── Playful type-driven headline with floating 3D chips ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.08, 0.05)}
          className="relative"
        >
          {/* decorative sparkles */}
          <Sparkle className="left-[2%] top-[38%]" color="#22C55E" delay={0.2} />
          <Sparkle className="left-[16%] top-[86%]" color="#3B5BDB" delay={0.5} />
          <Sparkle className="right-[24%] top-[10%]" color="#F5B400" delay={0.35} />
          <Sparkle className="right-[6%] top-[70%]" color="#8690FD" delay={0.65} />

          <h1
            className="relative text-center text-[13vw] font-extrabold leading-[0.92] tracking-tight text-gray-900 sm:text-6xl md:text-7xl lg:text-[5.75rem]"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <motion.span variants={fadeInUp()}>The</motion.span>
              <motion.span variants={scaleIn()}>
                <ChipArrow />
              </motion.span>
              <motion.span variants={scaleIn()}>
                <ChipToggle />
              </motion.span>
              <motion.span variants={fadeInUp()}>infrastructure</motion.span>
            </span>
            <span className="mt-2 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <motion.span variants={fadeInUp()}>behind the</motion.span>
              <motion.span variants={scaleIn()}>
                <ChipYellow />
              </motion.span>
            </span>
            <span className="mt-2 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <motion.span variants={fadeInUp()} className="text-[#3B5BDB]">global</motion.span>
              <motion.span variants={scaleIn()}>
                <ChipCommand />
              </motion.span>
            </span>
            <span className="mt-2 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <motion.span variants={fadeInUp()}>workforce</motion.span>
              <motion.span variants={scaleIn()}>
                <ChipDot />
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={fadeInUp()}
            className="mx-auto mt-8 max-w-2xl text-pretty text-center text-base leading-relaxed text-gray-500 md:text-lg"
          >
            DeepTalent Platform helps enterprises, institutions and governments discover, verify,
            deploy and manage exceptional talent across borders — combining human expertise,
            technology and workforce intelligence to build agile, compliant and globally
            distributed teams with confidence.
          </motion.p>

          <motion.div
            variants={fadeInUp()}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/companies/hire"
              className="inline-flex h-12 items-center rounded-full bg-gray-900 px-8 font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
            >
              Build your global workforce
            </Link>
            <a
              href="#howItWorks"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 underline-offset-4 hover:underline"
            >
              Explore DeepTalent Platform <ArrowUpRight className="size-4" />
            </a>
          </motion.div>
        </motion.div>

        {/* ── Enhanced, interactive 3D showcase ── */}
        <Hero3DShowcase />
      </div>
    </section>
  );
}

/* ─── playful hero pieces ─── */

function Sparkle({ className, color, delay = 0 }: { className?: string; color: string; delay?: number }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute z-0 hidden size-5 md:block lg:size-6 ${className ?? ""}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.15, 1], opacity: 1, rotate: [0, 12, 0] }}
      transition={{ delay: 0.4 + delay, duration: 0.6, ease: "easeOut" }}
    >
      <path d="M12 0c.6 6 5.4 10.8 12 12-6.6 1.2-11.4 6-12 12-.6-6-5.4-10.8-12-12C6.6 10.8 11.4 6 12 0Z" fill={color} />
    </motion.svg>
  );
}

function ChipArrow() {
  return (
    <span className="inline-grid size-[0.95em] place-items-center rounded-full bg-emerald-500 align-middle shadow-lg shadow-emerald-500/30">
      <ArrowRight className="size-[0.5em] text-white" strokeWidth={3} />
    </span>
  );
}

function ChipToggle() {
  return (
    <span className="relative inline-flex h-[0.62em] w-[1.25em] items-center rounded-full bg-gradient-to-r from-[#3B5BDB] via-[#8690FD] to-[#F5B400] align-middle shadow-lg">
      <span className="absolute right-[0.06em] size-[0.5em] rounded-full bg-white shadow-md" />
    </span>
  );
}

function ChipYellow() {
  return (
    <span className="relative inline-flex items-center align-middle">
      <span className="inline-block size-[0.85em] rounded-full bg-[#F5B400] shadow-lg shadow-[#F5B400]/30" />
      <span className="ml-[-0.28em] inline-flex h-[0.5em] w-[1em] items-center rounded-full bg-white shadow-md ring-1 ring-gray-100">
        <span className="ml-[0.12em] block h-[0.14em] w-[0.5em] rounded-full bg-gray-300" />
      </span>
    </span>
  );
}

function ChipCommand() {
  return (
    <span className="relative inline-flex items-center align-middle">
      <span className="inline-block size-[0.9em] rounded-full bg-gradient-to-br from-[#8690FD] to-[#3B5BDB] opacity-90 shadow-lg" />
      <span className="ml-[-0.45em] grid size-[0.8em] place-items-center rounded-full bg-white shadow-md ring-1 ring-gray-100">
        <Command className="size-[0.42em] text-[#3B5BDB]" strokeWidth={2.5} />
      </span>
    </span>
  );
}

function ChipDot() {
  return (
    <span className="relative inline-flex h-[0.6em] w-[1.2em] items-center rounded-full bg-white align-middle shadow-md ring-1 ring-gray-200">
      <span className="absolute left-1/2 size-[0.42em] -translate-x-1/2 rounded-full bg-emerald-500" />
    </span>
  );
}

/** The kept 3D illustration, upgraded with perspective + pointer-driven parallax tilt. */
function Hero3DShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ ry: px * 12, rx: -py * 10 });
  }

  return (
    <motion.div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="relative mx-auto mt-12 max-w-5xl md:mt-16"
      style={{ perspective: "1200px" }}
    >
      {/* glow pad */}
      <div
        aria-hidden
        className="absolute inset-x-[10%] bottom-4 top-12 rounded-[40px] bg-gradient-to-br from-[#8690FD]/40 to-[#3B5BDB]/30 blur-3xl"
      />
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry, y: [0, -10, 0] }}
        transition={{
          rotateX: { type: "spring", stiffness: 120, damping: 15 },
          rotateY: { type: "spring", stiffness: 120, damping: 15 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative rounded-[32px] bg-white/70 p-3 shadow-2xl shadow-[#3B5BDB]/20 ring-1 ring-white/60 backdrop-blur-sm"
      >
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#F7F8FF] to-white" style={{ transform: "translateZ(40px)" }}>
          <Image
            src="/images/hero-img.png"
            alt="DeepTalent connects vetted specialists into your team"
            width={1200}
            height={600}
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        {/* floating 3D badges that lift off the surface */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(90px)" }}
          className="absolute -left-3 top-8 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ring-1 ring-gray-100 md:flex"
        >
          <span className="grid size-7 place-items-center rounded-full bg-emerald-100">
            <Check className="size-4 text-emerald-600" strokeWidth={3} />
          </span>
          <span className="text-xs font-semibold text-gray-800">AI-vetted talent</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(110px)" }}
          className="absolute -right-3 bottom-10 hidden items-center gap-2 rounded-2xl bg-[#3B5BDB] px-3 py-2 shadow-xl md:flex"
        >
          <Globe className="size-4 text-white" />
          <span className="text-xs font-semibold text-white">Hire in 40+ countries</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════���═════════════════════════════════════
   TRUSTED BY — marquee + Trustpilot
═══════════════════════════════════════════════════════ */
function TrustedBy() {
  const partners = [
    { id: 1, name: "Premium Trust Bank", image: "/icons/premium-trust.svg" },
    { id: 2, name: "MyGround Crew", image: "/icons/my-groud-crew.svg" },
    { id: 3, name: "Tulcan Energy", image: "/icons/tulcan-energy.svg" },
    { id: 4, name: "Prowin Services", image: "/icons/pro-win.svg" },
    { id: 5, name: "Omiomio TV", image: "/icons/omiomio-tv.svg" },
    { id: 6, name: "AL AHAD Group", image: "/icons/al-ahad.svg" },
    { id: 7, name: "Sterling Bank", image: "/icons/sterling-bank.svg" },
  ];

  return (
    <section className="py-16 border-t border-gray-200 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-1">
              Trusted By Leaders &amp; Brands
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Companies that trust DeepTalent
            </h2>
          </motion.div>

          {/* Trustpilot badge */}
          <motion.a
            href="https://www.trustpilot.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewport}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="inline-flex flex-col items-start gap-1.5 px-5 py-4 rounded-2xl border border-gray-200 bg-white hover:border-[#3B5BDB]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/>
              </svg>
              <span className="text-sm font-bold text-gray-900 tracking-wide">Trustpilot</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/>
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">4.8 / 5.0</span>
            </div>
            <p className="text-[10px] text-gray-400">Based on 120+ reviews</p>
          </motion.a>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden marquee-container">
        <div className="flex animate-marquee gap-10 w-max">
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="flex-shrink-0 flex items-center justify-center h-32 px-2">
              <div className="h-24 w-60 rounded-2xl bg-white border border-gray-200 flex items-center justify-center px-8 py-5 shadow-sm hover:shadow-lg hover:border-[#3B5BDB]/20 transition-all">
                <img
                  src={partner.image}
                  alt={partner.name}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full w-auto h-auto object-contain transition-transform hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SERVICE SHOWCASE — pinned scroll-through (light)
═══════════════════════════════════════════════════════ */
interface ServiceData {
  id: string;
  title: string;
  description: string;
  features: string[];
  illustration: string;
}

function ServiceShowcase() {
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: isDesktop ? containerRef : undefined,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const services: ServiceData[] = [
    {
      id: "finance",
      title: "Finance & Accounting",
      description: "Ensure financial accuracy and strategic insight with experienced finance professionals vetted at the highest standard.",
      features: ["Bookkeeping & Financial Reporting", "Accounts Payable & Receivable", "Financial Planning & Analysis", "Credit Risk Assessment", "KYC / AML Compliance", "External & Internal Audit"],
      illustration: "/images/accounting-illustration.png",
    },
    {
      id: "engineering",
      title: "Engineering & Cloud",
      description: "Build scalable applications and infrastructure with engineers experienced in modern systems and cloud environments.",
      features: ["Full Stack Application Development", "Cloud Infrastructure & DevOps", "API Development & Integration", "System Architecture Design", "CI/CD Pipeline Implementation", "Performance Optimization"],
      illustration: "/images/creative-roles-illustration.png",
    },
    {
      id: "data-ai",
      title: "Data & AI",
      description: "Turn data into insights and automate workflows using modern analytics and AI tools.",
      features: ["Data Analysis & Visualization", "Business Intelligence Dashboards", "AI Workflow Automation", "Predictive Reporting & Insights", "Data Cleaning & Transformation", "Process Automation Systems"],
      illustration: "/images/data-entry-illustration.png",
    },
    {
      id: "security",
      title: "Cybersecurity & Risk",
      description: "Protect systems and data with experts focused on security, compliance, and risk mitigation.",
      features: ["Threat Detection & Prevention", "Security Audits & Risk Assessment", "Compliance Monitoring", "Identity & Access Management", "Incident Response", "Vulnerability Testing"],
      illustration: "/images/ai-support-illustration.png",
    },
    {
      id: "operations",
      title: "Executive & Business Operations",
      description: "Streamline execution with experienced operators managing coordination, workflows, and executive support.",
      features: ["Executive Calendar & Priority Management", "Cross-Team Coordination", "Project & Task Oversight", "Operational Workflow Optimization", "Internal Communication Systems", "Process Documentation & Reporting"],
      illustration: "/images/virtual-assistant-illustration.png",
    },
    {
      id: "customer-support",
      title: "Customer Experience",
      description: "Deliver fast, reliable, and high-quality customer interactions that improve retention and satisfaction.",
      features: ["Multi-Channel Support", "Customer Success & Retention", "CRM Management & Optimization", "Customer Feedback Analysis", "Issue Resolution Handling", "Support Process Improvement"],
      illustration: "/images/customer-service-illustration.png",
    },
  ];

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(Math.floor(latest * services.length * 0.999), services.length - 1);
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, services.length]);

  const activeService = services[activeIndex];

  /* ── Mobile / tablet: clean stacked layout (no scroll-pinning) ── */
  if (!isDesktop) {
    return (
      <section id="services" className="relative bg-[#F9FAFB] border-t border-gray-200 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Industries</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
                Every Sector.<br />
                <span className="text-[#3B5BDB]">One Infrastructure.</span>
              </h2>
            <p className="text-gray-500 text-base mt-3 leading-relaxed">
              Access verified professionals across the sectors that power the global economy — each screened, scored and ready to integrate into your workflow immediately.
            </p>
          </div>

          <div className="space-y-5">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="relative h-40 bg-[#3B5BDB]/5 flex items-center justify-center">
                  <Image src={service.illustration} alt={service.title} width={240} height={240} className="max-h-full w-auto object-contain p-6" />
                  <span className="absolute top-4 left-4 font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                    0{i + 1} / 0{services.length}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-tight mb-2 text-gray-900">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>
                  <ul className="grid grid-cols-1 gap-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#3B5BDB]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <FluidCTA href="/companies/hire" size="md">Hire a Specialist</FluidCTA>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="relative bg-[#F9FAFB] border-t border-gray-200">
      <div ref={containerRef} style={{ height: `${services.length * 42}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.6 }}
              className="mb-10 max-w-2xl"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Industries</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-gray-900">
                Every Sector.<br />
                <span className="text-[#3B5BDB]">One Infrastructure.</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg mt-3 leading-relaxed">
              Access verified professionals across the sectors that power the global economy — each screened, scored and ready to integrate into your workflow immediately.
            </p>
          </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-8 lg:gap-14 items-stretch">
              {/* Left: service index navigator */}
              <ul className="flex flex-col gap-2 self-center">
                {services.map((s, i) => {
                  const active = i === activeIndex;
                  return (
                    <li key={s.id}>
                      <div
                        className={`relative flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-500 ${
                          active
                            ? "border-transparent bg-[#3B5BDB] shadow-[0_16px_40px_rgba(59,91,219,0.28)]"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <span className={`font-mono text-sm font-bold ${active ? "text-white/80" : "text-gray-400"}`}>
                          0{i + 1}
                        </span>
                        <span className={`text-base md:text-lg font-semibold tracking-tight ${active ? "text-white" : "text-gray-900"}`}>
                          {s.title}
                        </span>
                        {active && (
                          <motion.span
                            layoutId="svc-active-arrow"
                            className="ml-auto grid size-7 place-items-center rounded-full bg-white/20"
                          >
                            <ChevronRight className="size-4 text-white" />
                          </motion.span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Right: active service showcase panel */}
              <div className="relative min-h-[440px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_24px_60px_rgba(17,24,39,0.08)]"
                  >
                    {/* Illustration header */}
                    <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[#EEF1FF] to-white md:h-64">
                      <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${C.primary} 0%, transparent 60%)` }}
                      />
                      <span className="absolute left-6 top-6 font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                        0{activeIndex + 1} / 0{services.length}
                      </span>
                      <Image
                        src={activeService.illustration}
                        alt={activeService.title}
                        width={300}
                        height={300}
                        className="relative z-10 max-h-full w-auto object-contain p-6"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-7 md:p-8">
                      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.05)}>
                        <motion.h3 variants={fadeInUp()} className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                          {activeService.title}
                        </motion.h3>
                        <motion.p variants={fadeInUp()} className="mt-2 text-gray-500 leading-relaxed">
                          {activeService.description}
                        </motion.p>
                        <ul className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {activeService.features.map((feature) => (
                            <motion.li key={feature} variants={fadeInUp()} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="mt-0.5 size-4 shrink-0 text-[#3B5BDB]" />
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                      <div className="mt-auto pt-6">
                        <FluidCTA href="/companies/hire" size="md">
                          Hire a {activeService.title.split(" ")[0]} Specialist
                        </FluidCTA>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   GLOBE SECTION — dot-matrix wireframe globe (light)
═══════════════════════════════════════════════════════ */
function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const CITIES: [number, number, string][] = [
    [6.5244, 3.3792, "Lagos"],
    [-1.2921, 36.8219, "Nairobi"],
    [5.6037, -0.1870, "Accra"],
    [-25.7479, 28.2293, "Johannesburg"],
    [9.0579, 7.4951, "Abuja"],
    [51.5074, -0.1278, "London"],
    [40.7128, -74.0060, "New York"],
    [1.3521, 103.8198, "Singapore"],
    [25.2048, 55.2708, "Dubai"],
    [28.6139, 77.2090, "Delhi"],
    [14.7167, -17.4677, "Dakar"],
    [33.8869, 9.5375, "Tunis"],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rotation = 0;

    function latLngToXY(lat: number, lng: number, r: number, cx: number, cy: number, rot: number) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180 + rot * (180 / Math.PI)) * (Math.PI / 180);
      const x = cx + r * Math.sin(phi) * Math.cos(theta);
      const y = cy + r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      return { x, y, z };
    }

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      // Before the canvas has been sized/laid out, W/H can be 0, which makes
      // `r` 0 and every z/r ratio below NaN/Infinity — crashing
      // createRadialGradient. Skip the frame until we have real dimensions.
      if (W <= 0 || H <= 0) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const r = Math.min(W, H) * 0.38;
      if (!Number.isFinite(r) || r <= 0) return;

      const DOT_ROWS = 24;
      const DOT_COLS = 48;
      for (let row = 0; row <= DOT_ROWS; row++) {
        for (let col = 0; col <= DOT_COLS; col++) {
          const lat = -90 + (row / DOT_ROWS) * 180;
          const lng = -180 + (col / DOT_COLS) * 360;
          const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
          if (z < 0) continue;
          const opacity = 0.12 + (z / r) * 0.28;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59,91,219,${opacity})`;
          ctx.fill();
        }
      }

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 3) {
          const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
          if (z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
        ctx.strokeStyle = "rgba(59,91,219,0.1)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 3) {
          const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
          if (z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
        ctx.strokeStyle = "rgba(59,91,219,0.1)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      CITIES.forEach(([lat, lng, label]) => {
        const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
        if (z < -r * 0.1) return;
        // Clamp scale so glow/dot radii are always finite and positive —
        // createRadialGradient throws on any non-finite radius.
        const rawScale = 0.5 + (z / r) * 0.5;
        const scale = Number.isFinite(rawScale) ? Math.max(rawScale, 0.01) : 0.5;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 14 * scale);
        gradient.addColorStop(0, `rgba(59,91,219,${0.4 * scale})`);
        gradient.addColorStop(1, "rgba(59,91,219,0)");
        ctx.beginPath();
        ctx.arc(x, y, 14 * scale, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,91,219,${0.95 * scale})`;
        ctx.fill();

        if (scale > 0.65 && z > r * 0.2) {
          ctx.font = `bold ${Math.round(11 * scale)}px Inter, sans-serif`;
          ctx.fillStyle = `rgba(17,24,39,${0.8 * scale})`;
          const pad = 8;
          const tw = ctx.measureText(label).width;
          const rightX = x + 7 * scale;
          if (rightX + tw > W - pad) {
            // near the right edge — draw label to the left of the dot so it stays in view
            ctx.textAlign = "right";
            ctx.fillText(label, x - 7 * scale, y - 4 * scale);
            ctx.textAlign = "left";
          } else {
            ctx.fillText(label, rightX, y - 4 * scale);
          }
        }
      });

      rotation += 0.003;
      animRef.current = requestAnimationFrame(draw);
    }

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 border-t border-gray-200 relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-40" aria-hidden="true" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer(0.13)}
          >
            <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-3">
              Talent Corridors
            </motion.p>
            <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-5 text-balance">
              Connecting High-Potential Markets{" "}
              <span className="text-[#3B5BDB]">to Global Demand.</span>
            </motion.h2>
            <motion.p variants={fadeInUp()} className="text-gray-500 text-lg leading-relaxed mb-8">
              We develop focused talent corridors across Africa, Europe, Asia, Latin America, North America and the Middle East — positioning qualified professionals not as lower-cost labour, but as globally competitive contributors to innovation and growth.
            </motion.p>

            <motion.div variants={staggerContainer(0.1)} className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Globe, label: "6 Continents", desc: "Active talent corridors" },
                { icon: ShieldCheck, label: "Structured Vetting", desc: "Verified at every step" },
                { icon: Zap, label: "14–21 Days", desc: "Average deployment speed" },
                { icon: Users, label: "10,000+ Vetted", desc: "Professionals in network" },
              ].map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label}
                  variants={fadeInUp()}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="size-9 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-[#3B5BDB]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp()}>
              <FluidCTA href="/talents" size="md" variant="outline">
                Explore talent corridors
              </FluidCTA>
            </motion.div>
          </motion.div>

          {/* Globe canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewport}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] md:h-[520px] rounded-3xl border border-gray-200 bg-[#F9FAFB] overflow-hidden shadow-[0_20px_50px_rgba(17,24,39,0.06)]"
          >
            <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
              <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B5BDB]/40 to-transparent"
                animate={{ top: ["5%", "95%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
              />
            </div>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-label="Interactive globe showing talent locations" />
            <div className="absolute top-3 left-3 size-5 border-t-2 border-l-2 border-[#3B5BDB]/40 rounded-tl-lg" aria-hidden="true" />
            <div className="absolute top-3 right-3 size-5 border-t-2 border-r-2 border-[#3B5BDB]/40 rounded-tr-lg" aria-hidden="true" />
            <div className="absolute bottom-3 left-3 size-5 border-b-2 border-l-2 border-[#3B5BDB]/40 rounded-bl-lg" aria-hidden="true" />
            <div className="absolute bottom-3 right-3 size-5 border-b-2 border-r-2 border-[#3B5BDB]/40 rounded-br-lg" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   HOW IT WORKS — interactive card stack
═══════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { id: "step-1", n: "01", title: "Understand the Requirement", description: "We assess the role, team structure, business objectives, operating environment and success measures — then design the right workforce model, geography and commercial structure.", icon: FileText, image: "/images/direct-connection.png" },
    { id: "step-2", n: "02", title: "Source & Verify Talent", description: "We identify suitable professionals and complete structured assessment and verification across identity, skills, experience and work readiness before anyone reaches your shortlist.", icon: Users, image: "/images/global-talent-mapping.png" },
    { id: "step-3", n: "03", title: "Present & Select", description: "You receive carefully matched profiles aligned to technical and organisational needs. We coordinate interviews, assessment and final selection.", icon: ShieldCheck, image: "/images/upfront-compensation.png" },
    { id: "step-4", n: "04", title: "Deploy & Manage", description: "We support contracting, onboarding and documentation, then monitor performance and workforce success for the long term.", icon: Zap, image: "/images/illustration-72-hrs.png" },
  ];

  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: isDesktop ? containerRef : undefined, offset: ["start start", "end end"] });
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(Math.floor(latest * steps.length * 0.999), steps.length - 1);
      setActiveCard(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, steps.length]);

  /* ── Mobile / tablet: clean stacked step list ── */
  if (!isDesktop) {
    return (
      <section id="howItWorks" className="relative bg-[#F9FAFB] border-t border-gray-200 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              From Requirement to <span className="text-[#3B5BDB]">Deployment</span>
            </h2>
          </div>

          <div className="space-y-5">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="relative h-40 overflow-hidden bg-[#3B5BDB]/5">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-6" />
                    <div className="absolute top-4 left-4 size-10 rounded-xl bg-[#3B5BDB] flex items-center justify-center shadow-lg">
                      <Icon className="size-5 text-white" />
                    </div>
                    <span className="absolute top-4 right-4 font-mono text-3xl font-extrabold text-[#3B5BDB]/20">{item.n}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8">
            <FluidCTA href="/companies/hire" size="md">Start Hiring on DeepTalent</FluidCTA>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="howItWorks" className="relative bg-[#F9FAFB] border-t border-gray-200">
      <div ref={containerRef} style={{ height: `${steps.length * 60}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
              className="text-center mb-10 max-w-2xl mx-auto"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">How It Works</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.05]">
                From Requirement to{" "}
                <span className="text-[#3B5BDB]">Deployment</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-16 items-center">
              {/* Card stack — driven by scroll */}
              <div className="card-stack-scene relative h-[560px] flex items-center justify-center order-2 lg:order-1">
                {steps.map((item, i) => {
                  const offset = (i - activeCard + steps.length) % steps.length;
                  const isActive = offset === 0;
                  const zIndex = steps.length - offset;
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      animate={{
                        scale: isActive ? 1 : 1 - offset * 0.04,
                        y: offset * 18,
                        x: offset * 12,
                        rotateY: offset * -4,
                        opacity: offset > 2 ? 0 : 1,
                        zIndex,
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute w-full max-w-xl rounded-[2rem] border border-gray-200 bg-white overflow-hidden shadow-[0_24px_60px_rgba(17,24,39,0.1)]"
                    >
                      <div className="relative h-64 md:h-72 overflow-hidden bg-[#3B5BDB]/5">
                        <Image src={item.image} alt={item.title} fill className="object-contain p-8" />
                        <div className="absolute top-6 left-6 size-12 rounded-xl bg-[#3B5BDB] flex items-center justify-center shadow-lg">
                          <Icon className="size-6 text-white" />
                        </div>
                        <span className="absolute top-6 right-6 font-mono text-5xl font-extrabold text-[#3B5BDB]/20">{item.n}</span>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{item.title}</h3>
                        <p className="text-base md:text-lg text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Step nav (reflects scroll position) */}
              <div className="order-1 lg:order-2">
                <div className="space-y-3">
                  {steps.map((item, i) => (
                    <div
                      key={item.id}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                      style={{
                        borderColor: activeCard === i ? C.primary : C.border,
                        background: activeCard === i ? "rgba(59,91,219,0.04)" : "#ffffff",
                      }}
                    >
                      <div
                        className="size-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                        style={{
                          background: activeCard === i ? C.primary : "#F3F4F6",
                          color: activeCard === i ? "#ffffff" : C.body,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      </div>
                      <ChevronRight className="size-4 ml-auto shrink-0" style={{ color: activeCard === i ? C.primary : C.border }} />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-4">Keep scrolling to step through the process</p>

                <div className="mt-6">
                  <FluidCTA href="/companies/hire" size="md">Start Hiring on DeepTalent</FluidCTA>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════��═══════════════════════════
   WHY CHOOSE US — interactive card stack
═══════════════════════════════════════════════════════ */
function WhyChooseUs() {
  const reasons = [
    { id: "1", title: "Infrastructure, Not Transactions", description: "We build repeatable workforce systems — talent, trust, technology and management combined — not isolated placements you have to keep re-running.", image: "/images/vetting-quality.png", stat: "1", statLabel: "Connected platform" },
    { id: "2", title: "Workforce Quality", description: "Fewer than 8% of professionals are accepted. We prioritise capability, communication, professionalism and long-term performance through structured assessment.", image: "/images/speed-impact.png", stat: "<8%", statLabel: "Acceptance rate" },
    { id: "3", title: "Global Reach, Corridor Depth", description: "We maintain a global mandate while building deep knowledge within selected talent markets across six continents.", image: "/images/global-compliance.png", stat: "6", statLabel: "Talent corridors" },
    { id: "4", title: "Human Expertise & Technology", description: "We combine professional judgement with intelligent tools. AI enhances decisions on discovery, matching and analytics — human judgement stays central.", image: "/images/expertise-overhead.png", stat: "AI+", statLabel: "Human-led systems" },
  ];

  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: isDesktop ? containerRef : undefined, offset: ["start start", "end end"] });
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(Math.floor(latest * reasons.length * 0.999), reasons.length - 1);
      setActiveCard(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, reasons.length]);

  /* ── Mobile / tablet: clean stacked reason list ── */
  if (!isDesktop) {
    return (
      <section className="relative bg-white border-t border-gray-200 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Why DeepTalent</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
              Global Vision. Local Intelligence.<br />
              <span className="text-[#3B5BDB]">Trusted Execution.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Global workforce challenges are not solved by technology, databases or recruitment alone. DeepTalent combines institutional thinking with operational agility.
            </p>
          </div>

          <div className="space-y-5">
            {reasons.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200">
                      <span className="text-xl font-extrabold text-[#3B5BDB]">{item.stat}</span>
                      <span className="text-xs text-gray-600">{item.statLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <FluidCTA href="/companies/hire" size="md">Start Hiring on DeepTalent</FluidCTA>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white border-t border-gray-200">
      <div ref={containerRef} style={{ height: `${reasons.length * 60}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-10 md:max-w-3xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Why DeepTalent</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
                Global Vision. Local Intelligence.<br />
                <span className="text-[#3B5BDB]">Trusted Execution.</span>
              </h2>
              <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                Global workforce challenges are not solved by technology, databases or recruitment alone. DeepTalent combines institutional thinking with operational agility.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-16 items-center">
              {/* Card stack — driven by scroll */}
              <div className="card-stack-scene relative h-[560px] flex items-center justify-center">
                {reasons.map((item, i) => {
                  const offset = (i - activeCard + reasons.length) % reasons.length;
                  const isActive = offset === 0;
                  const zIndex = reasons.length - offset;
                  return (
                    <motion.div
                      key={item.id}
                      animate={{
                        scale: isActive ? 1 : 1 - offset * 0.04,
                        y: offset * 16,
                        x: offset * 10,
                        rotateY: offset * -4,
                        opacity: offset > 2 ? 0 : 1,
                        zIndex,
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute w-full max-w-xl rounded-[2rem] border border-gray-200 bg-white overflow-hidden shadow-[0_24px_60px_rgba(17,24,39,0.1)]"
                    >
                      <div className="relative h-64 md:h-72 overflow-hidden">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200">
                            <span className="text-3xl font-extrabold text-[#3B5BDB]">{item.stat}</span>
                            <span className="text-sm text-gray-600">{item.statLabel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{item.title}</h3>
                        <p className="text-base md:text-lg text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Card navigation (reflects scroll position) */}
              <div>
                <div className="space-y-4">
                  {reasons.map((item, i) => (
                    <div
                      key={item.id}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                      style={{
                        borderColor: activeCard === i ? C.primary : C.border,
                        background: activeCard === i ? "rgba(59,91,219,0.04)" : "#ffffff",
                      }}
                    >
                      <div
                        className="size-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                        style={{
                          background: activeCard === i ? C.primary : "#F3F4F6",
                          color: activeCard === i ? "#ffffff" : C.body,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      </div>
                      <ChevronRight className="size-4 ml-auto shrink-0" style={{ color: activeCard === i ? C.primary : C.border }} />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-4">Keep scrolling to reveal each reason</p>

                <div className="mt-6">
                  <FluidCTA href="/companies/hire" size="md">
                    Start Hiring on DeepTalent
                  </FluidCTA>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   STRATEGIC ADVANTAGES — pinned scroll-through (light)
══════════════════════════════����═══════════════════════ */
function StrategicAdvantages() {
  const advantages = [
    { title: "Access", description: "Reach qualified professionals far beyond the limitations of traditional local hiring markets, across multiple global talent corridors.", image: "/images/direct-connection.png" },
    { title: "Quality", description: "Engage talent through structured assessment and verification — identity, skills, experience, references and work readiness — before anyone reaches you.", image: "/images/upfront-compensation.png" },
    { title: "Speed", description: "Reduce the time required to identify, verify and deploy suitable professionals from months to weeks.", image: "/images/illustration-72-hrs.png" },
    { title: "Efficiency", description: "Create a more flexible and cost-effective workforce model without carrying the full burden of sourcing, onboarding and managing talent alone.", image: "/images/illustration-reading.png" },
    { title: "Risk Management", description: "Apply stronger vetting, documentation and operational oversight across every cross-border engagement.", image: "/images/global-talent-mapping.png" },
    { title: "Scalability & Partnership", description: "Expand teams in line with business demand and work with a managed workforce partner — not a transactional recruiter.", image: "/images/global-compliance.png" },
  ];

  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: isDesktop ? containerRef : undefined, offset: ["start start", "end end"] });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(Math.floor(latest * advantages.length * 0.999), advantages.length - 1);
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, advantages.length]);

  /* ── Mobile / tablet: clean stacked advantage list ── */
  if (!isDesktop) {
    return (
      <section className="relative bg-[#F9FAFB] border-t border-gray-200 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">The Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              The DeepTalent <span className="text-[#3B5BDB]">Advantage</span>
            </h2>
          </div>

          <div className="space-y-5">
            {advantages.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="relative h-40 bg-[#F9FAFB] flex items-center justify-center border-b border-gray-200">
                  <Image src={item.image} alt={item.title} width={240} height={240} className="max-h-full w-auto object-contain p-6" />
                  <span className="absolute top-4 left-4 font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                    0{i + 1} / 0{advantages.length}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <FluidCTA href="/companies/hire" size="lg">Start Hiring on DeepTalent</FluidCTA>
            <FluidCTA href="/talents" size="lg" variant="outline">View Talent Pool</FluidCTA>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[#F9FAFB] border-t border-gray-200">
      <div ref={containerRef} style={{ height: `${advantages.length * 42}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">The Advantage</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.05]">
                The DeepTalent <span className="text-[#3B5BDB]">Advantage</span>
              </h2>
            </motion.div>

            <div className="relative h-[440px] md:h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={advantages[activeIndex].title}
                  initial={{ opacity: 0, y: 60, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col md:flex-row gap-6 md:gap-12 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-[0_20px_60px_rgba(17,24,39,0.08)]"
                >
                  <div className="flex w-full flex-col justify-between md:w-5/12 order-2 md:order-1">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                          0{activeIndex + 1} / 0{advantages.length}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                      </div>
                      <motion.h3
                        key={`${advantages[activeIndex].title}-h`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight"
                      >
                        {advantages[activeIndex].title}
                      </motion.h3>
                      <motion.p
                        key={`${advantages[activeIndex].title}-p`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.18 }}
                        className="text-base md:text-lg text-gray-500 leading-relaxed"
                      >
                        {advantages[activeIndex].description}
                      </motion.p>
                    </div>
                    <div className="hidden md:block w-full mt-6">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((activeIndex + 1) / advantages.length) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((activeIndex + 1) / advantages.length) * 100}%` }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #3B5BDB, #8690FD)" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-7/12 h-44 md:h-full bg-[#F9FAFB] rounded-2xl overflow-hidden relative order-1 md:order-2 border border-gray-200">
                    <div className="relative h-full w-full flex items-center justify-center p-6 md:p-10">
                      <Image src={advantages[activeIndex].image} alt={advantages[activeIndex].title} width={400} height={400} className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6">
              {advantages.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === activeIndex ? 40 : 6, backgroundColor: i === activeIndex ? C.primary : C.border }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-12 md:py-16 px-4 md:px-8 lg:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center gap-4">
          <FluidCTA href="/companies/hire" size="lg">Start Hiring on DeepTalent</FluidCTA>
          <FluidCTA href="/talents" size="lg" variant="outline">View Talent Pool</FluidCTA>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   HUMAN LAYER — human expertise behind production AI
═══════════════════════════���═════════════════════���═════ */
function HumanLayer() {
  const floatCard = (delay: number) => ({
    initial: { opacity: 0, y: 24, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  const platformPills = [
    { src: "/icons/platforms/pytorch.svg", name: "PyTorch" },
    { src: "/icons/platforms/huggingface.svg", name: "Hugging Face" },
    { src: "/icons/platforms/tensorflow.svg", name: "TensorFlow" },
  ];

  return (
    <section className="relative bg-white py-20 md:py-28 px-4 md:px-8 lg:px-12 overflow-hidden border-t border-gray-200">
      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.6 }}
          className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.02] text-balance"
        >
          Technology That Strengthens
          <span className="block italic text-[#3B5BDB]">Human Decisions</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed text-pretty"
        >
          Our platform simplifies the workforce lifecycle — talent profiles, skills intelligence, automated screening, intelligent matching, analytics and reporting. AI enhances decision-making; human judgement remains central.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {["Intelligent matching & screening", "Workforce analytics & insights", "Human judgement at the core"].map((item) => (
            <span key={item} className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-gray-800">
              <Check className="size-4 text-[#3B5BDB]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Composition */}
      <div className="relative max-w-5xl mx-auto mt-16 h-[560px] sm:h-[520px]">
        {/* Central engineer card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-4 -translate-x-1/2 w-[280px] sm:w-[420px] md:w-[520px] h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(59,91,219,0.25)]"
        >
          <Image src="/images/software-dev.jpg" alt="DeepTalent machine learning engineer" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B5BDB]/50 via-transparent to-[#3B5BDB]/10" />

          {/* candidate match tag */}
          <motion.div {...floatCard(0.3)} className="absolute top-4 left-4 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Adaeze O.</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#3B5BDB]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3B5BDB]">
                <span className="size-1.5 rounded-full bg-[#3B5BDB]" /> 100% Match
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Machine Learning Engineer</p>
          </motion.div>

          {/* platform pills along the bottom */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-4">
            <motion.div {...floatCard(0.5)} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
              <img src={platformPills[0].src} alt={platformPills[0].name} className="size-4 object-contain" />
              <span className="text-xs font-semibold text-gray-800">{platformPills[0].name}</span>
            </motion.div>
            <motion.div {...floatCard(0.6)} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
              <img src={platformPills[2].src} alt={platformPills[2].name} className="size-4 object-contain" />
              <span className="text-xs font-semibold text-gray-800">{platformPills[2].name}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Training Course card (left) */}
        <motion.div {...floatCard(0.4)} className="absolute left-0 bottom-6 sm:bottom-16 w-[240px] rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_20px_50px_rgba(17,24,39,0.12)] float-y">
          <p className="text-sm font-bold text-gray-900 mb-4">AI Training Course</p>
          {[
            { label: "Prompt engineering", value: 100 },
            { label: "Agent orchestration", value: 76 },
          ].map((bar) => (
            <div key={bar.label} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600">{bar.label}</span>
                <span className="text-xs font-semibold text-gray-900">{bar.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bar.value}%` }}
                  viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#3B5BDB]"
                />
              </div>
            </div>
          ))}
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#3B5BDB] px-3 py-1.5 text-xs font-semibold text-white shadow">
            <Sparkles className="size-3" /> Reskill internal teams
          </span>
        </motion.div>

        {/* Revenue Ops Agent card (right) */}
        <motion.div {...floatCard(0.55)} className="absolute right-0 top-10 sm:top-20 w-[250px] rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_20px_50px_rgba(17,24,39,0.12)] float-y">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#3B5BDB]/10">
              <Sparkles className="size-3 text-[#3B5BDB]" />
            </span>
            <span className="text-sm font-semibold text-gray-900">Revenue Ops Agent</span>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <Paperclip className="size-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">H2 Churn Forecasting</p>
                <p className="text-[10px] text-gray-400">CSV · 1.43 KB</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-6 flex-1 rounded-md border border-gray-200" />
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-gray-100">
                <ArrowUp className="size-3.5 text-gray-500" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
        transition={{ duration: 0.6 }}
        className="mt-4 flex flex-wrap items-center justify-center gap-3"
      >
        <Link href="/companies/hire" className="inline-flex items-center h-12 px-8 rounded-full bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition-colors shadow-lg">
          Hire vetted staff
        </Link>
        <Link href="/auth/sign-up" className="inline-flex items-center h-12 px-8 rounded-full border border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:border-[#3B5BDB] hover:text-[#3B5BDB] transition-colors">
          Get a placement
        </Link>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════ */
function TestimonialCarousel() {
  const testimonials = [
    { id: "t1", quote: "DeepTalent transformed the way I run my business. The VA they matched me with was trained, proactive, and integrated into my workflow from day one. What impressed me most was the cost advantage — I'm getting Fortune-500-level support at half the traditional price.", name: "Dianitte Erilus", location: "Orlando, Florida, USA", title: "Founder & Operations Lead", initials: "DE", rating: 5 },
    { id: "t2", quote: "We needed reliable administrative and customer-support help, and DeepTalent delivered beyond expectations. Their talent is disciplined, well-trained, and incredibly responsive — exactly what a fast-moving hospitality brand like ours needs.", name: "CRI Lounge", location: "South Croydon, London, UK", title: "Hospitality & Events", initials: "CL", rating: 5 },
    { id: "t3", quote: "The operational burden in our clinic was overwhelming until DeepTalent stepped in. Their Executive Assistant support has completely reshaped our scheduling, client communication, and admin processes. Professional, discreet, tech-savvy, and consistent.", name: "Al Ahad MD", location: "Sharjah, Dubai, UAE", title: "Medical & Wellness Practice", initials: "AA", rating: 5 },
    { id: "t4", quote: "In social care, consistency and reliability are critical. DeepTalent helped us secure trained support staff who understood our compliance-heavy environment from day one. They've improved our documentation, scheduling, and family communication turnarounds significantly.", name: "Peculiar Care Home", location: "Erith, London, UK", title: "Social Care Management", initials: "PC", rating: 5 },
  ];

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-white overflow-hidden border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB]">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Loved by Users{" "}
              <span className="text-[#3B5BDB]">Around the World</span>
            </h2>
            <p className="text-gray-500 text-lg">See how DeepTalent is reshaping operations for businesses everywhere.</p>
          </div>
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm shrink-0">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/></svg>
            <div>
              <p className="text-sm font-bold text-gray-900">4.8 / 5.0</p>
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<svg key={i} viewBox="0 0 24 24" className="size-3" aria-hidden="true"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/></svg>))}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-[#3B5BDB]/30 hover:shadow-lg transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, i) => (<Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-5">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center bg-[#3B5BDB] text-white text-sm font-bold">{item.initials}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   INDUSTRY INSIGHTS — blog posts
═══════════════════════════════════════════════════════ */
function IndustryInsights() {
  const [posts, setPosts] = useState<Array<{
    id: string; slug: string; title: string; excerpt: string | null;
    category: string | null; cover_image_url: string | null;
    published_at: string | null; read_time_minutes: number | null;
  }>>([]);

  useEffect(() => {
    fetch("/api/public/blog?limit=4").then((r) => r.json()).then((j) => setPosts(j?.posts ?? [])).catch(() => setPosts([]));
  }, []);

  if (!posts.length) return null;

  const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
  const readLabel = (m: number | null) => (m ? `${m} min read` : "");
  const heroPost = posts[0];
  const recentPosts = posts.slice(1, 4);
  const heroImage = heroPost.cover_image_url || `https://placehold.co/1200x800/3B5BDB/FFFFFF?text=${encodeURIComponent(heroPost.category || "Insights")}`;

  return (
    <section id="insights" className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-[#F9FAFB] border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6"
        >
          <div className="max-w-2xl">
            <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-2">Insights</motion.p>
            <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-3">Ideas Shaping the Future of Work</motion.h2>
            <motion.p variants={fadeInUp()} className="text-gray-500 text-lg">Research and practical guidance on global workforce trends, human-capital infrastructure, cross-border hiring and talent-market economics.</motion.p>
          </div>
          <motion.div variants={fadeInUp()}>
            <FluidCTA href="/insights" size="md" variant="outline">View All Articles</FluidCTA>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewport} transition={{ duration: 0.6 }} className="lg:col-span-3">
            <Link href={`/insights/${heroPost.slug}`} className="block">
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-white group border border-gray-200 shadow-sm">
                <Image src={heroImage} alt={heroPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  {heroPost.category && (<span className="inline-block px-3 py-1 bg-[#3B5BDB] rounded-full text-xs font-medium mb-3 text-white">{heroPost.category}</span>)}
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{heroPost.title}</h3>
                  {heroPost.excerpt && (<p className="text-white/80 text-sm mb-3 line-clamp-2">{heroPost.excerpt}</p>)}
                  <p className="text-white/60 text-xs">{fmtDate(heroPost.published_at)}{readLabel(heroPost.read_time_minutes) ? ` · ${readLabel(heroPost.read_time_minutes)}` : ""}</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.1, 0.2)} className="lg:col-span-2 flex flex-col gap-5">
            <motion.div variants={fadeInUp()} className="flex items-center gap-2 mb-1">
              <div className="size-2 bg-[#3B5BDB] rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent Updates</span>
            </motion.div>
            {recentPosts.map((post) => (
              <motion.div key={post.id} variants={fadeInUp()}>
                <Link href={`/insights/${post.slug}`} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#3B5BDB]/30 hover:shadow-md transition-all">
                  <div className="flex-1">
                    {post.category && (<span className="inline-block px-2 py-0.5 bg-[#3B5BDB]/10 rounded text-xs font-medium text-[#3B5BDB] mb-2">{post.category}</span>)}
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h4>
                    <p className="text-gray-400 text-xs">{fmtDate(post.published_at)}{readLabel(post.read_time_minutes) ? ` · ${readLabel(post.read_time_minutes)}` : ""}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════ */
function FaqSection() {
  const faqs = [
    { question: "What is DeepTalent?", answer: "DeepTalent is a global Human Capital Infrastructure company — not a recruitment agency, freelance marketplace, outsourcing firm or job board. We help enterprises, institutions and governments discover, verify, deploy and manage exceptional talent across borders, combining human expertise, technology, workforce intelligence and managed services in one connected platform." },
    { question: "How does the vetting process work?", answer: "We use a proprietary mix of AI analysis and human expert review. Every candidate undergoes technical assessments, communication screening, and a past-performance audit before entering our network." },
    { question: "What are the fees for hiring?", answer: "We believe in transparency. Hirers pay a flat platform fee or a percentage markup depending on the engagement model. There are no hidden onboarding costs." },
    { question: "Is my data secure?", answer: "Absolutely. We use enterprise-grade encryption (SOC2 compliant standards) for all data, payments, and contract details. Your intellectual property and financial data are protected at all times." },
    { question: "Can specialists use our internal tools?", answer: "Yes. Our specialists are senior-level professionals accustomed to integrating into existing workflows. They work within your Slack, Jira, GitHub, or Linear environments from day one." },
    { question: "How are payments handled?", answer: "We act as the merchant of record. You receive one consolidated monthly invoice for all your talent in your preferred currency — USD, GBP, EUR, AUD, CAD, and more." },
    { question: "What if a match isn't the right fit?", answer: "We offer a 60-day free replacement guarantee. If a specialist is not the right fit within the first 60 days, we replace them at no additional cost — no questions asked." },
    { question: "Do you support full-time hiring?", answer: "Yes. While many engagements start as contracts, we offer a simple 'buy-out' clause if you wish to bring a DeepTalent specialist onto your internal payroll permanently." },
  ];

  const [openIndex, setOpenIndex] = useState(0);
  const midPoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midPoint);
  const rightColumn = faqs.slice(midPoint);

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-white border-t border-gray-200" id="faq">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <motion.div variants={scaleIn()} className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#3B5BDB]/10 text-[#3B5BDB] mb-6">
            <HelpCircle className="size-6" />
          </motion.div>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-5">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={fadeInUp()} className="text-gray-500 text-lg">
            Everything you need to know. Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="text-[#3B5BDB] underline underline-offset-2">Contact support.</Link>
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {[leftColumn, rightColumn].map((column, colIndex) => (
            <div key={colIndex} className="space-y-3">
              {column.map((faq, index) => {
                const actualIndex = colIndex === 0 ? index : index + midPoint;
                const isOpen = openIndex === actualIndex;
                return (
                  <motion.div
                    key={actualIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0, margin: "0px 0px -100px 0px" }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="rounded-2xl border transition-all duration-300"
                    style={{
                      borderColor: isOpen ? "rgba(59,91,219,0.4)" : C.border,
                      background: isOpen ? "rgba(59,91,219,0.03)" : "#ffffff",
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : actualIndex)}
                      className="flex items-center justify-between w-full p-5 text-left"
                    >
                      <span className="font-semibold pr-4 text-sm" style={{ color: isOpen ? C.primary : C.ink }}>
                        {faq.question}
                      </span>
                      <div className="flex-shrink-0 p-1 rounded-full transition-colors" style={{ background: isOpen ? "rgba(59,91,219,0.12)" : "#F3F4F6" }}>
                        {isOpen ? <Minus className="size-4 text-[#3B5BDB]" /> : <Plus className="size-4 text-gray-500" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-5 pb-5"
                        >
                          <p className="text-gray-500 leading-relaxed text-sm">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   FOOTER — fluid CTA banner
═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[#0B1220] text-gray-300">
      {/* Fluid CTA Banner */}
      <div className="relative py-24 px-4 md:px-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#3B5BDB]/20 blur-[80px]" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#8690FD] mb-4">
            Get Started
          </motion.p>
          <motion.h2
            variants={fadeInUp()}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 text-white text-balance"
          >
            Ready to Build Your Dream Team?
          </motion.h2>
          <motion.p
            variants={fadeInUp()}
            className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto"
          >
            Get matched with credentialled finance, compliance, and technology specialists from Africa&apos;s top talent pools — within 14–21 days.
          </motion.p>
          <motion.div variants={fadeInUp()} className="flex flex-col sm:flex-row gap-4 justify-center">
            <FluidCTA href="/companies/hire" size="lg">Start Hiring Now</FluidCTA>
            <FluidCTA href="/talents" size="lg" variant="outline">Explore Talent Pool</FluidCTA>
          </motion.div>
        </motion.div>
      </div>

      <div className="border-t border-white/10" />

      {/* Footer links */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-10 w-auto mb-5 brightness-0 invert" />
              <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
                DeepTalent platform connects top-tier professionals with global opportunities. Pre-vetted talent, transparent hiring.
              </p>
              <div className="flex gap-3">
                {[
                  { href: "https://x.com/deeptalentp", label: "X", icon: <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                  { href: "https://www.instagram.com/deeptalentplatform/", label: "Instagram", icon: <Instagram className="size-5" /> },
                  { href: "https://www.linkedin.com/company/deeptalentplatform/", label: "LinkedIn", icon: <Linkedin className="size-5" /> },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`DeepTalent on ${s.label}`} className="p-2 bg-white/10 rounded-lg hover:bg-[#3B5BDB] hover:text-white text-gray-300 transition-colors">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                {[{ label: "For Companies", href: "/companies" }, { label: "For Talents", href: "/talents" }, { label: "About Us", href: "/about" }, { label: "Hire Talent", href: "/companies/hire" }].map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {[{ label: "About", href: "/about" }, { label: "Help Center", href: "/contact" }, { label: "Apply as Talent", href: "/talents/apply" }, { label: "Contact", href: "/contact" }].map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400 text-sm"><Mail className="size-4" />Mail@deeptalentplatform.com</li>
                <li className="flex items-center gap-2 text-gray-400 text-sm"><Phone className="size-4" /><a href="tel:+447367638151" className="hover:text-white transition-colors">+44 7367 638151</a></li>
                <li className="flex items-start gap-2 text-gray-400 text-sm"><MapPin className="size-4 shrink-0 mt-0.5" /><span>London, Lagos, Dubai</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} DeepTalent Platform. All rights reserved.</p>
            <div className="flex gap-5 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
