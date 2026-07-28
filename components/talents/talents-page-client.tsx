"use client";

import { ArrowRight, Menu, X, ChevronRight, Linkedin, ShieldCheck, Globe2, Zap, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "For Talents", href: "/talents" },
    { label: "For Companies", href: "/companies" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[90%] max-w-7xl -translate-x-1/2 flex items-center justify-between rounded-2xl p-4 shadow-lg md:px-8 bg-[#3B5BDB] transition-all duration-300">
      <Link href="/" className="flex items-center gap-2">
        <img src="/images/logo-wordmark.png" alt="Deep Talent" className="h-12 w-auto" />
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 text-white/75 hover:text-white text-sm font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden md:inline-flex h-11 px-6 items-center justify-center rounded-full border border-white/30 bg-transparent text-white text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/talents/apply"
          className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Apply Now
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl p-6 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function TalentHero() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center bg-gradient-to-br from-[#1e3a8a] via-[#3B5BDB] to-[#4f6ee8] overflow-hidden pt-24">
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
          <span className="flex size-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-medium">Selective network — accepting applications</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
          Finance, Compliance &amp; Technology <br className="hidden md:block" /> Professionals — Global Roles
        </h1>

        <p className="text-xl text-white/85 mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
          DeepTalent is a fully managed talent partner, not a job board. We place credentialled professionals from Africa&apos;s deepest talent pools into demanding global financial-services, technology, and compliance roles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/talents/apply"
            className="px-8 py-4 bg-white text-[#3B5BDB] font-semibold rounded-full hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Apply to the network
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="#roles"
            className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
          >
            See open disciplines
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">&lt;8%</p>
            <p className="text-white/70 text-xs mt-1">Acceptance rate</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-3xl font-bold text-white">14–21 days</p>
            <p className="text-white/70 text-xs mt-1">Avg. time to placement</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">15+</p>
            <p className="text-white/70 text-xs mt-1">Role categories</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const DISCIPLINES = [
  {
    title: "Finance &amp; Accounting",
    roles: ["FP&A Analyst", "Accountant / Bookkeeper", "Credit Analyst"],
    rangeLabel: "$2,940 – $9,450 /mo",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    title: "Compliance &amp; Risk",
    roles: ["KYC / AML Analyst", "Cybersecurity Analyst", "Business Intelligence Analyst"],
    rangeLabel: "$3,150 – $8,400 /mo",
    color: "bg-indigo-50 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Technology &amp; Engineering",
    roles: ["Full-Stack Developer", "DevOps / Cloud Engineer", "AI Prompt Engineer"],
    rangeLabel: "$4,760 – $11,550 /mo",
    color: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    title: "Data &amp; Analytics",
    roles: ["Data Analyst", "BI Analyst"],
    rangeLabel: "$3,640 – $7,000 /mo",
    color: "bg-cyan-50 border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Product &amp; Design",
    roles: ["Product Manager", "Project Manager", "UX / UI Designer"],
    rangeLabel: "$4,060 – $11,200 /mo",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-700",
  },
  {
    title: "Operations &amp; Support",
    roles: ["Executive / Operations Assistant", "Customer Service Representative"],
    rangeLabel: "$1,960 – $4,550 /mo",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
];

function RoleDisciplines() {
  return (
    <section id="roles" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Disciplines we place</h2>
          <p className="text-gray-600 text-lg text-pretty">
            We focus on roles where Africa&apos;s credentialled talent is genuinely world-class — finance, compliance, technology, and operations. Each range below is drawn from our published salary scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DISCIPLINES.map((d, i) => (
            <div key={i} className={`rounded-2xl border p-6 ${d.color}`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900" dangerouslySetInnerHTML={{ __html: d.title }} />
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${d.badge}`}>{d.rangeLabel}</span>
              </div>
              <ul className="space-y-2">
                {d.roles.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-gray-700">
                    <ChevronRight className="size-3.5 text-[#3B5BDB] shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Monthly USD rates reflect junior–senior range across all roles. Full salary scale available during the application process.
        </p>
      </div>
    </section>
  );
}

const SALARY_ROWS = [
  { label: "Finance Analyst (FP&A)", junior: 4900, mid: 6650, senior: 9450 },
  { label: "KYC / AML Analyst", junior: 3150, mid: 4200, senior: 5600 },
  { label: "Full-Stack Developer", junior: 4760, mid: 6930, senior: 9450 },
  { label: "Cybersecurity Analyst", junior: 4550, mid: 6160, senior: 8400 },
  { label: "DevOps / Cloud Engineer", junior: 5460, mid: 7560, senior: 10500 },
  { label: "Product Manager", junior: 5600, mid: 8050, senior: 11200 },
  { label: "AI Prompt Engineer", junior: 5250, mid: 7700, senior: 11550 },
  { label: "Data Analyst", junior: 3640, mid: 5040, senior: 6860 },
];

function SalaryTransparency() {
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
  return (
    <section id="salary" className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wide mb-4">
            <DollarSign className="size-3.5" /> Salary transparency
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What you can earn</h2>
          <p className="text-gray-600 text-lg text-pretty">
            We publish our monthly USD compensation ranges by seniority level. No guesswork, no negotiating blind.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#3B5BDB] text-white">
                <th className="px-5 py-3.5 text-left font-semibold">Role</th>
                <th className="px-5 py-3.5 text-right font-semibold">Junior</th>
                <th className="px-5 py-3.5 text-right font-semibold">Mid</th>
                <th className="px-5 py-3.5 text-right font-semibold">Senior</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{row.label}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{fmt(row.junior)}/mo</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{fmt(row.mid)}/mo</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-[#3B5BDB]">{fmt(row.senior)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Figures are monthly USD. Full table of 15 role categories visible during the application process.
        </p>

        <div className="mt-10 text-center">
          <Link
            href="/talents/apply"
            className="h-12 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            Apply to the network <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TalentJourney() {
  const steps = [
    {
      num: "01",
      title: "Submit your application",
      desc: "Four short sections: experience, credentials, availability, and role preferences. Saved automatically as you go — most applicants finish in under five minutes.",
    },
    {
      num: "02",
      title: "Vetting &amp; verification",
      desc: "Our team reviews your credentials, work history, and technical competencies. Fewer than 8% of applicants proceed. You will hear back within 7 business days.",
    },
    {
      num: "03",
      title: "Profile enters the network",
      desc: "Approved candidates are matched against live company briefs using our AI system. You receive curated opportunities — no cold applications or bidding wars.",
    },
    {
      num: "04",
      title: "Placement &amp; onboarding",
      desc: "DeepTalent handles contracting, compliance, and global payroll. You focus on doing great work — we take care of everything else.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How placement works</h2>
          <p className="text-gray-600 text-lg text-pretty">A clear, four-step process with no hidden stages or ambiguous timelines.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 h-full flex flex-col">
                <div className="text-4xl font-bold text-[#3B5BDB] mb-4">{step.num}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900" dangerouslySetInnerHTML={{ __html: step.title }} />
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-3 w-6 h-0.5 bg-[#3B5BDB]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TalentNetwork() {
  const facts = [
    {
      icon: ShieldCheck,
      stat: "<8% acceptance",
      label: "Rigorous vetting",
      detail: "Technical assessments, communication screening, and past-performance audits before any profile enters the network.",
    },
    {
      icon: Zap,
      stat: "14–21 days",
      label: "Average time to placement",
      detail: "From profile approval to first matched opportunity — no indefinite waiting lists.",
    },
    {
      icon: Globe2,
      stat: "Finance, Tech & Compliance",
      label: "Core disciplines",
      detail: "FP&A, KYC/AML, Engineering, Data, Cybersecurity, and Executive Operations — deep expertise, not generalist staffing.",
    },
    {
      icon: DollarSign,
      stat: "Published salary scale",
      label: "Full transparency",
      detail: "We publish every monthly USD compensation range before you apply — no negotiating blind.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for serious professionals</h2>
          <p className="text-gray-600 text-lg">DeepTalent is a selective, early-stage network. Every figure below reflects our operational standard.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {facts.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-7 flex gap-5 items-start">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center">
                <f.icon className="size-5 text-[#3B5BDB]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{f.stat}</p>
                <p className="text-xs text-[#3B5BDB] font-semibold uppercase tracking-wide mb-1">{f.label}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">
          Placement stories published as they are completed. Follow{" "}
          <a href="https://www.linkedin.com/company/deeptalentplatform/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#3B5BDB]">
            DeepTalent on LinkedIn
          </a>{" "}
          for live updates.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="font-bold mb-4">DeepTalent</h3>
          <p className="text-gray-400 text-sm">A fully managed talent partner connecting Africa&apos;s finest professionals with global opportunities.</p>
          <a href="https://www.linkedin.com/company/deeptalentplatform/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-400 hover:text-white transition-colors">
            <Linkedin className="size-4" /> LinkedIn
          </a>
        </div>
        <div>
          <h4 className="font-bold mb-4">Product</h4>
          <Link href="/talents" className="text-gray-400 hover:text-white text-sm block mb-2">For Talents</Link>
          <Link href="/companies" className="text-gray-400 hover:text-white text-sm block mb-2">For Companies</Link>
        </div>
        <div>
          <h4 className="font-bold mb-4">Company</h4>
          <Link href="/about" className="text-gray-400 hover:text-white text-sm block mb-2">About</Link>
          <Link href="/contact" className="text-gray-400 hover:text-white text-sm block mb-2">Contact</Link>
        </div>
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <Link href="/privacy" className="text-gray-400 hover:text-white text-sm block mb-2">Privacy</Link>
          <Link href="/terms" className="text-gray-400 hover:text-white text-sm block mb-2">Terms</Link>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2026 DeepTalent Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function TalentsPageClient() {
  return (
    <main className="bg-white">
      <Navbar />
      <TalentHero />
      <RoleDisciplines />
      <SalaryTransparency />
      <TalentJourney />
      <TalentNetwork />
      <Footer />
    </main>
  );
}
