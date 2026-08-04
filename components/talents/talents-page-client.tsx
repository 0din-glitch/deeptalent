"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SiteNavbar } from "@/components/site/site-navbar";
import { FluidCTA } from "@/components/site/fluid-cta";
import {
  Search,
  ChevronDown,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Globe2,
  DollarSign,
  CheckCircle2,
  BriefcaseBusiness,
  BarChart3,
  Layers,
  Cpu,
  TrendingUp,
  Quote,
  Calendar,
} from "lucide-react";

/* Google "G" mark */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.4z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.6-3.8-13.5-9.1l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/* ─── data ──────────────────────────────────────────────────────── */

const DISCIPLINES = [
  { label: "Finance & Accounting", icon: BarChart3, color: "#3B5BDB", bg: "#EEF1FF" },
  { label: "Compliance & Risk", icon: Shield, color: "#0EA5E9", bg: "#E0F4FF" },
  { label: "Technology & Eng.", icon: Cpu, color: "#7C3AED", bg: "#F3EDFF" },
  { label: "Data & Analytics", icon: TrendingUp, color: "#059669", bg: "#ECFDF5" },
  { label: "Product & Design", icon: Layers, color: "#EA580C", bg: "#FFF4ED" },
  { label: "Operations", icon: BriefcaseBusiness, color: "#CA8A04", bg: "#FEFCE8" },
];

