"use client";

import {
  ArrowUpRight, Menu, X, Mail, Phone, MapPin,
  Instagram, Linkedin, HelpCircle, Plus, Minus,
  FileText, Users, ShieldCheck, ChevronRight,
  ArrowRight, Star, Globe, Zap, Check,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion, useScroll, useTransform, AnimatePresence,
  useMotionValue, useSpring, type MotionValue,
} from "motion/react";
import { fadeInUp, slideIn, staggerContainer, fadeIn, scaleIn, viewport } from "@/lib/motion";

/* ─── palette shortcuts ─── */
const C = {
  bg:     "#001619",
  card:   "#011f24",
  border: "#0d3a40",
  cyan:   "#50E8F4",
  ice:    "#C7F8FE",
  muted:  "#7ecdd6",
} as const;

/* ════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="bg-[#001619] text-[#C7F8FE] overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <ServiceShowcase />
      <GlobeSection />
      <HowItWorks />
      <WhyChooseUs />
      <StrategicAdvantages />
      <TestimonialCarousel />
      <IndustryInsights />
      <FaqSection />
      <Footer />
    </main>
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
    { label: "About Us", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 z-50 w-[92%] max-w-7xl -translate-x-1/2 flex items-center justify-between rounded-2xl px-5 py-3 md:px-8 transition-all duration-300 ${
        scrolled
          ? "bg-[#011f24]/90 backdrop-blur-xl border border-[#0d3a40] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-[#011f24]/70 backdrop-blur-md border border-[#0d3a40]/60"
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <img src="/images/logo-wordmark.png" alt="Deep Talent" className="h-10 w-auto" />
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 text-[#7ecdd6] hover:text-[#50E8F4] text-sm font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden md:inline-flex h-9 px-5 items-center justify-center rounded-full border border-[#0d3a40] bg-transparent text-[#C7F8FE] text-sm font-medium hover:border-[#50E8F4]/60 hover:text-[#50E8F4] transition-colors"
        >
          Login
        </Link>
        <FluidCTA href="/companies/hire" size="sm">Hire Talent</FluidCTA>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#C7F8FE] hover:bg-[#0d3a40] rounded-lg"
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
            className="absolute top-full left-0 right-0 mt-2 bg-[#011f24] border border-[#0d3a40] rounded-2xl shadow-2xl p-6 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 text-[#C7F8FE] hover:bg-[#0d3a40] rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 border-[#0d3a40]" />
              <Link href="/auth/login" className="px-4 py-3 text-[#C7F8FE] hover:bg-[#0d3a40] rounded-lg font-medium">
                Login
              </Link>
              <Link href="/companies/hire" className="px-4 py-3 bg-[#50E8F4] text-[#001619] rounded-lg font-semibold text-center">
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
   FLUID CTA — morphing pill button
═══════════════════════════════════════════════════════ */
interface FluidCTAProps {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline";
  className?: string;
}

