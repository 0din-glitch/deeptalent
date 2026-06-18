"use client";

import {
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Briefcase,
  Building2,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Globe,
  ShieldCheck,
  TrendingUp,
  Users,
  Lock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = {
  id: string;
  company: string;
  title: string;
  category: string | null;
  team_size: string | null;
  urgency: string | null;
  budget_range: string | null;
  summary: string | null;
  posted_at: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = "#3B5BDB";
const DARK = "#0a0e1a";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TalentsPage() {
  return (
    <main className="bg-white">
      <TalentNav />
      <TalentHero />
      <TrustBar />
      <RolesCarousel />
      <WhyDeepTalent />
      <HowItWorks />
      <TalentCta />
      <TalentFooter />
    </main>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function TalentNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[92%] max-w-7xl -translate-x-1/2 flex items-center justify-between rounded-2xl px-5 py-3 shadow-xl bg-[#0a0e1a]/95 backdrop-blur-md border border-white/10">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/images/logo-wordmark.png" alt="DeepTalent" width={160} height={44} className="h-11 w-auto" />
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {[
          { label: "Open Roles", href: "#roles" },
          { label: "How it Works", href: "#how" },
          { label: "For Companies", href: "/companies" },
          { label: "About", href: "/about" },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/5"
          >
            {l.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden md:inline-flex h-10 px-5 items-center rounded-full border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/sign-up?role=talent"
          className="h-10 px-5 inline-flex items-center rounded-full text-sm font-bold transition-all hover:scale-105"
          style={{ background: BRAND, color: "#fff" }}
        >
          Join Free
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl p-5 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {[
                { label: "Open Roles", href: "#roles" },
                { label: "How it Works", href: "#how" },
                { label: "For Companies", href: "/companies" },
                { label: "About", href: "/about" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium"
                >
                  {l.label}
                </a>
              ))}
              <hr className="border-white/10 my-2" />
              <Link href="/auth/login" className="px-4 py-3 text-white/60 hover:text-white text-sm font-medium rounded-xl">Sign In</Link>
              <Link href="/auth/sign-up?role=talent" className="px-4 py-3 text-center rounded-xl text-sm font-bold text-white" style={{ background: BRAND }}>Join Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function TalentHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: DARK }}>
      {/* Grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,91,219,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,91,219,0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full bg-[#3B5BDB]/12 blur-[140px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3B5BDB]/8 blur-[100px] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Illustration */}
      <div className="pointer-events-none absolute right-0 bottom-0 top-0 w-1/2 z-0 hidden lg:flex items-end justify-end">
        <div className="relative w-full h-full">
          <Image
            src="/images/talents-hero-img.png"
            alt=""
            fill
            className="object-contain object-right-bottom opacity-25"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/30 to-transparent" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-32 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">Accepting Top Professionals</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.02] tracking-tight text-balance mb-6">
            Your Career,{" "}
            <span
              className="relative"
              style={{
                background: `linear-gradient(135deg, #7B9EFF, ${BRAND})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Elevated.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-xl text-pretty">
            DeepTalent connects Africa&apos;s top professionals with premium global roles. No bidding, no guesswork — AI-matched to opportunities that fit your skills and ambitions.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#roles"
              className="inline-flex items-center gap-2.5 h-13 px-8 rounded-full text-white font-bold text-sm transition-all hover:scale-105 hover:brightness-110 shadow-lg shadow-[#3B5BDB]/30"
              style={{ background: BRAND }}
            >
              Browse Open Roles <ArrowRight className="size-4" />
            </a>
            <Link
              href="/auth/sign-up?role=talent"
              className="inline-flex items-center gap-2 h-13 px-8 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-all"
            >
              Create Free Profile
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            {[
              { value: "1,200+", label: "Vetted Professionals" },
              { value: "72 hrs", label: "Average Match Time" },
              { value: "40+", label: "Partner Companies" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Trust bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  const partners = [
    { name: "Premium Trust Bank", image: "/icons/premium-trust.svg" },
    { name: "MyGround Crew", image: "/icons/my-groud-crew.svg" },
    { name: "Tulcan Energy", image: "/icons/tulcan-energy.svg" },
    { name: "Prowin Services", image: "/icons/pro-win.svg" },
    { name: "Omiomio TV", image: "/icons/omiomio-tv.svg" },
    { name: "AL AHAD Group", image: "/icons/al-ahad.svg" },
    { name: "Sterling Bank", image: "/icons/sterling-bank.svg" },
  ];

  return (
    <section className="py-10 bg-white border-b border-gray-100 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
        Roles from companies including
      </p>
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee gap-14 w-max">
          {[...partners, ...partners, ...partners].map((p, i) => (
            <img
              key={i}
              src={p.image}
              alt={p.name}
              className="h-12 w-auto object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Roles Carousel ───────────────────────────────────────────────────────────

function urgencyColor(u?: string | null) {
  const v = (u || "").toLowerCase();
  if (v.includes("urgent") || v.includes("immediate")) return { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" };
  if (v.includes("soon") || v.includes("month")) return { bg: "#fffbeb", text: "#92400e", border: "#fde68a" };
  return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
}

function RolesCarousel() {
  const { data, isLoading } = useSWR<{ roles: Role[] }>("/api/public/roles", fetcher);
  const [authPrompt, setAuthPrompt] = useState<Role | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const CARD_W = 340;
  const GAP = 20;

  const roles = data?.roles ?? [];
  const pages = Math.max(1, roles.length);

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(pages - 1, i + 1)), [pages]);

  async function handleApply(role: Role) {
    setChecking(role.id);
    const supabase = createClient();
    const { data: ud } = await supabase.auth.getUser();
    setChecking(null);
    if (!ud.user) { setAuthPrompt(role); return; }
    const params = new URLSearchParams({
      role_id: role.id,
      role_title: role.title,
      role_category: role.category || "",
      company: role.company,
    });
    window.location.href = `/talents/apply/form?${params.toString()}`;
  }

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true });

  return (
    <section ref={sectionRef} id="roles" className="py-24 px-4 md:px-8 bg-gray-50/50 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3" style={{ background: `${BRAND}15`, color: BRAND }}>
              <Briefcase className="size-3.5" /> Live Openings
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-balance">
              Roles hired right now
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg text-pretty">
              Direct requests from DeepTalent partner companies. Apply in minutes.
            </p>
          </div>
          {roles.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="size-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-[#3B5BDB] hover:text-[#3B5BDB] disabled:opacity-30 transition-all"
                aria-label="Previous"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                onClick={next}
                disabled={idx >= pages - 1}
                className="size-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-[#3B5BDB] hover:text-[#3B5BDB] disabled:opacity-30 transition-all"
                aria-label="Next"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Carousel track */}
        <div className="overflow-hidden -mx-4 px-4">
          {isLoading ? (
            <div className="flex gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[340px] h-56 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-14 text-center">
              <Briefcase className="size-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No open roles right now. Submit a general application and we&apos;ll match you as roles come in.</p>
              <Link href="/talents/apply" className="mt-4 inline-flex h-10 px-6 items-center rounded-full text-sm font-semibold text-white" style={{ background: BRAND }}>
                Submit Application
              </Link>
            </div>
          ) : (
            <div
              ref={trackRef}
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] gap-5"
              style={{ transform: `translateX(-${idx * (CARD_W + GAP)}px)` }}
            >
              {roles.map((r) => {
                const uc = urgencyColor(r.urgency);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="shrink-0 w-[340px] bg-white border border-gray-100 hover:border-[#3B5BDB]/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-[#3B5BDB]/6 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                            <Building2 className="size-3.5" /> {r.company}
                          </p>
                          <h3 className="font-bold text-gray-900 text-base leading-snug">{r.title}</h3>
                        </div>
                        {r.urgency && (
                          <span
                            className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border"
                            style={{ background: uc.bg, color: uc.text, borderColor: uc.border }}
                          >
                            {r.urgency}
                          </span>
                        )}
                      </div>

                      {r.category && (
                        <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full mb-3" style={{ background: `${BRAND}12`, color: BRAND }}>
                          {r.category}
                        </span>
                      )}

                      {r.summary && (
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{r.summary}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(r.posted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                      <button
                        onClick={() => handleApply(r)}
                        disabled={checking === r.id}
                        className="text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60"
                        style={{ color: BRAND }}
                      >
                        {checking === r.id && <Loader2 className="size-3.5 animate-spin" />}
                        Apply now <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dot indicators */}
        {roles.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-8">
            {roles.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? 28 : 8,
                  height: 8,
                  background: i === idx ? BRAND : "#e2e8f0",
                }}
                aria-label={`Go to role ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Browse all */}
        <div className="text-center mt-10">
          <Link
            href="/talents/apply"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-full border font-semibold text-sm transition-all hover:scale-105"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            Browse all open roles <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {authPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div onClick={() => setAuthPrompt(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <button
                onClick={() => setAuthPrompt(null)}
                className="absolute top-4 right-4 size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="size-4" />
              </button>
              <div className="size-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${BRAND}15`, color: BRAND }}>
                <Lock className="size-5" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Create account to apply</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Applying for <span className="font-semibold text-gray-900">{authPrompt.title}</span> at{" "}
                <span className="font-semibold text-gray-900">{authPrompt.company}</span>. Create a free talent profile to submit your application.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/auth/sign-up?role=talent&next=${encodeURIComponent(`/talents/apply/form?role_id=${authPrompt.id}&role_title=${encodeURIComponent(authPrompt.title)}&role_category=${encodeURIComponent(authPrompt.category || "")}&company=${encodeURIComponent(authPrompt.company)}`)}`}
                  className="h-11 rounded-full font-bold text-sm text-white text-center flex items-center justify-center"
                  style={{ background: BRAND }}
                >
                  Create free account
                </Link>
                <Link
                  href={`/auth/login?next=${encodeURIComponent(`/talents/apply/form?role_id=${authPrompt.id}&role_title=${encodeURIComponent(authPrompt.title)}&role_category=${encodeURIComponent(authPrompt.category || "")}&company=${encodeURIComponent(authPrompt.company)}`)}`}
                  className="h-11 rounded-full font-semibold text-sm border border-gray-200 text-gray-700 text-center flex items-center justify-center hover:bg-gray-50"
                >
                  I already have an account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Why DeepTalent ───────────────────────────────────────────────────────────

function WhyDeepTalent() {
  const benefits = [
    {
      icon: <Zap className="size-6" />,
      title: "AI-Matched Opportunities",
      desc: "Our system learns your skills and automatically surfaces roles that are right for your profile and career stage.",
    },
    {
      icon: <Globe className="size-6" />,
      title: "Global Remote Roles",
      desc: "Work for companies in the UK, US, Middle East and beyond — from wherever you are, on competitive international rates.",
    },
    {
      icon: <ShieldCheck className="size-6" />,
      title: "No Bidding, No Hustle",
      desc: "Forget freelance marketplaces. DeepTalent vets you once and brings opportunities to you directly.",
    },
    {
      icon: <TrendingUp className="size-6" />,
      title: "Transparent Compensation",
      desc: "See salary ranges upfront. No negotiation games, no hidden fees — just clear, fair pay from day one.",
    },
    {
      icon: <Users className="size-6" />,
      title: "Vetted Network",
      desc: "Every company on our platform is screened. Work with reputable employers who value and respect talent.",
    },
    {
      icon: <Star className="size-6" />,
      title: "Career Progression",
      desc: "Build a track record with world-class companies and unlock increasingly senior global opportunities.",
    },
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3" style={{ background: `${BRAND}12`, color: BRAND }}>
            Why Talent Chooses Us
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-balance">
            Built for professionals<br className="hidden md:block" /> who deserve better
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group p-7 rounded-2xl border border-gray-100 hover:border-[#3B5BDB]/20 bg-white hover:bg-[#3B5BDB]/[0.02] transition-all hover:shadow-lg hover:shadow-[#3B5BDB]/5"
            >
              <div className="size-12 rounded-xl flex items-center justify-center mb-5 transition-colors group-hover:bg-[#3B5BDB]/15" style={{ background: `${BRAND}10`, color: BRAND }}>
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it Works ─────────────────────────────────────────────────────────────

function HowItWorks() {

  const steps = [
    {
      num: "01",
      title: "Build Your Profile",
      desc: "Create a verified profile showcasing your skills, experience, and role preferences. Takes less than 10 minutes.",
      img: "/images/integrated-profile-management.png",
    },
    {
      num: "02",
      title: "Pass AI Interview",
      desc: "Complete a short AI-powered oral interview. Our system grades your responses and matches you to the right seniority.",
      img: "/images/ai-powered.png",
    },
    {
      num: "03",
      title: "Get Matched",
      desc: "Within 72 hours, DeepTalent presents you to companies that match your skills, rate expectations, and career goals.",
      img: "/images/advanced-job-matching.png",
    },
    {
      num: "04",
      title: "Start Earning",
      desc: "Accept the offer, complete onboarding, and start working. We handle contracts, compliance, and payments.",
      img: "/images/seamless-contract-payment.png",
    },
  ];

  return (
    <section ref={ref} id="how" className="py-24 px-4 md:px-8 scroll-mt-24" style={{ background: `${DARK}` }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 border border-white/10 text-white/50">
            The Process
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight text-balance">
            From profile to paid<br className="hidden md:block" /> in days, not months
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-5 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl font-black leading-none" style={{ color: `${BRAND}80` }}>{s.num}</span>
                {i < steps.length - 1 && (
                  <ChevronRight className="size-5 text-white/20 mt-1 hidden lg:block" />
                )}
              </div>
              <div className="h-24 flex items-center justify-center">
                <Image src={s.img} alt="" width={120} height={96} className="object-contain opacity-80 h-full w-auto" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function TalentCta() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 px-4 md:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
          style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a2a6c 100%)` }}
        >
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "linear-gradient(rgba(59,91,219,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,91,219,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div className="relative z-10">
            <Image
              src="/images/logo-quad-bright.png"
              alt="DeepTalent"
              width={72}
              height={72}
              className="mx-auto mb-6 opacity-90"
            />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white text-balance mb-5 tracking-tight">
              Ready to work globally?
            </h2>
            <p className="text-white/60 text-lg max-w-lg mx-auto mb-10 text-pretty">
              Join thousands of African professionals already building world-class careers through DeepTalent.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/sign-up?role=talent"
                className="h-13 px-10 rounded-full text-sm font-bold text-white inline-flex items-center gap-2 hover:brightness-110 transition-all"
                style={{ background: BRAND }}
              >
                Join DeepTalent Free <ArrowRight className="size-4" />
              </Link>
              <a
                href="#roles"
                className="h-13 px-10 rounded-full text-sm font-semibold text-white border border-white/20 inline-flex items-center hover:bg-white/5 transition-all"
              >
                View Open Roles
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function TalentFooter() {
  return (
    <footer className="py-12 px-6 md:px-10 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/">
          <Image src="/images/logo-wordmark.png" alt="DeepTalent" width={140} height={40} className="h-10 w-auto" />
        </Link>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="/companies" className="hover:text-gray-900 transition-colors">For Companies</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
        </div>
        <p className="text-xs text-gray-400">&copy; 2026 DeepTalent Platform</p>
      </div>
    </footer>
  );
}