const FEATURES = [
  {
    tag: "AI-Powered Matching",
    title: "Matched to roles by your credentials, not keywords",
    desc: "Our AI maps your verified experience against live company briefs and surfaces curated opportunities — no cold applications, no bidding wars.",
    mockup: (
      <div className="rounded-xl bg-white border border-gray-100 shadow p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-[#3B5BDB] flex items-center justify-center text-white font-bold text-[9px]">DT</div>
          <div>
            <p className="font-semibold text-gray-900">Deep Talent Match</p>
            <p className="text-gray-400 text-[10px]">Finance Analyst · FinTech London</p>
          </div>
          <span className="ml-auto px-2 py-0.5 bg-[#3B5BDB] text-white rounded-full text-[9px] font-bold">97% fit</span>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {["FP&A", "Excel", "Python", "IFRS"].map((t) => (
            <span key={t} className="px-2 py-0.5 bg-[#EEF1FF] text-[#3B5BDB] rounded-full text-[9px] font-medium">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: "Instant Alerts",
    title: "Real-time alerts when a matching brief goes live",
    desc: "The moment a company brief matches your profile, you get notified. Stay ahead with instant, relevant opportunities.",
    mockup: (
      <div className="rounded-xl bg-white border border-gray-100 shadow p-4 space-y-2.5 text-xs">
        {[
          { role: "KYC / AML Analyst", co: "Global Bank · Remote", time: "Just now", dot: "bg-green-400" },
          { role: "Full-Stack Developer", co: "FinTech · New York", time: "2 min ago", dot: "bg-blue-400" },
          { role: "FP&A Analyst", co: "PE Fund · London", time: "5 min ago", dot: "bg-[#3B5BDB]" },
        ].map((n) => (
          <div key={n.role} className="flex items-center gap-2">
            <span className={`size-1.5 rounded-full shrink-0 ${n.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{n.role}</p>
              <p className="text-gray-400 text-[10px]">{n.co}</p>
            </div>
            <span className="text-gray-300 text-[10px] shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "One-Click Apply",
    title: "Apply to ideal roles instantly with your verified profile",
    desc: "Your profile is your application. Once vetted, a single click puts you in front of the client — no covering letters or duplicate forms.",
    mockup: (
      <div className="rounded-xl bg-white border border-gray-100 shadow p-4 text-xs">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900">Senior Credit Analyst</p>
          <span className="text-[10px] bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">Full-time · Remote</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
          <div className="h-full w-3/4 bg-[#3B5BDB] rounded-full" />
        </div>
        <p className="text-gray-400 text-[10px] mb-3">Profile completion: 75% — add your certifications to reach 100%.</p>
        <button className="w-full py-1.5 bg-[#3B5BDB] text-white rounded-lg font-semibold text-[10px]">Apply with DeepTalent Profile</button>
      </div>
    ),
  },
  {
    tag: "Smart Recommendations",
    title: "Intelligent recommendations based on your full profile",
    desc: "The more you engage, the smarter the matching. Our system learns from your preferences, credentials, and activity to surface better opportunities over time.",
    mockup: (
      <div className="rounded-xl bg-white border border-gray-100 shadow p-4 space-y-2 text-xs">
        <p className="font-semibold text-gray-900 mb-2">Recommended for you</p>
        {[
          { role: "DevOps Engineer", sal: "$7,560/mo", match: "94%" },
          { role: "BI Analyst", sal: "$5,250/mo", match: "88%" },
          { role: "Data Analyst", sal: "$5,040/mo", match: "81%" },
        ].map((r) => (
          <div key={r.role} className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-[#EEF1FF] flex items-center justify-center">
              <Zap className="size-2.5 text-[#3B5BDB]" />
            </div>
            <p className="flex-1 font-medium text-gray-700">{r.role}</p>
            <span className="text-[#3B5BDB] font-semibold">{r.match}</span>
            <span className="text-gray-400">{r.sal}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const FAQS = [
  {
    q: "How does DeepTalent's vetting process work?",
    a: "We review your credentials, work history, and domain competency through a structured multi-stage assessment. Fewer than 8% of applicants are accepted, ensuring every profile in the network is genuinely world-class.",
  },
  {
    q: "Do I need to find roles myself after applying?",
    a: "No. DeepTalent is a fully managed placement partner. Once your profile is approved, our AI system matches you against live company briefs and presents curated opportunities directly to you.",
  },
  {
    q: "Is the platform free for job seekers?",
    a: "Yes, completely. There is no cost for talent applicants at any stage — application, vetting, placement, or ongoing support.",
  },
  {
    q: "How long does placement typically take?",
    a: "Our average time from profile approval to first placement is 14–21 days. Active briefs move quickly; keeping your profile complete dramatically shortens this window.",
  },
  {
    q: "Are salary ranges truly published in advance?",
    a: "Yes. Every monthly USD compensation range — by role and seniority level — is published on our salary scale before you apply. You will never negotiate blind.",
  },
];

const TESTIMONIALS = [
  {
    name: "Jerome Plesant",
    title: "FP&A Analyst · placed at a London PE fund",
    quote: "Finding the right talent used to be a headache. DeepTalent made it incredibly easy — I had my first matching brief within 10 days of approval. The salary transparency alone was worth it.",
    avatar: "/images/consulting/pro-1.png",
  },
  {
    name: "Thibaud Beaudin",
    title: "Full-Stack Developer · placed remotely at a New York FinTech",
    quote: "Our employees are the best — driven by passion, accuracy, and dedication to deliver exceptional work. I wouldn't have found this opportunity without DeepTalent's network.",
    avatar: "/images/consulting/pro-7.png",
  },
  {
    name: "Amara Osei",
    title: "KYC / AML Analyst · placed at a global compliance team",
    quote: "The vetting process is rigorous, but that's exactly the point. Being in a selective network means every opportunity I receive is worth taking seriously.",
    avatar: "/images/consulting/pro-3.png",
  },
];

const SALARY_TABLE = [
  { role: "Finance Analyst (FP&A)", junior: 4900, mid: 6650, senior: 9450 },
  { role: "KYC / AML Analyst", junior: 3150, mid: 4200, senior: 5600 },
  { role: "Full-Stack Developer", junior: 4760, mid: 6930, senior: 9450 },
  { role: "Cybersecurity Analyst", junior: 4550, mid: 6160, senior: 8400 },
  { role: "DevOps / Cloud Engineer", junior: 5460, mid: 7560, senior: 10500 },
  { role: "Product Manager", junior: 5600, mid: 8050, senior: 11200 },
];

/* ─── hero ───────────────────────────────────────────────────────── */

function TalentHero() {
  return (
    <section className="relative bg-white overflow-hidden pt-28 lg:pt-32 pb-12">
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 lg:gap-6 items-center">
        {/* Left copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[clamp(2.75rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-gray-900 mb-4 text-balance"
          >
            Get <span className="text-[#3B5BDB]">Hired</span> Faster
            <br className="hidden sm:block" /> and Smarter
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md mb-8 text-pretty"
          >
            Browse, search and apply for global roles easily — matched to your credentials, not keywords.
          </motion.p>

          {/* Search card */}
          <motion.form
            action="/talents/apply"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-stretch gap-3 bg-white rounded-[1.75rem] border border-gray-200 shadow-[0_20px_50px_rgba(17,24,39,0.08)] p-3 max-w-xl"
          >
            <label className="flex items-center gap-3 flex-1 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors">
              <span className="grid size-9 place-items-center rounded-xl bg-gray-900 shrink-0">
                <BriefcaseBusiness className="size-4 text-white" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[11px] font-semibold text-gray-400">Search</span>
                <input
                  type="text"
                  name="q"
                  placeholder="Job title or keyword"
                  className="w-full text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 bg-transparent"
                />
              </span>
            </label>

            <div className="hidden sm:block w-px my-2 bg-gray-100" />

            <label className="flex items-center gap-3 flex-1 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors">
              <span className="grid size-9 place-items-center rounded-xl bg-gray-100 shrink-0">
                <Globe2 className="size-4 text-gray-500" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[11px] font-semibold text-gray-400">Location</span>
                <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  Select location <ChevronDown className="size-3.5 text-gray-400" />
                </span>
              </span>
            </label>

            <button
              type="submit"
              aria-label="Search roles"
              className="grid place-items-center h-12 sm:h-auto sm:w-14 rounded-2xl bg-gray-900 text-white hover:bg-gray-700 transition-colors shrink-0"
            >
              <Search className="size-5" />
            </button>
          </motion.form>

          {/* Start your career pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 inline-flex flex-col gap-3"
          >
            <div className="inline-flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-2.5 w-fit">
              <span className="grid size-9 place-items-center rounded-xl bg-white shadow-sm">
                <Layers className="size-4 text-gray-900" />
              </span>
              <span className="text-sm">
                <span className="block text-[11px] text-gray-400 font-medium">Start Your</span>
                <span className="block font-semibold text-gray-900 -mt-0.5">Career</span>
              </span>
            </div>
            <Link href="#how-it-works" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#3B5BDB] transition-colors">
              How it works <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>

        {/* Right — woman image + accents + stats bracket */}
        <div className="relative order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto max-w-md lg:max-w-none"
          >
            {/* Framed, rounded image card */}
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-br from-[#EEF1FF] via-white to-[#F4F6FF] shadow-[0_24px_60px_rgba(17,24,39,0.12)]">
              {/* soft decorative blobs behind the subject */}
              <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[#8690FD]/25 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 -left-8 size-40 rounded-full bg-[#3B5BDB]/15 blur-2xl" />
              <img
                src="/images/talents/hero-woman.png"
                alt="A professional browsing roles on DeepTalent"
                className="relative z-10 w-full h-auto object-contain select-none"
              />
            </div>

            {/* floating dark icon (top-left, lifts off the frame) */}
            <div className="absolute -top-4 left-4 grid size-12 place-items-center rounded-2xl bg-gray-900 shadow-xl ring-4 ring-white">
              <BriefcaseBusiness className="size-5 text-white" />
            </div>

            {/* colorful app accent (top right) */}
            <div className="absolute top-6 -right-3 grid size-11 place-items-center rounded-full bg-white shadow-xl ring-1 ring-gray-100">
              <span
                className="block size-5 rounded-full"
                style={{ background: "conic-gradient(from 90deg, #EA4335, #FBBC05, #34A853, #4285F4, #EA4335)" }}
              />
            </div>

            {/* Floating overlay: new match notification */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 left-3 top-24 hidden sm:flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-gray-100"
            >
              <span className="grid size-9 place-items-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-gray-900">New match</span>
                <span className="block text-xs text-gray-400">Finance Analyst · Remote</span>
              </span>
            </motion.div>

            {/* Floating overlay: application progress */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 right-3 bottom-24 hidden sm:block rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-gray-100 w-44"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Profile strength</span>
                <span className="text-xs font-bold text-[#3B5BDB]">92%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#8690FD]"
                />
              </div>
            </motion.div>

            {/* Floating overlay: rating chip */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 right-6 -bottom-4 flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-2 shadow-xl"
            >
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">4.9 talent rating</span>
            </motion.div>
          </motion.div>

          {/* Stats bracket */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mt-2"
          >
            <div className="mx-auto h-4 w-3/4 border-x border-t border-gray-200 rounded-t-md" />
            <div className="flex items-start justify-center gap-10 sm:gap-16 pt-3">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">50K+</p>
                <p className="text-xs text-gray-500 mt-1">Active job seekers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">20K+</p>
                <p className="text-xs text-gray-500 mt-1">Verified companies</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Kickstart with AI (gradient promo + stacked search cards) ──── */

function KickstartAI() {
  const [tab, setTab] = useState(0);
  const tabs = ["Remote", "Freelance", "Onsite"];
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-6 rounded-[2rem] overflow-hidden">
          {/* Gradient promo panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="relative p-8 lg:p-10 flex flex-col justify-center text-white rounded-[2rem]"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 45%, #F97316 100%)" }}
          >
            <span className="inline-flex w-fit items-center rounded-full border border-white/40 px-3 py-1 text-xs font-semibold">
              Best Recommendation Job
            </span>
            <h2 className="mt-5 text-4xl lg:text-5xl font-extrabold leading-[0.98] tracking-tight text-balance">
              Kickstart your career with AI technology!
            </h2>
            <p className="mt-4 text-white/85 leading-relaxed max-w-sm text-pretty">
              AI enhances innovation, boosts productivity, and improves job satisfaction by streamlining the search process for professionals.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/talents/apply" className="h-11 px-6 inline-flex items-center rounded-full bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 transition-colors">
                Get Started Now
              </Link>
              <Link href="#how-it-works" className="h-11 px-6 inline-flex items-center rounded-full border border-white/50 text-white text-sm font-bold hover:bg-white/10 transition-colors">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Stacked search-card mockups */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative min-h-[340px] bg-gray-50 rounded-[2rem] p-6 flex items-center"
          >
            {/* back card */}
            <div className="absolute right-6 top-6 bottom-10 left-16 rotate-[-6deg] rounded-3xl bg-white/70 border border-gray-100 shadow-sm" />
            {/* front card */}
            <div className="relative w-full rounded-3xl bg-white border border-gray-100 shadow-[0_24px_60px_rgba(17,24,39,0.12)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="grid size-9 place-items-center rounded-xl bg-gray-900">
                  <Zap className="size-4 text-white" />
                </span>
                <p className="font-bold text-gray-900">AI for Recommendation Jobs</p>
              </div>
              <div className="flex gap-1 rounded-full bg-gray-100 p-1 mb-5">
                {tabs.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                      tab === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">Location</p>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700">
                    <Globe2 className="size-4 text-gray-400" /> Lagos, Nigeria
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">Job name</p>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700">
                    <BriefcaseBusiness className="size-4 text-gray-400" /> Finance Analyst
                  </div>
                </div>
                <Link href="/talents/apply" className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
                  <Zap className="size-4" /> Search Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── New Startups (carousel of hiring startups) ────────────────── */

const STARTUPS = [
  { name: "Evolve Credit", jobs: 5, desc: "Helping financial institutions launch and manage credit ventures.", mode: "Remote", loc: "Wilmington", color: "#0EA5E9", icon: BarChart3, dark: false },
  { name: "GLO", jobs: 2, desc: "GLO helps elevate daily life through mindful wellness.", mode: "On-site", loc: "California", color: "#22C55E", icon: TrendingUp, dark: false },
  { name: "Eversend", jobs: 8, desc: "Eversend makes transfers, investments, and spending simple.", mode: "Hybrid", loc: "England", color: "#7C3AED", icon: DollarSign, dark: false },
  { name: "Flux", jobs: 7, desc: "Flux scales from quick prototypes to production-ready systems.", mode: "Hybrid", loc: "Japan", color: "#111827", icon: Zap, dark: true },
  { name: "HabariPay", jobs: 3, desc: "HabariPay transforms digital payments with advanced technology.", mode: "Remote", loc: "Nigeria", color: "#EF4444", icon: Cpu, dark: false },
];

function NewStartups() {
  const [page, setPage] = useState(0);
  const perPage = 5;
  const totalPages = Math.ceil(STARTUPS.length / perPage);
  const paginate = (dir: number) => setPage((p) => (p + dir + totalPages) % totalPages);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[300px_1fr] gap-10 items-start">
        {/* Left heading */}
        <div className="lg:sticky lg:top-28">
          <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[0.95] mb-5">
            New<br />Startups
          </h2>
          <p className="text-gray-500 leading-relaxed max-w-xs mb-8 text-pretty">
            Discover innovative startups and find the role that matches your passion.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous startups"
              className="grid size-10 place-items-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-colors"
            >
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next startups"
              className="grid size-12 place-items-center rounded-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {STARTUPS.slice(page * perPage, page * perPage + perPage).map((s) => (
              <div
                key={s.name}
                className={`rounded-3xl p-6 flex flex-col transition-shadow hover:shadow-lg ${
                  s.dark ? "bg-gray-950 text-white" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="grid size-11 place-items-center rounded-full"
                    style={{ backgroundColor: s.dark ? "#ffffff" : s.color + "1A" }}
                  >
                    <s.icon className="size-5" style={{ color: s.dark ? s.color : s.color }} />
                  </span>
                  <span className={`text-sm font-semibold ${s.dark ? "text-white/60" : "text-gray-400"}`}>{s.jobs} jobs</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                <p className={`text-sm leading-relaxed mb-6 flex-1 ${s.dark ? "text-white/60" : "text-gray-500"}`}>{s.desc}</p>
                <div className={`flex items-center gap-4 text-xs font-medium ${s.dark ? "text-white/70" : "text-gray-500"}`}>
                  <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="size-3.5" /> {s.mode}</span>
                  <span className="inline-flex items-center gap-1.5"><Globe2 className="size-3.5" /> {s.loc}</span>
                </div>
              </div>
            ))}

            {/* Explore all card */}
            <Link
              href="/talents/apply"
              className="rounded-3xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-gray-900 transition-colors group"
            >
              <p className="text-4xl font-extrabold text-gray-900">180+</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-600 group-hover:text-[#3B5BDB]">
                Explore all startups <ArrowRight className="size-4" />
              </p>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Trusted-by footer strip ───────────────────────────────────── */

function TrustedFooter() {
  const logos = [
    { name: "Premium Trust Bank", image: "/icons/premium-trust.svg" },
    { name: "MyGround Crew", image: "/icons/my-groud-crew.svg" },
    { name: "Tulcan Energy", image: "/icons/tulcan-energy.svg" },
    { name: "Prowin Services", image: "/icons/pro-win.svg" },
    { name: "Omiomio TV", image: "/icons/omiomio-tv.svg" },
    { name: "Sterling Bank", image: "/icons/sterling-bank.svg" },
  ];
  return (
    <footer className="py-16 bg-[#F9FAFB] border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-10 text-balance">
          Trusted by <span className="inline-flex items-center rounded-xl bg-gray-900 text-white px-3 py-1 mx-1">500+</span> companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70 grayscale mb-10">
          {logos.map((c) => (
            <img key={c.name} src={c.image} alt={c.name} className="h-7 w-auto object-contain" loading="lazy" />
          ))}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Excellent</span>
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-[#00B67A] text-[#00B67A]" />
            ))}
          </span>
          <span className="text-xs text-gray-400">390 reviews on Trustpilot</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── features (VeroApp 4-up grid) ──────────────────────────────── */

function FeaturesGrid() {
  return (
    <section className="py-20 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[#3B5BDB] text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="size-3.5" /> Features
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-balance">
            All the Tools you need to<br />land the right role
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-pretty">
            Empowering credentialled professionals with intelligent features to simplify placement and connect with top global opportunities effortlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="inline-block px-3 py-1 bg-[#EEF1FF] text-[#3B5BDB] text-[11px] font-bold rounded-full mb-4">
                {f.tag}
              </span>
              <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
              <div className="bg-[#F9FAFB] rounded-xl p-3">{f.mockup}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── orbit / skill-wheel (NextHire) ────────────────────────────── */

function SkillOrbit() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-5 text-balance">
            Explore Opportunities Matched Perfectly To Your Skills, Credentials, And Goals
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8 text-pretty">
            Our AI analyses your full profile — experience, certifications, seniority, and preferences — to find roles that fit you exactly, not just your resume headline.
          </p>
          <FluidCTA href="/talents/apply" size="md">
            Build your profile
          </FluidCTA>
        </motion.div>

        {/* Right — discipline orbit rings */}
        <div className="relative flex items-center justify-center h-64 lg:h-80">
          {/* Orbit rings */}
          <div className="absolute size-56 lg:size-72 rounded-full border border-dashed border-gray-200" />
          <div className="absolute size-40 lg:size-52 rounded-full border border-dashed border-gray-100" />

          {/* Centre */}
          <div className="relative z-10 size-20 rounded-full bg-[#3B5BDB] flex items-center justify-center shadow-[0_16px_40px_rgba(59,91,219,0.35)]">
            <Star className="size-8 text-white" strokeWidth={1.5} />
          </div>

          {/* Discipline pills around the orbit */}
          {DISCIPLINES.map((d, i) => {
            const angle = (i / DISCIPLINES.length) * 2 * Math.PI - Math.PI / 2;
            const R = 115;
            const x = Math.cos(angle) * R;
            const y = Math.sin(angle) * R;
            return (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="absolute flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm text-xs font-semibold text-gray-700 whitespace-nowrap"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <d.icon className="size-3.5 shrink-0" style={{ color: d.color }} />
                {d.label}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── profile showcase (NextHire talent card) ───────────────────── */

function TalentProfileCard() {
  return (
    <section className="py-20 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Mock profile card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
        >
          {/* Top bar */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-medium">
            <Globe2 className="size-3.5" />
            Connect with vetted professionals who bring expertise, creativity, and dedication to your team.
          </div>
          {/* Skills bar */}
          <div className="flex flex-wrap gap-2 px-5 py-4 border-b border-gray-100">
            {["Figma", "Prototyping", "Design Systems", "Interaction Design", "Wireframing", "User Research", "Usability Testing"].map((s, i) => (
              <span
                key={s}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                  i === 1 ? "bg-[#3B5BDB] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          {/* Profile row + placements list */}
          <div className="grid grid-cols-5 divide-x divide-gray-100">
            {/* left: avatar */}
            <div className="col-span-2 p-5 flex flex-col items-center text-center gap-3">
              <img src="/images/consulting/pro-2.png" alt="Profile" className="size-16 rounded-full object-cover border-4 border-white shadow" />
              <div>
                <div className="text-xs font-bold text-gray-900 mb-0.5">Kwame Asante</div>
                <div className="text-[10px] text-gray-400">UX / UI Designer</div>
              </div>
              <span className="px-3 py-1 bg-[#EEF1FF] text-[#3B5BDB] text-[10px] font-bold rounded-full">Available for Work</span>
              <Link href="/talents/apply" className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-900 text-white text-[11px] font-semibold rounded-xl hover:bg-gray-700 transition-colors">
                Contact Me <ArrowRight className="size-3" />
              </Link>
            </div>
            {/* right: role history */}
            <div className="col-span-3 p-5 space-y-4">
              {[
                { role: "Product Designer", year: "2023", active: true },
                { role: "UI / UX Designer", year: "2020", active: false },
                { role: "Junior Visual Designer", year: "2018", active: false },
              ].map((r) => (
                <div key={r.role} className={`flex items-center justify-between text-xs py-2 border-b border-gray-50 ${r.active ? "font-bold text-gray-900" : "text-gray-500"}`}>
                  <span>{r.role}</span>
                  <span className="text-gray-400">{r.year}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight text-balance">
            A Smarter And Faster Way To Get Placed Into Global Roles
          </h2>
          <div className="space-y-5">
            {[
              { label: "Verified Profile", desc: "Your credentials, work history, and competencies are verified and visible to hiring companies — no cold pitching required." },
              { label: "Thousands of Opportunities", desc: "Access a rich ecosystem of global financial services, FinTech, and technology opportunities you would never reach alone." },
              { label: "Easy Application Process", desc: "Our streamlined application lets you submit your profile and preferences in under five minutes, with automatic saving." },
              { label: "Career Support", desc: "From interview preparation to compensation advice, DeepTalent supports you through every step of the process." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="mt-0.5 size-5 rounded-full bg-[#EEF1FF] flex items-center justify-center shrink-0">
                  <ArrowRight className="size-3 text-[#3B5BDB]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── salary transparency table ─────────────────────────────────── */

function SalarySection() {
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#3B5BDB] text-xs font-bold uppercase tracking-widest mb-4">
            <DollarSign className="size-3.5" /> Full Salary Transparency
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-balance">
            Know What You Can Earn Before You Apply
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-pretty">
            We publish every monthly USD compensation range by seniority level — no guesswork, no negotiating blind.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#3B5BDB] text-white">
                <th className="px-5 py-4 text-left font-semibold rounded-tl-2xl">Role</th>
                <th className="px-5 py-4 text-right font-semibold">Junior</th>
                <th className="px-5 py-4 text-right font-semibold">Mid</th>
                <th className="px-5 py-4 text-right font-semibold rounded-tr-2xl">Senior</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_TABLE.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{row.role}</td>
                  <td className="px-5 py-3.5 text-right text-gray-500">{fmt(row.junior)}/mo</td>
                  <td className="px-5 py-3.5 text-right text-gray-500">{fmt(row.mid)}/mo</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-[#3B5BDB]">{fmt(row.senior)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Monthly USD · Full table of all 15 categories available during the application process.
        </p>
      </div>
    </section>
  );
}

/* ─── step-by-step guide (NextHire) ─────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Apply & Get Vetted",
      desc: "Submit a short application — experience, credentials, availability, and preferences. Under 8% are accepted.",
    },
    {
      icon: CheckCircle2,
      title: "Get Matched",
      desc: "Approved profiles are automatically matched against live company briefs using our AI matching engine.",
    },
    {
      icon: Globe2,
      title: "Get Hired Globally",
      desc: "DeepTalent handles contracting, compliance, and payroll. You focus on delivering excellent work.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-balance">
            A Step-By-Step Guide To How Our Platform Works For You
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-pretty">
            A clear, three-step process with no hidden stages or ambiguous timelines.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mx-auto size-14 rounded-2xl bg-[#EEF1FF] flex items-center justify-center mb-5">
                <step.icon className="size-6 text-[#3B5BDB]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <FluidCTA href="/talents/apply" size="lg">
            Start your application
          </FluidCTA>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ accordion (VeroApp) ───────────────────────────────────── */

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
        {/* Left */}
        <div className="lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2 text-[#3B5BDB] text-xs font-bold uppercase tracking-widest mb-4">
            FAQ
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-balance">
            Everything You Need to Know
          </h2>
          <p className="text-gray-500 mb-6 text-pretty">
            Still have a question? Reach our candidate success team.
          </p>
          <FluidCTA href="/contact" variant="outline" showArrow={false}>
            Contact us
          </FluidCTA>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {faq.q}
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-4"
                >
                  <ChevronDown className="size-4 text-gray-400" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── testimonials (NextHire dark strip) ────────────────────────── */

function Testimonials() {
  return (
    <section className="py-20 bg-gray-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12 text-balance">
          What Our Placed Professionals Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`rounded-2xl p-6 ${i === 0 ? "bg-[#3B5BDB]" : "bg-white/5 border border-white/10"}`}
            >
              <Quote className="size-6 text-white/40 mb-4" />
              <p className={`text-sm leading-relaxed mb-6 ${i === 0 ? "text-white/90" : "text-white/70"}`}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="size-9 rounded-full object-cover border-2 border-white/20" />
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/50 text-xs">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── job card scroll strip (VeroApp dark footer ticker) ────────── */

function RoleTicker() {
  const roles = [
    { title: "FP&A Analyst", co: "London PE Fund", type: "Remote · Full-time", sal: "$9,450/mo" },
    { title: "KYC / AML Analyst", co: "Global Bank", type: "Remote · Contract", sal: "$5,600/mo" },
    { title: "Full-Stack Developer", co: "New York FinTech", type: "Remote · Full-time", sal: "$9,450/mo" },
    { title: "Cybersecurity Analyst", co: "Insurance Group", type: "Remote · Full-time", sal: "$8,400/mo" },
    { title: "Product Manager", co: "SaaS Startup", type: "Remote · Full-time", sal: "$11,200/mo" },
    { title: "DevOps Engineer", co: "Cloud Platform", type: "Remote · Full-time", sal: "$10,500/mo" },
  ];

  return (
    <section className="py-12 bg-gray-950 border-t border-white/10">
      <p className="text-center text-xs font-semibold text-white/30 uppercase tracking-widest mb-8">
        Live Opportunities in the Network
      </p>
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 px-6 min-w-max pb-2">
          {[...roles, ...roles].map((r, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 w-52 shrink-0 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-lg bg-[#3B5BDB] flex items-center justify-center text-white text-[10px] font-bold shrink-0">DT</div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{r.title}</p>
                  <p className="text-white/40 text-[10px] truncate">{r.co}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-white/10 text-white/60 rounded-full px-2 py-0.5 font-medium">{r.type.split(" · ")[0]}</span>
                <span className="text-[10px] font-bold text-[#8690FD]">{r.sal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── final CTA ─────────────────────────────────────────────────── */

const CANDIDATE_AVATARS = [
  "/images/talents/cand-1.png",
  "/images/talents/cand-2.png",
  "/images/talents/cand-3.png",
  "/images/talents/cand-4.png",
];

function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 py-16 lg:py-20 bg-white">
      <div className="relative max-w-6xl mx-auto rounded-[2.5rem] bg-[#EDEEF6] overflow-hidden px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-tight text-gray-900 mb-5 text-balance">
              Your Dream Job
              <br /> Is Waiting Here
            </h2>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md mb-8 text-pretty">
              Let your talents, personality and potential do the talking. We give you the opportunity to share your story through.
            </p>

            {/* Search pill */}
            <form
              action="/talents/apply"
              className="flex items-center gap-2 bg-white rounded-full shadow-[0_16px_40px_rgba(17,24,39,0.1)] p-2 max-w-md mb-10"
            >
              <span className="grid size-9 place-items-center shrink-0 ml-1">
                <Search className="size-4 text-gray-400" />
              </span>
              <input
                type="text"
                name="q"
                placeholder="Search your job"
                className="flex-1 min-w-0 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 bg-transparent"
              />
              <button
                type="submit"
                className="shrink-0 h-11 px-6 inline-flex items-center rounded-full bg-[#6D5AE6] text-white text-sm font-semibold hover:bg-[#5b49d1] transition-colors"
              >
                Get Started
              </button>
            </form>

            {/* Candidates */}
            <div>
              <p className="text-lg font-bold text-gray-900 mb-3">Our more candidates</p>
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {CANDIDATE_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src || "/placeholder.svg"}
                      alt=""
                      className="size-9 rounded-full object-cover ring-2 ring-[#EDEEF6]"
                      loading="lazy"
                    />
                  ))}
                </div>
                <span className="ml-2 grid size-9 place-items-center rounded-full bg-gray-900 text-white text-xs font-bold ring-2 ring-[#EDEEF6]">
                  80+
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            <img
              src="/images/talents/cta-woman-orange.png"
              alt="A delighted professional using DeepTalent"
              className="relative z-10 w-full h-auto object-contain select-none"
            />

            {/* Floating blue calendar icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 left-0 top-10 grid size-12 place-items-center rounded-2xl bg-[#3B5BDB] shadow-xl"
            >
              <Calendar className="size-5 text-white" />
            </motion.div>

            {/* Floating Google G */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 right-2 top-6 grid size-12 place-items-center rounded-full bg-white shadow-xl"
            >
              <GoogleG className="size-6" />
            </motion.div>

            {/* Floating candidate card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 -left-2 sm:left-2 bottom-8 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-gray-100"
            >
              <img
                src="/images/talents/cand-2.png"
                alt="John Cliventon"
                className="size-10 rounded-xl object-cover"
              />
              <span className="leading-tight">
                <span className="block text-sm font-bold text-gray-900">John Cliventon</span>
                <span className="block text-xs text-gray-400 mb-1">Product Designer</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                  ))}
                </span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */

export function TalentsPageClient() {
  return (
    <main className="bg-white">
      <SiteNavbar />
      <TalentHero />
      <KickstartAI />
      <NewStartups />
      <FeaturesGrid />
      <SkillOrbit />
      <TalentProfileCard />
      <SalarySection />
      <HowItWorks />
      <FAQSection />
      <Testimonials />
      <RoleTicker />
      <FinalCTA />
      <TrustedFooter />
    </main>
  );
}