function FluidCTA({ href, children, size = "md", variant = "primary", className = "" }: FluidCTAProps) {
  const [hovered, setHovered] = useState(false);

  const pad = size === "sm" ? "h-9 px-5 text-sm" : size === "lg" ? "h-14 px-10 text-base" : "h-12 px-8 text-sm";
  const base =
    variant === "primary"
      ? "bg-[#50E8F4] text-[#001619] hover:bg-[#C7F8FE]"
      : "bg-transparent border border-[#50E8F4]/50 text-[#50E8F4] hover:bg-[#50E8F4]/10";

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fluid-cta relative overflow-hidden inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 ${pad} ${base} ${className}`}
    >
      <span className="fluid-cta-ripple" aria-hidden="true" />
      <motion.span
        animate={{ x: hovered ? -2 : 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        {children}
      </motion.span>
      <motion.span
        animate={{ x: hovered ? 2 : 0, opacity: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        <ArrowUpRight className="size-4" />
      </motion.span>
    </Link>
  );
}

/* ════════════════════════════════════════════════════
   HERO — Andela floating logos grid + centered text
═══════════════════════════════════════════════════════ */

const LOGO_CARDS = [
  // row, col (0-indexed), logo src, name
  { r: 0, c: 1, src: "/icons/sterling-bank.svg", name: "Sterling Bank" },
  { r: 0, c: 3, src: "/icons/tulcan-energy.svg", name: "Tulcan Energy" },
  { r: 0, c: 4, src: "/icons/al-ahad.svg", name: "Al Ahad Group" },
  { r: 1, c: 0, src: "/icons/premium-trust.svg", name: "Premium Trust" },
  { r: 1, c: 5, src: "/icons/pro-win.svg", name: "ProWin" },
  { r: 2, c: 0, src: "/icons/my-groud-crew.svg", name: "MyGround Crew" },
  { r: 2, c: 5, src: "/icons/omiomio-tv.svg", name: "Omiomio TV" },
  { r: 3, c: 1, src: "/icons/al-ahad.svg", name: "Al Ahad" },
  { r: 3, c: 4, src: "/icons/sterling-bank.svg", name: "Sterling" },
  { r: 4, c: 0, src: "/icons/tulcan-energy.svg", name: "Tulcan" },
  { r: 4, c: 2, src: "/icons/premium-trust.svg", name: "Premium Trust" },
  { r: 4, c: 5, src: "/icons/pro-win.svg", name: "ProWin" },
];

function HeroLogoGrid() {
  const COLS = 6;
  const ROWS = 5;
  const CELL = 88; // px per cell

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* dot grid */}
      <div className="dot-grid-bg absolute inset-0 opacity-30" />

      {/* logo cards */}
      {LOGO_CARDS.map((card, i) => {
        const delay = i * 0.12;
        // center column 2–3 is reserved for text; skip if in center
        if (card.c >= 2 && card.c <= 3) return null;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: `${(card.c / (COLS - 1)) * 90 + 5}%`,
              top: `${(card.r / (ROWS - 1)) * 80 + 5}%`,
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3 + (i % 3) * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay * 2,
              }}
              className="size-16 md:size-20 rounded-2xl border border-[#0d3a40] bg-[#011f24] flex items-center justify-center shadow-[0_4px_24px_rgba(80,232,244,0.08)] hover:border-[#50E8F4]/40 hover:shadow-[0_4px_24px_rgba(80,232,244,0.2)] transition-all duration-300"
            >
              <img
                src={card.src}
                alt={card.name}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#50E8F4]/5 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#50E8F4]/4 blur-[100px]" aria-hidden="true" />

      <HeroLogoGrid />

      {/* Center text */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.14, 0.2)}
      >
        <motion.div variants={fadeInUp()} className="mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#50E8F4]/30 bg-[#50E8F4]/10 text-[#50E8F4] text-xs font-semibold tracking-widest uppercase">
            <span className="size-1.5 rounded-full bg-[#50E8F4] animate-pulse" />
            Cross-Border Talent Infrastructure
          </span>
        </motion.div>

        <motion.h1
          variants={fadeInUp()}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] text-balance mb-6"
        >
          The World&apos;s Best Talent.{" "}
          <span className="text-[#50E8F4]">Anywhere You Need It.</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp()}
          className="text-lg md:text-xl text-[#7ecdd6] max-w-2xl mx-auto leading-relaxed text-pretty mb-8"
        >
          Connect with AI-vetted experts in{" "}
          <span className="text-[#C7F8FE] font-semibold">finance</span>,{" "}
          <span className="text-[#C7F8FE] font-semibold">technology</span>, and{" "}
          <span className="text-[#C7F8FE] font-semibold">operations</span>—
          placed within 14–21 days. Fewer than 8% of applicants make the cut.
        </motion.p>

        <motion.div
          variants={fadeInUp()}
          className="flex flex-wrap gap-3 justify-center"
        >
          <FluidCTA href="/companies/hire" size="lg">
            Start Hiring
          </FluidCTA>
          <FluidCTA href="#howItWorks" size="lg" variant="outline">
            How it Works
          </FluidCTA>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={fadeInUp()}
          className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: "<8%", label: "Acceptance rate" },
            { value: "14–21d", label: "Time to hire" },
            { value: "50+", label: "Countries served" },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-[#50E8F4]">{stat.value}</p>
              <p className="text-xs text-[#7ecdd6] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
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
    <section className="py-16 border-t border-[#0d3a40] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header row with Trustpilot */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-1">
              Trusted By Leaders &amp; Brands
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
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
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex flex-col items-start gap-1.5 px-5 py-4 rounded-2xl border border-[#0d3a40] bg-[#011f24] hover:border-[#50E8F4]/30 transition-colors"
          >
            {/* Trustpilot wordmark */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/>
              </svg>
              <span className="text-sm font-bold text-white tracking-wide">Trustpilot</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/>
                </svg>
              ))}
              <span className="text-xs text-[#7ecdd6] ml-1">4.8 / 5.0</span>
            </div>
            <p className="text-[10px] text-[#7ecdd6]">Based on 120+ reviews</p>
          </motion.a>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden marquee-container">
        <div className="flex animate-marquee gap-12 w-max">
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="flex-shrink-0 flex items-center justify-center h-20 px-4">
              <img
                src={partner.image}
                alt={partner.name}
                className="h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SERVICE SHOWCASE — interactive card stack + scroll
═══════════════════════════════════════════════════════ */
interface ServiceData {
  id: string;
  title: string;
  description: string;
  features: string[];
  illustration: string;
  accent: string;
}

function ServiceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
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
      accent: "#50E8F4",
    },
    {
      id: "engineering",
      title: "Engineering & Cloud",
      description: "Build scalable applications and infrastructure with engineers experienced in modern systems and cloud environments.",
      features: ["Full Stack Application Development", "Cloud Infrastructure & DevOps", "API Development & Integration", "System Architecture Design", "CI/CD Pipeline Implementation", "Performance Optimization"],
      illustration: "/images/creative-roles-illustration.png",
      accent: "#C7F8FE",
    },
    {
      id: "data-ai",
      title: "Data & AI",
      description: "Turn data into insights and automate workflows using modern analytics and AI tools.",
      features: ["Data Analysis & Visualization", "Business Intelligence Dashboards", "AI Workflow Automation", "Predictive Reporting & Insights", "Data Cleaning & Transformation", "Process Automation Systems"],
      illustration: "/images/data-entry-illustration.png",
      accent: "#50E8F4",
    },
    {
      id: "security",
      title: "Cybersecurity & Risk",
      description: "Protect systems and data with experts focused on security, compliance, and risk mitigation.",
      features: ["Threat Detection & Prevention", "Security Audits & Risk Assessment", "Compliance Monitoring", "Identity & Access Management", "Incident Response", "Vulnerability Testing"],
      illustration: "/images/ai-support-illustration.png",
      accent: "#C7F8FE",
    },
    {
      id: "operations",
      title: "Executive & Business Operations",
      description: "Streamline execution with experienced operators managing coordination, workflows, and executive support.",
      features: ["Executive Calendar & Priority Management", "Cross-Team Coordination", "Project & Task Oversight", "Operational Workflow Optimization", "Internal Communication Systems", "Process Documentation & Reporting"],
      illustration: "/images/virtual-assistant-illustration.png",
      accent: "#50E8F4",
    },
    {
      id: "customer-support",
      title: "Customer Experience",
      description: "Deliver fast, reliable, and high-quality customer interactions that improve retention and satisfaction.",
      features: ["Multi-Channel Support", "Customer Success & Retention", "CRM Management & Optimization", "Customer Feedback Analysis", "Issue Resolution Handling", "Support Process Improvement"],
      illustration: "/images/customer-service-illustration.png",
      accent: "#C7F8FE",
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

  return (
    <section id="services" className="relative bg-[#001619]">
      <div ref={containerRef} style={{ height: `${services.length * 100}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10 max-w-2xl"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-2">Our Capabilities</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-white">
                Every Discipline.<br />
                <span className="text-[#50E8F4]">One Platform.</span>
              </h2>
              <p className="text-[#7ecdd6] text-base md:text-lg mt-3 leading-relaxed">
                DeepTalent connects you with pre-vetted specialists ready to integrate into your workflow immediately.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Illustration panel — card stack effect */}
              <div className="relative h-[260px] md:h-[380px]">
                {/* stacked shadow cards */}
                {[2, 1].map((offset) => (
                  <div
                    key={offset}
                    className="absolute inset-0 rounded-3xl border border-[#0d3a40] bg-[#011f24]"
                    style={{
                      transform: `translateY(${offset * 8}px) translateX(${offset * 8}px) scale(${1 - offset * 0.03})`,
                      opacity: 1 - offset * 0.35,
                    }}
                  />
                ))}
                {/* active card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center justify-center rounded-3xl border border-[#0d3a40] bg-[#011f24] overflow-hidden"
                    style={{ boxShadow: `0 0 40px ${activeService.accent}18` }}
                  >
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, ${activeService.accent} 0%, transparent 60%)`,
                      }}
                    />
                    <Image
                      src={activeService.illustration}
                      alt={activeService.title}
                      width={360}
                      height={360}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl relative z-10 p-6"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Text */}
              <div className="relative min-h-[280px] md:min-h-[380px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="font-mono text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{
                          background: `${activeService.accent}20`,
                          color: activeService.accent,
                        }}
                      >
                        0{activeIndex + 1} / 0{services.length}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#0d3a40] to-transparent" />
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-white">
                      {activeService.title}
                    </h3>
                    <p className="text-[#7ecdd6] text-base md:text-lg leading-relaxed mb-5">
                      {activeService.description}
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activeService.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-[#C7F8FE]">
                          <Check className="mt-0.5 size-4 shrink-0" style={{ color: activeService.accent }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <FluidCTA href="/companies/hire" size="md">
                        Hire a {activeService.title.split(" ")[0]} Specialist
                      </FluidCTA>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Dot progress */}
            <div className="flex justify-center items-center gap-2 mt-8">
              {services.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === activeIndex ? 40 : 6,
                    backgroundColor: i === activeIndex ? C.cyan : C.border,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   GLOBE SECTION — dot-matrix wireframe globe
   (canvas-drawn to avoid heavy 3D deps)
═══════════════════════════════════════════════════════ */
function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Talent cities: [lat, lng]
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
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const r = Math.min(W, H) * 0.38;

      // Draw dot grid on sphere
      const DOT_ROWS = 24;
      const DOT_COLS = 48;
      for (let row = 0; row <= DOT_ROWS; row++) {
        for (let col = 0; col <= DOT_COLS; col++) {
          const lat = -90 + (row / DOT_ROWS) * 180;
          const lng = -180 + (col / DOT_COLS) * 360;
          const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
          if (z < 0) continue; // back-face cull
          const opacity = 0.15 + (z / r) * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80,232,244,${opacity})`;
          ctx.fill();
        }
      }

      // Grid lines (latitude)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 3) {
          const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
          if (z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
        ctx.strokeStyle = "rgba(80,232,244,0.08)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Grid lines (longitude)
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 3) {
          const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
          if (z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
        ctx.strokeStyle = "rgba(80,232,244,0.08)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Cities
      CITIES.forEach(([lat, lng, label]) => {
        const { x, y, z } = latLngToXY(lat, lng, r, cx, cy, rotation);
        if (z < -r * 0.1) return;
        const scale = 0.5 + (z / r) * 0.5;

        // glow ring
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 14 * scale);
        gradient.addColorStop(0, `rgba(80,232,244,${0.4 * scale})`);
        gradient.addColorStop(1, "rgba(80,232,244,0)");
        ctx.beginPath();
        ctx.arc(x, y, 14 * scale, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // dot
        ctx.beginPath();
        ctx.arc(x, y, 3.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80,232,244,${0.9 * scale})`;
        ctx.fill();

        // label
        if (scale > 0.65 && z > r * 0.2) {
          ctx.font = `bold ${Math.round(11 * scale)}px Inter, sans-serif`;
          ctx.fillStyle = `rgba(199,248,254,${0.85 * scale})`;
          ctx.fillText(label, x + 7 * scale, y - 4 * scale);
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
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 border-t border-[#0d3a40] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-20" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer(0.13)}
          >
            <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-3">
              Global Talent Network
            </motion.p>
            <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5 text-balance">
              Talent from Every Continent.{" "}
              <span className="text-[#50E8F4]">Compliant Everywhere.</span>
            </motion.h2>
            <motion.p variants={fadeInUp()} className="text-[#7ecdd6] text-lg leading-relaxed mb-8">
              Our network spans Nigeria, Kenya, Ghana, South Africa, Egypt, the Philippines, India, and beyond. We handle payroll, tax, and local compliance — you just hire.
            </motion.p>

            <motion.div variants={staggerContainer(0.1)} className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Globe, label: "50+ Countries", desc: "Active talent presence" },
                { icon: ShieldCheck, label: "100% Compliant", desc: "Local law covered" },
                { icon: Zap, label: "14–21 Days", desc: "Average placement speed" },
                { icon: Users, label: "10,000+ Vetted", desc: "Talent in network" },
              ].map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label}
                  variants={fadeInUp()}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-[#0d3a40] bg-[#011f24]"
                >
                  <div className="size-9 rounded-xl bg-[#50E8F4]/10 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-[#50E8F4]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#C7F8FE] text-sm">{label}</p>
                    <p className="text-xs text-[#7ecdd6]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp()}>
              <FluidCTA href="/talents" size="md" variant="outline">
                Explore Talent Pool
              </FluidCTA>
            </motion.div>
          </motion.div>

          {/* Globe canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewport}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] md:h-[520px] rounded-3xl border border-[#0d3a40] bg-[#011f24] overflow-hidden"
          >
            {/* Scan line overlay */}
            <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
              <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#50E8F4]/40 to-transparent"
                animate={{ top: ["5%", "95%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
              />
            </div>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-label="Interactive globe showing talent locations" />
            {/* Corner accents */}
            <div className="absolute top-3 left-3 size-5 border-t-2 border-l-2 border-[#50E8F4]/40 rounded-tl-lg" aria-hidden="true" />
            <div className="absolute top-3 right-3 size-5 border-t-2 border-r-2 border-[#50E8F4]/40 rounded-tr-lg" aria-hidden="true" />
            <div className="absolute bottom-3 left-3 size-5 border-b-2 border-l-2 border-[#50E8F4]/40 rounded-bl-lg" aria-hidden="true" />
            <div className="absolute bottom-3 right-3 size-5 border-b-2 border-r-2 border-[#50E8F4]/40 rounded-br-lg" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════ */
function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { id: "step-1", title: "Share Your Requirements", description: "Tell us about the role, skills, timeline, and culture. Our AI maps your brief against thousands of vetted profiles in seconds.", detail: "Share your needs and project brief. Our AI instantly analyzes your stack to find the perfect match.", icon: FileText },
    { id: "step-2", title: "Get AI-Matched Talent", description: "Receive a curated shortlist of 3–5 specialists, each with verified skills, work history, and culture fit signals — ready to interview.", detail: "Our system sorts, screens, and presents a curated shortlist of fewer than 8% of applicants — placed within 14–21 days.", icon: Users },
    { id: "step-3", title: "Interview & Select", description: "Meet your shortlisted candidates in structured interviews. We facilitate and provide scoring assistance so you can decide with confidence.", detail: "Conduct structured video interviews with our platform support. Our team facilitates and helps score candidates.", icon: ShieldCheck },
    { id: "step-4", title: "Onboard & Scale", description: "We handle contracting, payroll, and compliance. Your specialist integrates into your stack from day one.", detail: "We handle all paperwork, contracts, and payment processing so you can focus on results.", icon: Zap },
  ];

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(Math.floor(latest * steps.length * 0.999), steps.length - 1);
      setActiveStep(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, steps.length]);

  return (
    <section className="relative bg-[#011f24]" id="howItWorks">
      <div ref={containerRef} style={{ height: `${steps.length * 100}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-2">Process</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.05]">
                From Brief to Billable in{" "}
                <span className="text-[#50E8F4]">4 Steps</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === activeStep;
                const isPast = i < activeStep;
                return (
                  <motion.div
                    key={step.id}
                    animate={{
                      scale: isActive ? 1.03 : 1,
                      borderColor: isActive ? "#50E8F4" : isPast ? "#50E8F420" : "#0d3a40",
                    }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border p-5 transition-colors"
                    style={{ background: isActive ? "#50E8F408" : "#011f24" }}
                  >
                    <div
                      className="size-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
                      style={{
                        background: isActive ? "#50E8F420" : isPast ? "#50E8F410" : "#0d3a40",
                      }}
                    >
                      <Icon className="size-5" style={{ color: isActive || isPast ? "#50E8F4" : "#7ecdd6" }} />
                    </div>
                    <p
                      className="font-bold text-sm mb-1"
                      style={{ color: isActive ? "#C7F8FE" : isPast ? "#7ecdd6" : "#4a8a92" }}
                    >
                      0{i + 1}. {step.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: isActive ? "#7ecdd6" : "#3d666c" }}>
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={steps[activeStep].id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto text-center"
              >
                <p className="text-[#7ecdd6] text-lg leading-relaxed">{steps[activeStep].detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   WHY CHOOSE US — interactive card stack
═══════════════════════════════════════════════════════ */
function WhyChooseUs() {
  const [activeCard, setActiveCard] = useState(0);
  const [dragging, setDragging] = useState(false);

  const reasons = [
    { id: "1", title: "Unmatched Vetting & Quality", description: "Fewer than 8% of applicants are accepted — each verified by proprietary AI assessment and human expert review before they enter the network.", image: "/images/vetting-quality.png", stat: "<8%", statLabel: "Acceptance rate" },
    { id: "2", title: "Speed to Strategic Impact", description: "Eliminate recruiting delays. Receive a curated shortlist of 3–5 experts within 14–21 days — not months.", image: "/images/speed-impact.png", stat: "21d", statLabel: "Max time to hire" },
    { id: "3", title: "Global Compliance, Zero Risk", description: "We handle all international contracting, payroll, and compliance, making global hiring completely friction-free.", image: "/images/global-compliance.png", stat: "50+", statLabel: "Countries covered" },
    { id: "4", title: "Expertise Over Overhead", description: "Engage high-value talent on flexible contracts, maximizing ROI without the cost of full-time payroll.", image: "/images/expertise-overhead.png", stat: "60%", statLabel: "Avg. cost saving" },
  ];

  const nextCard = useCallback(() => setActiveCard((c) => (c + 1) % reasons.length), [reasons.length]);
  const prevCard = useCallback(() => setActiveCard((c) => (c - 1 + reasons.length) % reasons.length), [reasons.length]);

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-[#001619] border-t border-[#0d3a40]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 md:max-w-3xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-2">Why DeepTalent</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-4">
            Why Businesses Choose<br />
            <span className="text-[#50E8F4]">DeepTalent Platform</span>
          </h2>
          <p className="text-[#7ecdd6] text-lg md:text-xl leading-relaxed">
            Stop settling for generalists. DeepTalent delivers the niche expertise required for tomorrow&apos;s challenges, without the hiring delays.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Card stack */}
          <div className="card-stack-scene relative h-[400px] flex items-center justify-center">
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
                  drag={isActive ? "x" : false}
                  dragConstraints={{ left: -50, right: 50 }}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 60) {
                      if (info.offset.x < 0) nextCard(); else prevCard();
                    }
                  }}
                  className="absolute w-full max-w-sm rounded-3xl border border-[#0d3a40] bg-[#011f24] overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{
                    boxShadow: isActive ? `0 0 60px ${reasons[activeCard].stat === "<8%" ? "#50E8F430" : "#50E8F420"}` : "none",
                  }}
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#011f24] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#001619]/80 backdrop-blur-sm border border-[#0d3a40]">
                        <span className="text-xl font-extrabold text-[#50E8F4]">{item.stat}</span>
                        <span className="text-xs text-[#7ecdd6]">{item.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-[#7ecdd6] leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Card navigation */}
          <div>
            <div className="space-y-4">
              {reasons.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveCard(i)}
                  animate={{ borderColor: activeCard === i ? "#50E8F4" : "#0d3a40" }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border bg-[#011f24] text-left transition-colors"
                  style={{ background: activeCard === i ? "#50E8F408" : "#011f24" }}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                    style={{
                      background: activeCard === i ? "#50E8F420" : "#0d3a40",
                      color: activeCard === i ? "#50E8F4" : "#7ecdd6",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#C7F8FE] text-sm">{item.title}</p>
                    <p className="text-xs text-[#7ecdd6] mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                  <ChevronRight
                    className="size-4 ml-auto shrink-0 transition-colors"
                    style={{ color: activeCard === i ? "#50E8F4" : "#0d3a40" }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Swipe hint */}
            <p className="text-xs text-[#3d666c] mt-4 text-center">Swipe cards or click to navigate</p>

            <div className="mt-6">
              <FluidCTA href="/companies/hire" size="md">
                Start Hiring on DeepTalent
              </FluidCTA>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   STRATEGIC ADVANTAGES — scroll stack
═══════════════════════════════════════════════════════ */
function StrategicAdvantages() {
  const advantages = [
    { title: "AI-Powered Precision Matching", description: "Stop sifting through resumes. Our proprietary AI analyzes thousands of data points to instantly match you with candidates who fit your role requirements and operating environment.", image: "/images/direct-connection.png" },
    { title: "Credentialled Talent at Competitive Rates", description: "Access senior-level finance, compliance, and technology professionals from Africa's deepest talent pools — the same calibre as onshore hires, at rates that reflect their market, not yours.", image: "/images/upfront-compensation.png" },
    { title: "Follow-the-Sun Coverage", description: "Lagos is GMT+1. Sydney is GMT+10/11. That nine-hour gap is not a problem — it is your competitive edge. DeepTalent specialists cover your European and US business hours while your APAC-aligned talent keeps work moving overnight.", image: "/images/illustration-72-hrs.png" },
    { title: "Elastic Scalability", description: "Whether you need a single developer or a full 20-person support pod, our model scales effortlessly. Spin up teams instantly without the HR headache.", image: "/images/illustration-reading.png" },
    { title: "Global Compliance Handled", description: "Hire across Nigeria, Kenya, Ghana, South Africa, and the Philippines without a legal team. We handle payroll, taxes, and local compliance entirely.", image: "/images/global-talent-mapping.png" },
    { title: "Invoice in Your Currency", description: "Pay in USD, GBP, EUR, AUD, CAD, and more. We consolidate all your talent into one monthly invoice in your preferred currency and absorb the FX complexity so your finance team never has to think about it.", image: "/images/global-compliance.png" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(Math.floor(latest * advantages.length * 0.999), advantages.length - 1);
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, advantages.length]);

  return (
    <section className="relative bg-[#011f24]">
      <div ref={containerRef} style={{ height: `${advantages.length * 100}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-2">The Advantage</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.05]">
                The DeepTalent <span className="text-[#50E8F4]">Advantage</span>
              </h2>
            </motion.div>

            <div className="relative h-[440px] md:h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={advantages[activeIndex].title}
                  initial={{ opacity: 0, y: 60, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col md:flex-row gap-6 md:gap-12 bg-[#011f24] p-6 md:p-10 rounded-3xl border border-[#0d3a40]"
                  style={{ boxShadow: "0 20px 60px rgba(80,232,244,0.06)" }}
                >
                  <div className="flex w-full flex-col justify-between md:w-5/12 order-2 md:order-1">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#50E8F4]/10 text-[#50E8F4]">
                          0{activeIndex + 1} / 0{advantages.length}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#0d3a40] to-transparent" />
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                        {advantages[activeIndex].title}
                      </h3>
                      <p className="text-base md:text-lg text-[#7ecdd6] leading-relaxed">
                        {advantages[activeIndex].description}
                      </p>
                    </div>
                    <div className="hidden md:block w-full mt-6">
                      <div className="flex items-center justify-between text-xs font-medium text-[#3d666c] mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((activeIndex + 1) / advantages.length) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0d3a40] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((activeIndex + 1) / advantages.length) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #50E8F4, #C7F8FE)" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-7/12 h-44 md:h-full bg-[#001619] rounded-2xl overflow-hidden relative order-1 md:order-2 border border-[#0d3a40]">
                    <div className="relative h-full w-full flex items-center justify-center p-6 md:p-10">
                      <Image src={advantages[activeIndex].image} alt={advantages[activeIndex].title} width={400} height={400} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6">
              {advantages.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === activeIndex ? 40 : 6, backgroundColor: i === activeIndex ? "#50E8F4" : "#0d3a40" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-12 md:py-16 px-4 md:px-8 lg:px-12 border-t border-[#0d3a40]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center gap-4">
          <FluidCTA href="/companies/hire" size="lg">Start Hiring on DeepTalent</FluidCTA>
          <FluidCTA href="/talents" size="lg" variant="outline">View Talent Pool</FluidCTA>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   TESTIMONIALS — scrolling cards
═══════════════════════════════════════════════════════ */
function TestimonialCarousel() {
  const testimonials = [
    { id: "t1", quote: "Deeptalent transformed the way I run my business. The VA they matched me with was trained, proactive, and integrated into my workflow from day one. What impressed me most was the cost advantage — I'm getting Fortune-500-level support at half the traditional price.", name: "Dianitte Erilus", location: "Orlando, Florida, USA", title: "Founder & Operations Lead", avatarBg: "#50E8F4", initials: "DE", rating: 5 },
    { id: "t2", quote: "We needed reliable administrative and customer-support help, and Deeptalent delivered beyond expectations. Their talent is disciplined, well-trained, and incredibly responsive — exactly what a fast-moving hospitality brand like ours needs.", name: "CRI Lounge", location: "South Croydon, London, UK", title: "Hospitality & Events", avatarBg: "#C7F8FE", initials: "CL", rating: 5 },
    { id: "t3", quote: "The operational burden in our clinic was overwhelming until Deeptalent stepped in. Their Executive Assistant support has completely reshaped our scheduling, client communication, and admin processes. Professional, discreet, tech-savvy, and consistent.", name: "Al Ahad MD", location: "Sharjah, Dubai, UAE", title: "Medical & Wellness Practice", avatarBg: "#50E8F4", initials: "AA", rating: 5 },
    { id: "t4", quote: "In social care, consistency and reliability are critical. Deeptalent helped us secure trained support staff who understood our compliance-heavy environment from day one. They've improved our documentation, scheduling, and family communication turnarounds significantly.", name: "Peculiar Care Home", location: "Erith, London, UK", title: "Social Care Management", avatarBg: "#C7F8FE", initials: "PC", rating: 5 },
  ];

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-[#001619] overflow-hidden border-t border-[#0d3a40]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4]">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Loved by Users{" "}
              <span className="text-[#50E8F4]">Around the World</span>
            </h2>
            <p className="text-[#7ecdd6] text-lg">See how DeepTalent is reshaping operations for businesses everywhere.</p>
          </div>
          {/* Trustpilot mini */}
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#0d3a40] bg-[#011f24] shrink-0">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.481-8.279L0 9.306l8.332-1.151z" fill="#00b67a"/></svg>
            <div>
              <p className="text-sm font-bold text-white">4.8 / 5.0</p>
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
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#011f24] border border-[#0d3a40] rounded-2xl p-6 hover:border-[#50E8F4]/30 hover:shadow-[0_0_24px_rgba(80,232,244,0.08)] transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, i) => (<Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-[#7ecdd6] text-sm leading-relaxed mb-6 line-clamp-5">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center text-[#001619] text-sm font-bold" style={{ backgroundColor: item.avatarBg }}>{item.initials}</div>
                <div>
                  <p className="font-semibold text-sm text-[#C7F8FE]">{item.name}</p>
                  <p className="text-xs text-[#3d666c]">{item.title}</p>
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
  const heroImage = heroPost.cover_image_url || `https://placehold.co/1200x800/001619/50E8F4?text=${encodeURIComponent(heroPost.category || "Insights")}`;

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-[#011f24] border-t border-[#0d3a40]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6"
        >
          <div className="max-w-2xl">
            <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-2">Insights</motion.p>
            <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-3">Strategic Intelligence</motion.h2>
            <motion.p variants={fadeInUp()} className="text-[#7ecdd6] text-lg">Deep dives into global hiring trends, AI vetting, and remote team scaling.</motion.p>
          </div>
          <motion.div variants={fadeInUp()}>
            <FluidCTA href="/insights" size="md" variant="outline">View All Articles</FluidCTA>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewport} transition={{ duration: 0.6 }} className="lg:col-span-3">
            <Link href={`/insights/${heroPost.slug}`} className="block">
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-[#011f24] group border border-[#0d3a40]">
                <Image src={heroImage} alt={heroPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001619]/90 via-[#001619]/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  {heroPost.category && (<span className="inline-block px-3 py-1 bg-[#50E8F4]/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3 text-[#50E8F4] border border-[#50E8F4]/30">{heroPost.category}</span>)}
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{heroPost.title}</h3>
                  {heroPost.excerpt && (<p className="text-[#7ecdd6] text-sm mb-3 line-clamp-2">{heroPost.excerpt}</p>)}
                  <p className="text-[#3d666c] text-xs">{fmtDate(heroPost.published_at)}{readLabel(heroPost.read_time_minutes) ? ` · ${readLabel(heroPost.read_time_minutes)}` : ""}</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={staggerContainer(0.1, 0.2)} className="lg:col-span-2 flex flex-col gap-5">
            <motion.div variants={fadeInUp()} className="flex items-center gap-2 mb-1">
              <div className="size-2 bg-[#50E8F4] rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#7ecdd6]">Recent Updates</span>
            </motion.div>
            {recentPosts.map((post) => (
              <motion.div key={post.id} variants={fadeInUp()}>
                <Link href={`/insights/${post.slug}`} className="flex gap-4 p-4 bg-[#001619] rounded-xl border border-[#0d3a40] hover:border-[#50E8F4]/30 transition-all">
                  <div className="flex-1">
                    {post.category && (<span className="inline-block px-2 py-0.5 bg-[#50E8F4]/10 rounded text-xs font-medium text-[#50E8F4] mb-2">{post.category}</span>)}
                    <h4 className="font-semibold text-[#C7F8FE] mb-1 line-clamp-2">{post.title}</h4>
                    <p className="text-[#3d666c] text-xs">{fmtDate(post.published_at)}{readLabel(post.read_time_minutes) ? ` · ${readLabel(post.read_time_minutes)}` : ""}</p>
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
    { question: "What is DeepTalent?", answer: "DeepTalent is a fully managed talent partner — not a marketplace. We handle sourcing, vetting, contracting, payroll, and ongoing management so you get a dedicated specialist without the overhead of a recruitment agency or the unpredictability of a freelance platform." },
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
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-[#001619] border-t border-[#0d3a40]" id="faq">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <motion.div variants={scaleIn()} className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#50E8F4]/10 text-[#50E8F4] mb-6">
            <HelpCircle className="size-6" />
          </motion.div>
          <motion.h2 variants={fadeInUp()} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={fadeInUp()} className="text-[#7ecdd6] text-lg">
            Everything you need to know. Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="text-[#50E8F4] underline underline-offset-2">Contact support.</Link>
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
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="rounded-2xl border transition-all duration-300"
                    style={{
                      borderColor: isOpen ? "#50E8F440" : "#0d3a40",
                      background: isOpen ? "#50E8F408" : "#011f24",
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : actualIndex)}
                      className="flex items-center justify-between w-full p-5 text-left"
                    >
                      <span className="font-semibold pr-4 text-sm" style={{ color: isOpen ? "#50E8F4" : "#C7F8FE" }}>
                        {faq.question}
                      </span>
                      <div className="flex-shrink-0 p-1 rounded-full transition-colors" style={{ background: isOpen ? "#50E8F420" : "#0d3a40" }}>
                        {isOpen ? <Minus className="size-4 text-[#50E8F4]" /> : <Plus className="size-4 text-[#7ecdd6]" />}
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
                          <p className="text-[#7ecdd6] leading-relaxed text-sm">{faq.answer}</p>
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
    <footer className="bg-[#011f24] border-t border-[#0d3a40] text-[#C7F8FE]">
      {/* Fluid CTA Banner */}
      <div className="relative py-24 px-4 md:px-8 overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#50E8F4]/8 blur-[80px]" />
        </div>
        <div className="dot-grid-bg absolute inset-0 opacity-15" aria-hidden="true" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.p variants={fadeInUp()} className="text-xs font-semibold tracking-widest uppercase text-[#50E8F4] mb-4">
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
            className="text-[#7ecdd6] text-lg mb-10 max-w-2xl mx-auto"
          >
            Get matched with credentialled finance, compliance, and technology specialists from Africa&apos;s top talent pools — within 14–21 days.
          </motion.p>
          <motion.div variants={fadeInUp()} className="flex flex-col sm:flex-row gap-4 justify-center">
            <FluidCTA href="/companies/hire" size="lg">Start Hiring Now</FluidCTA>
            <FluidCTA href="/talents" size="lg" variant="outline">Explore Talent Pool</FluidCTA>
          </motion.div>
        </motion.div>
      </div>

      <div className="border-t border-[#0d3a40]" />

      {/* Footer links */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <img src="/images/logo-wordmark.png" alt="Deep Talent" className="h-10 w-auto mb-5" />
              <p className="text-[#7ecdd6] text-sm mb-6 max-w-xs leading-relaxed">
                DeepTalent platform connects top-tier professionals with global opportunities. Pre-vetted talent, transparent hiring.
              </p>
              <div className="flex gap-3">
                {[
                  { href: "https://x.com/deeptalentp", label: "X", icon: <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                  { href: "https://www.instagram.com/deeptalentplatform/", label: "Instagram", icon: <Instagram className="size-5" /> },
                  { href: "https://www.linkedin.com/company/deeptalentplatform/", label: "LinkedIn", icon: <Linkedin className="size-5" /> },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`DeepTalent on ${s.label}`} className="p-2 bg-[#0d3a40] rounded-lg hover:bg-[#50E8F4]/20 hover:text-[#50E8F4] text-[#7ecdd6] transition-colors">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                {[{ label: "For Companies", href: "/companies" }, { label: "For Talents", href: "/talents" }, { label: "About Us", href: "/about" }, { label: "Hire Talent", href: "/companies/hire" }].map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-[#7ecdd6] hover:text-[#50E8F4] text-sm transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {[{ label: "About", href: "/about" }, { label: "Help Center", href: "/contact" }, { label: "Apply as Talent", href: "/talents/apply" }, { label: "Contact", href: "/contact" }].map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-[#7ecdd6] hover:text-[#50E8F4] text-sm transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-[#7ecdd6] text-sm"><Mail className="size-4" />Mail@deeptalentplatform.com</li>
                <li className="flex items-center gap-2 text-[#7ecdd6] text-sm"><Phone className="size-4" /><a href="tel:+447367638151" className="hover:text-[#50E8F4] transition-colors">+44 7367 638151</a></li>
                <li className="flex items-start gap-2 text-[#7ecdd6] text-sm"><MapPin className="size-4 shrink-0 mt-0.5" /><span>London, Lagos, Dubai</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#0d3a40] mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#3d666c] text-sm">© {new Date().getFullYear()} DeepTalent Platform. All rights reserved.</p>
            <div className="flex gap-5 text-sm">
              <Link href="/privacy" className="text-[#3d666c] hover:text-[#50E8F4] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[#3d666c] hover:text-[#50E8F4] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
