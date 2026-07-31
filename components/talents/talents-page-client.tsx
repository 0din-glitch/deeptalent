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
} from "lucide-react";

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
    <section className="relative min-h-screen bg-[#F9FAFB] overflow-hidden pt-28 pb-0">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,91,219,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,91,219,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-end">
        {/* Left copy */}
        <div className="pb-16 lg:pb-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white border border-[#3B5BDB]/20 rounded-full px-4 py-1.5 mb-6 shadow-sm"
          >
            <span className="size-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[#3B5BDB] text-xs font-semibold tracking-wide">Accepting applications now</span>
          </motion.div>

          {/* Headline — NextHire style: huge weight, multi-line */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(3rem,7vw,5.5rem)] font-extrabold leading-[0.9] tracking-tight text-gray-900 mb-6"
          >
            Discover
            <br />
            Your Global
            <br />
            <span className="text-[#3B5BDB]">Career Future</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg leading-relaxed max-w-md mb-8 text-pretty"
          >
            DeepTalent connects Africa&apos;s most credentialled finance, compliance, and technology professionals with demanding global roles — fully managed, no bidding wars.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start gap-3 mb-10"
          >
            <FluidCTA href="/talents/apply" size="lg">
              Apply to the network
            </FluidCTA>
            <FluidCTA href="#how-it-works" variant="outline" size="lg" showArrow={false}>
              How it works
            </FluidCTA>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-6 flex-wrap"
          >
            <div>
              <p className="text-2xl font-extrabold text-gray-900">&lt;8%</p>
              <p className="text-xs text-gray-500 mt-0.5">Acceptance rate</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-2xl font-extrabold text-gray-900">14–21 days</p>
              <p className="text-xs text-gray-500 mt-0.5">Avg. time to placement</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-2xl font-extrabold text-gray-900">15+</p>
              <p className="text-xs text-gray-500 mt-0.5">Role categories</p>
            </div>
          </motion.div>
        </div>

        {/* Right — person + floating cards (NextHire layout) */}
        <div className="relative flex justify-center lg:justify-end items-end h-[520px] lg:h-[640px]">
          {/* person image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="absolute bottom-0 right-0 lg:right-10 h-full max-h-[600px] z-10"
          >
            <img
              src="/images/talents/hero-person.png"
              alt="DeepTalent professional"
              className="h-full w-auto object-contain object-bottom select-none"
            />
          </motion.div>

          {/* Floating stat card — companies */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute left-0 bottom-24 bg-[#3B5BDB] text-white rounded-2xl p-4 shadow-xl z-20 w-36"
          >
            <p className="text-xs font-semibold opacity-75 mb-1">Companies Hiring</p>
            <p className="text-3xl font-extrabold">150+</p>
          </motion.div>

          {/* Floating "Apply Easily" card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="absolute right-4 lg:right-16 bottom-32 bg-white rounded-2xl px-4 py-3 shadow-xl z-20 border border-gray-100"
          >
            <p className="text-sm font-bold text-gray-900">Apply in Minutes</p>
            <p className="text-xs text-gray-500 mt-0.5">Grow Your Career Globally</p>
          </motion.div>
        </div>
      </div>

      {/* Search bar strip — VeroApp style */}
      <div className="relative bg-white border-t border-gray-100 py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-3">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search roles — Finance Analyst, KYC, Full-Stack Developer…"
            className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 bg-transparent"
            readOnly
            onClick={() => window.location.href = "/talents/apply"}
          />
          <Link
            href="/talents/apply"
            className="shrink-0 h-9 px-5 inline-flex items-center justify-center rounded-full bg-[#3B5BDB] text-white text-xs font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── trusted companies strip ───────────────────────────────────── */

function TrustedBy() {
  const companies = ["Goldman Sachs", "JPMorgan", "Deloitte", "KPMG", "Stripe", "Revolut"];
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Trusted by global financial services &amp; technology firms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((c) => (
            <span key={c} className="text-sm font-bold text-gray-300 tracking-tight">{c}</span>
          ))}
        </div>
      </div>
    </section>
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

function FinalCTA() {
  return (
    <section className="py-24 bg-[#3B5BDB] text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-4xl font-extrabold text-white mb-4 text-balance">
          Ready to Find Your Global Role?
        </h2>
        <p className="text-white/75 text-lg mb-8 text-pretty">
          Join the most selective network of credentialled African professionals and access opportunities you can&apos;t find anywhere else.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/talents/apply"
            className="h-14 px-10 inline-flex items-center gap-2 rounded-full bg-white text-[#3B5BDB] font-bold text-base hover:bg-gray-100 transition-colors shadow-xl"
          >
            Apply to the network <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/auth/sign-up"
            className="h-14 px-10 inline-flex items-center gap-2 rounded-full border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */

export function TalentsPageClient() {
  return (
    <main className="bg-white">
      <SiteNavbar />
      <TalentHero />
      <TrustedBy />
      <FeaturesGrid />
      <SkillOrbit />
      <TalentProfileCard />
      <SalarySection />
      <HowItWorks />
      <FAQSection />
      <Testimonials />
      <RoleTicker />
      <FinalCTA />
    </main>
  );
}
