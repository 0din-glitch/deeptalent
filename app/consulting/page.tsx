import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Building2,
  ChevronRight,
  ClipboardList,
  Globe2,
  Handshake,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";

/* ─── Service categories ─────────────────────────────────────────── */
const services = [
  {
    icon: BarChart3,
    label: "Finance",
    color: "bg-blue-50 text-[#3B5BDB]",
    description:
      "CFOs, financial controllers, FP&A analysts, treasury managers, and investment professionals vetted to international accounting standards.",
    tags: ["FP&A", "Treasury", "CFO-on-demand", "Fund Accounting"],
  },
  {
    icon: ShieldCheck,
    label: "Compliance",
    color: "bg-indigo-50 text-indigo-600",
    description:
      "Regulatory compliance officers, AML specialists, KYC analysts and MLRO consultants across multiple jurisdictions.",
    tags: ["AML / KYC", "MLRO", "Regulatory Reporting", "GDPR"],
  },
  {
    icon: ClipboardList,
    label: "Risk",
    color: "bg-violet-50 text-violet-600",
    description:
      "Enterprise risk managers, credit risk analysts, operational risk consultants and stress-testing specialists.",
    tags: ["Credit Risk", "Operational Risk", "Basel III", "Stress Testing"],
  },
  {
    icon: BrainCircuit,
    label: "Technology",
    color: "bg-sky-50 text-sky-600",
    description:
      "Engineers, architects, data scientists and AI specialists placed into product and platform teams in days, not months.",
    tags: ["Software Engineering", "Data Science", "AI / ML", "Cloud & DevOps"],
  },
  {
    icon: Building2,
    label: "Operations",
    color: "bg-emerald-50 text-emerald-600",
    description:
      "Operations leads, project managers and business analysts who integrate seamlessly into existing teams and workflows.",
    tags: ["Project Management", "Business Analysis", "Process Design", "PMO"],
  },
  {
    icon: Briefcase,
    label: "Strategy & Advisory",
    color: "bg-amber-50 text-amber-600",
    description:
      "Senior advisors and fractional executives who bring board-level clarity to your most critical decisions.",
    tags: ["Fractional C-Suite", "M&A Advisory", "Market Entry", "Transformation"],
  },
];

/* ─── Engagement models ──────────────────────────────────────────── */
const models = [
  {
    title: "Staff Augmentation",
    description:
      "Embed a vetted specialist directly into your team. You direct the work; we handle contracts, payroll, and compliance.",
    icon: Users,
    highlight: false,
  },
  {
    title: "Project-Based Consulting",
    description:
      "Engage a focused team for a fixed-scope deliverable — a regulatory audit, a technology migration, a risk framework.",
    icon: ClipboardList,
    highlight: true,
  },
  {
    title: "Retained Advisory",
    description:
      "Keep a senior advisor on call. Ideal for boards and leadership teams who need on-demand expertise without a full-time commitment.",
    icon: Handshake,
    highlight: false,
  },
];

/* ─── AI vetting steps ───────────────────────────────────────────── */
const vettingSteps = [
  { n: "01", title: "Skills Assessment", body: "Every candidate completes domain-specific tests built by industry experts. Results are scored and benchmarked against role requirements." },
  { n: "02", title: "AI Interview & Scoring", body: "Our AI interview engine runs a structured oral interview, scores responses across communication, depth, and accuracy, and surfaces a verified match rating." },
  { n: "03", title: "Human Expert Review", body: "A senior DeepTalent practitioner reviews the AI output, checks references, and confirms the candidate meets the role standard." },
  { n: "04", title: "Shortlist in 14–21 Days", body: "You receive a curated shortlist of 3–5 candidates, each with a full vetting report. Interview, choose, and deploy." },
];

/* ─── Stats ──────────────────────────────────────────────────────── */
const stats = [
  { value: "<8%", label: "Acceptance rate into the network" },
  { value: "14–21d", label: "Average time to shortlist" },
  { value: "50+", label: "Countries served" },
  { value: "98%", label: "Client retention rate" },
];

export default function ConsultingPage() {
  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-6 md:px-12 bg-gradient-to-br from-[#3B5BDB] to-[#8690FD] relative overflow-hidden">
        {/* subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold tracking-widest uppercase mb-6">
            <Sparkles className="size-3.5" />
            Consulting &amp; Professional Services
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] text-balance mb-6">
            Accredited Experts,<br />
            <span className="italic font-serif">Deployed with Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed text-pretty mb-10">
            DeepTalent connects you with accredited, AI-vetted consultants and professionals in finance, compliance, risk, technology and more — all managed end-to-end so you can focus on results.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white text-[#3B5BDB] font-semibold hover:bg-white/95 transition-colors shadow-lg"
            >
              Book a Consultation <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/companies/hire"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              Hire Talent Instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-[#F9FAFB] py-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-[#3B5BDB] mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Service disciplines ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-3">What We Cover</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
              Deep expertise across the disciplines that matter most
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Every consultant in our network is assessed against a domain-specific standard — not just a generic skills checklist.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.label}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#3B5BDB]/40 hover:shadow-[0_8px_32px_rgba(59,91,219,0.08)] transition-all"
                >
                  <div className={`size-11 rounded-xl flex items-center justify-center mb-4 ${svc.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{svc.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{svc.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI Vetting process ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F9FAFB] border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: copy */}
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-3">Our AI Vetting System</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                Every consultant is verified before you ever meet them
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                We combine domain-specific AI assessments with structured human review so you receive a shortlist you can hire from with confidence — not a stack of CVs to wade through.
              </p>
              <div className="flex flex-wrap gap-3">
                {["AI-scored assessments", "Structured oral interview", "Reference verified", "Match rating included"].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3B5BDB]/8 text-[#3B5BDB] text-sm font-medium"
                    >
                      <BadgeCheck className="size-3.5" />
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Right: numbered steps */}
            <div className="flex flex-col gap-0">
              {vettingSteps.map((step, i) => (
                <div key={step.n} className="flex gap-5 pb-8 last:pb-0 relative">
                  {/* vertical connector */}
                  {i < vettingSteps.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" aria-hidden="true" />
                  )}
                  <div className="size-10 rounded-xl bg-[#3B5BDB] text-white flex items-center justify-center shrink-0 font-mono text-sm font-bold z-10">
                    {step.n}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Engagement models ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-3">How We Engage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Three ways to work with DeepTalent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((model) => {
              const Icon = model.icon;
              return (
                <div
                  key={model.title}
                  className={`relative rounded-2xl p-8 flex flex-col gap-5 border transition-all ${
                    model.highlight
                      ? "bg-[#3B5BDB] border-[#3B5BDB] shadow-[0_20px_60px_rgba(59,91,219,0.30)]"
                      : "bg-white border-gray-200 hover:border-[#3B5BDB]/40 hover:shadow-[0_8px_32px_rgba(59,91,219,0.08)]"
                  }`}
                >
                  {model.highlight && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold">
                      <Zap className="size-3" /> Most Popular
                    </span>
                  )}
                  <div
                    className={`size-11 rounded-xl flex items-center justify-center ${
                      model.highlight ? "bg-white/15 text-white" : "bg-[#3B5BDB]/8 text-[#3B5BDB]"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold mb-2 ${model.highlight ? "text-white" : "text-gray-900"}`}
                    >
                      {model.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${model.highlight ? "text-white/80" : "text-gray-500"}`}>
                      {model.description}
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className={`mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      model.highlight
                        ? "text-white hover:text-white/80"
                        : "text-[#3B5BDB] hover:text-[#3B5BDB]/80"
                    }`}
                  >
                    Get started <ChevronRight className="size-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why DeepTalent for consulting ───────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F9FAFB] border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#3B5BDB] mb-3">Why DeepTalent</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                Not a staffing agency.<br />A talent infrastructure.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Traditional agencies send you CVs and disappear. We manage the full lifecycle — sourcing, vetting, contracting, payroll, and ongoing quality assurance — so you get the consultant you hired, performing as expected.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Globe2, title: "Global reach", body: "Talent sourced across 50+ countries, with full multi-currency payroll." },
                { icon: ShieldCheck, title: "Compliance handled", body: "We act as the employer of record wherever required — tax, contracts, local law." },
                { icon: BrainCircuit, title: "AI-powered matching", body: "Role requirements mapped to candidate profiles in seconds, not weeks." },
                { icon: BadgeCheck, title: "Quality guarantee", body: "If a placement doesn't perform in the first 30 days, we replace at no extra cost." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#3B5BDB]/30 transition-colors"
                  >
                    <div className="size-9 rounded-lg bg-[#3B5BDB]/8 text-[#3B5BDB] flex items-center justify-center mb-3">
                      <Icon className="size-4" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight text-balance mb-4">
            Ready to place your first vetted consultant?
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Tell us about the role, the domain, and your timeline. We&apos;ll send you a curated shortlist within 14–21 days.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#3B5BDB]/90 transition-colors shadow-[0_8px_32px_rgba(59,91,219,0.3)]"
            >
              Book a Consultation <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/companies/hire"
              className="inline-flex items-center h-12 px-8 rounded-full border border-gray-300 bg-white text-gray-800 font-semibold hover:border-[#3B5BDB] hover:text-[#3B5BDB] transition-colors"
            >
              Browse Talent Instead
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
