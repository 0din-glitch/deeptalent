"use client";

import { ArrowUpRight, Menu, X, Mail, Phone, MapPin, Instagram, Linkedin, HelpCircle, Plus, Minus, FileText, Users, ShieldCheck, ChevronRight, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, type MotionValue } from "motion/react";
import { fadeInUp, slideIn, staggerContainer, fadeIn, scaleIn, viewport } from "@/lib/motion";

export default function Home() {
  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      <Partners />
      <ServiceShowcase />
      <HowItWorks />
      <WhyChooseUs />
      <StrategicAdvantages />
      <TestimonialCarousel />
      <ValueProposition />
      <IndustryInsights />
      <FaqSection />
      <Footer />
    </main>
  );
}

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
        <img
          src="/images/logo-wordmark.png"
          alt="Deep Talent"
          className="h-12 w-auto"
        />
      </Link>
      
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 text-white/75 hover:text-white text-sm font-medium transition-colors relative"
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
          href="/companies/hire"
          className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Hire Talent
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
            <hr className="my-4" />
            <Link href="/auth/login" className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium">
              Login
            </Link>
            <Link href="/companies/hire" className="px-4 py-3 bg-[#3B5BDB] text-white rounded-lg font-medium text-center">
              Hire Talent
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[720px] md:min-h-[820px] overflow-hidden bg-gradient-to-br from-[#8690FD] to-[#3B5BDB] pt-36 md:pt-44 pb-20 px-4 md:px-8 lg:px-12">
      {/* 3D illustration sits in the background, behind the text layer */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 bottom-0 sm:-bottom-24 md:-bottom-48 lg:-bottom-80 z-0"
        aria-hidden="true"
      >
        <Image
          src="/images/hero-img.png"
          alt=""
          width={1200}
          height={600}
          className="w-full object-cover opacity-90"
          priority
        />
      </motion.div>

      {/* Soft gradient veil to lift text contrast over the illustration */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#3B5BDB]/40 via-[#3B5BDB]/15 to-transparent"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.15, 0.1)}
      >
        <div className="flex flex-col gap-5 md:gap-6 max-w-2xl">
          <motion.h1
            variants={fadeInUp()}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] text-balance"
          >
            Smart Talent Platform, <br />
            <span>for your Next Hire</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp()}
            className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed text-pretty"
          >
            Connect with accredited and vetted experts in{" "}
            <span className="font-semibold text-white">finance</span>,{" "}
            <span className="font-semibold text-white">technology</span> and more, and discover reliable work opportunities—all in one trusted marketplace.
          </motion.p>

          <motion.div
            variants={slideIn("left")}
            className="flex flex-wrap gap-3 md:gap-4 pt-2"
          >
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center h-11 px-6 md:px-8 rounded-full bg-white text-[#3B5BDB] font-semibold hover:bg-white/95 hover:scale-105 transition-all shadow-lg"
            >
              Join DeepTalent
            </Link>
            <a
              href="#howItWorks"
              className="inline-flex items-center gap-2 h-11 px-6 md:px-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/40 text-white font-semibold hover:bg-white/20 hover:scale-105 transition-all"
            >
              How it Works <ArrowUpRight className="size-4" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Partners() {
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
    <section className="pt-4 pb-0 px-4 md:px-8 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">Trusted</h2>
          <div className="text-gray-500 text-sm md:text-base leading-tight">
            <span>By Leaders</span>
            <span className="block underline decoration-[#3B5BDB] decoration-2 underline-offset-4">and Brands</span>
          </div>
        </motion.div>
        
        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden marquee-container">
          <div className="flex animate-marquee gap-16 w-max">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="flex-shrink-0">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-[8.5rem] md:h-[10.25rem] w-auto object-contain hover:scale-110 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  features: string[];
  illustration: string;
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
      title: "Finance, Accounting",
      description: "Ensure financial accuracy, and strategic insight with experienced finance professionals.",
      features: [
        "Bookkeeping & Financial Reporting",
        "Accounts Payable & Receivable",
        "Financial Planning & Analysis",
        "Credit Risk Assessment",
        "KYC / AML Compliance",
        "Budgeting & Forecasting",
        "External & Internal Audit",
        "Corporate Finance & Tax",
      ],
      illustration: "/images/accounting-illustration.png",
    },
    {
      id: "engineering",
      title: "Engineering & Cloud",
      description: "Build scalable applications and infrastructure with engineers experienced in modern systems and cloud environments.",
      features: [
        "Full Stack Application Development",
        "Cloud Infrastructure & DevOps",
        "API Development & Integration",
        "System Architecture Design",
        "CI/CD Pipeline Implementation",
        "Performance Optimization",
      ],
      illustration: "/images/creative-roles-illustration.png",
    },
    {
      id: "data-ai",
      title: "Data & AI",
      description: "Turn data into insights and automate workflows using modern analytics and AI tools.",
      features: [
        "Data Analysis & Visualization",
        "Business Intelligence Dashboards",
        "AI Workflow Automation",
        "Predictive Reporting & Insights",
        "Data Cleaning & Transformation",
        "Process Automation Systems",
      ],
      illustration: "/images/data-entry-illustration.png",
    },
    {
      id: "security",
      title: "Cybersecurity & Risk",
      description: "Protect systems and data with experts focused on security, compliance, and risk mitigation.",
      features: [
        "Threat Detection & Prevention",
        "Security Audits & Risk Assessment",
        "Compliance Monitoring",
        "Identity & Access Management",
        "Incident Response",
        "Vulnerability Testing",
      ],
      illustration: "/images/ai-support-illustration.png",
    },
    {
      id: "operations",
      title: "Executive & Business Operations",
      description: "Streamline execution with experienced operators managing coordination, workflows, and executive support.",
      features: [
        "Executive Calendar & Priority Management",
        "Cross-Team Coordination",
        "Project & Task Oversight",
        "Operational Workflow Optimization",
        "Internal Communication Systems",
        "Process Documentation & Reporting",
      ],
      illustration: "/images/virtual-assistant-illustration.png",
    },
    {
      id: "customer-support",
      title: "Customer Experience & Support",
      description: "Deliver fast, reliable, and high-quality customer interactions that improve retention and satisfaction.",
      features: [
        "Multi-Channel Support (Email, Chat, Phone)",
        "Customer Success & Retention",
        "CRM Management & Optimization",
        "Customer Feedback Analysis",
        "Issue Resolution & Escalation Handling",
        "Support Process Improvement",
      ],
      illustration: "/images/customer-service-illustration.png",
    },
  ];

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(
        Math.floor(latest * services.length * 0.999),
        services.length - 1
      );
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, services.length]);

  const activeService = services[activeIndex];

  return (
    <section id="services" className="relative bg-white">
      <div
        ref={containerRef}
        style={{ height: `${services.length * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-12 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 md:mb-10 max-w-2xl"
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Our <span className="text-[#3B5BDB]">Capabilities</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg mt-3 leading-relaxed">
                DeepTalent connects you with pre-vetted specialists ready to integrate into your workflow immediately.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="relative h-[260px] md:h-[380px] rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100/60 border border-gray-200/50 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, scale: 0.9, x: 60 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -60 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center justify-center p-6"
                  >
                    <Image
                      src={activeService.illustration}
                      alt={activeService.title}
                      width={400}
                      height={400}
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
              </div>

              <div className="relative min-h-[280px] md:min-h-[380px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB]">
                        0{activeIndex + 1} / 0{services.length}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
                      {activeService.title}
                    </h3>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-5 md:mb-6">
                      {activeService.description}
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activeService.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                          <ChevronRight className="mt-0.5 size-4 text-[#3B5BDB] shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 mt-8 md:mt-10">
              {services.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeIndex ? "w-12 bg-[#3B5BDB]" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "step-1",
      title: "Share Your Requirements",
      description: "Share your needs and project brief. Our AI instantly analyzes your stack to find the perfect match.",
      detail: "Tell us about the role, skills, timeline, and team culture. Our AI maps your brief against thousands of vetted profiles in seconds.",
      icon: FileText,
    },
    {
      id: "step-2",
      title: "Get AI-Matched Talent",
      description: "Our system sorts, screens, and presents the top 1% of vetted professionals in under 72 hours.",
      detail: "Receive a curated shortlist of 3-5 specialists, each with verified skills, work history, and culture fit signals — ready to interview.",
      icon: Users,
    },
    {
      id: "step-3",
      title: "Hire With Confidence",
      description: "Review, interview, and engage your preferred talent with full transparency and zero friction.",
      detail: "We handle contracting, onboarding, and global compliance. You focus on building — your new hire ships from day one.",
      icon: ShieldCheck,
    },
  ];

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(
        Math.floor(latest * steps.length * 0.999),
        steps.length - 1
      );
      setActiveStep(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, steps.length]);

  const activeData = steps[activeStep];
  const ActiveIcon = activeData.icon;

  return (
    <section className="relative bg-gray-50/50" id="howItWorks">
      <div
        ref={containerRef}
        style={{ height: `${steps.length * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-12 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#3B5BDB] tracking-tight leading-[1.1] mb-6"
                >
                  How it Works
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg md:text-xl text-gray-500 max-w-md leading-relaxed mb-8"
                >
                  Your shortest path to growth. We connect founders and talent directly, reducing friction and providing complete transparency.
                </motion.p>

                <div className="text-sm font-mono text-[#3B5BDB] mb-6">
                  0{activeStep + 1} / 0{steps.length}
                </div>

                <div className="flex flex-col gap-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                        activeStep === index
                          ? "bg-[#3B5BDB]/5 border-[#3B5BDB]/20"
                          : "border-transparent opacity-60"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center size-8 rounded-full text-sm font-bold border shrink-0 transition-colors ${
                          activeStep === index
                            ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                            : "text-gray-500 border-gray-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`font-medium transition-colors ${
                          activeStep === index ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-lg aspect-square lg:aspect-auto lg:h-[520px] flex items-center justify-center">
                <Image
                  src="/images/how-it-works-illustration.png"
                  alt="How it works"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain opacity-90"
                />

                <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:-left-8 md:right-auto md:w-[26rem] z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeData.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="bg-white/95 backdrop-blur-xl border border-white/40 p-5 rounded-2xl shadow-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#3B5BDB]/10 rounded-xl text-[#3B5BDB] shrink-0">
                          <ActiveIcon className="size-5" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg text-gray-900">
                            {activeData.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {activeData.detail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#3B5BDB]"
                          initial={{ width: 0 }}
                          animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  
  const reasons = [
    {
      id: "1",
      title: "Unmatched Vetting & Quality",
      description: "We only deliver the top 1% of global specialists, verified by proprietary AI against technical mastery and cultural fit.",
      image: "/images/vetting-quality.png",
    },
    {
      id: "2",
      title: "Speed to Strategic Impact",
      description: "Eliminate recruiting delays. Receive a curated shortlist of 3-5 experts within just 72 hours.",
      image: "/images/speed-impact.png",
    },
    {
      id: "3",
      title: "Global Compliance, Zero Risk",
      description: "We handle all international contracting, payroll, and compliance, making global hiring friction-free.",
      image: "/images/global-compliance.png",
    },
    {
      id: "4",
      title: "Expertise Over Overhead",
      description: "Engage high-value talent on flexible contracts, maximizing ROI without the cost of full-time payroll.",
      image: "/images/expertise-overhead.png",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3B5BDB] tracking-tight leading-[1.1] mb-6">
            Why Businesses Choose DeepTalent
          </h2>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
            Stop settling for generalists. Deep Talent delivers the niche expertise required for tomorrow&apos;s challenges, without the hiring delays.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[600px]">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {reasons.map((item, index) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`group relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 cursor-default ${
                  hoveredIndex === index
                    ? "bg-[#3B5BDB] text-white border-[#3B5BDB] shadow-lg scale-[1.02]"
                    : "bg-white text-gray-900 border-gray-200 hover:border-[#3B5BDB]/30"
                }`}
              >
                <div className="space-y-6">
                  <div
                    className={`size-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-colors ${
                      hoveredIndex === index ? "bg-white/20 text-white" : "bg-[#3B5BDB]/10 text-[#3B5BDB]"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <h3
                      className={`text-xl font-bold mb-3 ${
                        hoveredIndex === index ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        hoveredIndex === index ? "text-white/90" : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 hidden lg:block relative h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
            <Image
              src={reasons[hoveredIndex].image}
              alt={reasons[hoveredIndex].title}
              fill
              className="object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="font-mono text-sm opacity-80 mb-2">0{hoveredIndex + 1}</p>
              <h4 className="text-2xl font-bold leading-tight">{reasons[hoveredIndex].title}</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface Advantage {
  title: string;
  description: string;
  image: string;
  accent: string;
}

function StrategicAdvantages() {
  const advantages: Advantage[] = [
    {
      title: "Elite Talent. 50% Less Cost.",
      description: "Access top-tier professionals from emerging markets. You get senior-level output for the price of a local junior hire, with zero compromise on communication.",
      image: "/images/upfront-compensation.png",
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "AI-Powered Precision Matching",
      description: "Stop sifting through resumes. Our proprietary AI analyzes thousands of data points to instantly match you with candidates who fit your tech stack and culture.",
      image: "/images/direct-connection.png",
      accent: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "72-Hour Turnaround",
      description: "Speed wins. We deliver a curated shortlist of pre-vetted, interview-ready candidates within 3 days. Move from 'Open Role' to 'Offer Sent' in under a week.",
      image: "/images/illustration-72-hrs.png",
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Elastic Scalability",
      description: "Whether you need a single developer or a full 20-person support pod, our model scales effortlessly. Spin up teams instantly without the HR headache.",
      image: "/images/illustration-reading.png",
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Global Compliance handled",
      description: "Hire across Nigeria, Kenya, Ghana, South Africa, and the Philippines without a legal team. We handle payroll, taxes, and local compliance entirely.",
      image: "/images/global-talent-mapping.png",
      accent: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(
        Math.floor(latest * advantages.length * 0.999),
        advantages.length - 1
      );
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, advantages.length]);

  const activeAdvantage = advantages[activeIndex];

  return (
    <section className="relative bg-gray-50">
      <div
        ref={containerRef}
        style={{ height: `${advantages.length * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24 pb-10 px-4 md:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-8 md:mb-10"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#3B5BDB] tracking-tight leading-[1.05]">
                The DeepTalent Advantage
              </h2>
              <p className="text-gray-500 text-base md:text-lg mt-3 leading-relaxed">
                The five essential levers we use to accelerate your hiring and reduce your burn rate.
              </p>
            </motion.div>

            <div className="relative h-[440px] md:h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAdvantage.title}
                  initial={{ opacity: 0, y: 60, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col md:flex-row gap-6 md:gap-12 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-[0_20px_60px_-15px_rgba(59,91,219,0.15)]"
                >
                  <div className="flex w-full flex-col justify-between md:w-5/12 order-2 md:order-1">
                    <div className="space-y-4 md:space-y-5">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${activeAdvantage.accent}`}>
                          0{activeIndex + 1} / 0{advantages.length}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                        {activeAdvantage.title}
                      </h3>
                      <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                        {activeAdvantage.description}
                      </p>
                    </div>
                    <div className="hidden md:block w-full mt-6">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((activeIndex + 1) / advantages.length) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((activeIndex + 1) / advantages.length) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#3B5BDB] to-[#8690FD] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-7/12 h-44 md:h-full bg-gradient-to-br from-gray-50 to-gray-100/60 rounded-2xl overflow-hidden relative order-1 md:order-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3B5BDB]/5 to-transparent" />
                    <div className="relative h-full w-full flex items-center justify-center p-6 md:p-10">
                      <Image
                        src={activeAdvantage.image}
                        alt={activeAdvantage.title}
                        width={400}
                        height={400}
                        className="max-w-full max-h-full object-contain drop-shadow-xl"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6 md:mt-8">
              {advantages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeIndex ? "w-12 bg-[#3B5BDB]" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 md:py-16 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/companies/hire"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f4ab8] hover:scale-105 transition-all shadow-lg"
          >
            Start Hiring Now
          </Link>
          <Link
            href="/talents"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 hover:scale-105 transition-all"
          >
            View Talent Pool
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialCarousel() {
  const testimonials = [
    {
      id: "t1",
      quote: "Deeptalent transformed the way I run my business. The VA they matched me with was trained, proactive, and integrated into my workflow from day one. What impressed me most was the cost advantage — I'm getting Fortune-500-level support at half the traditional price.",
      name: "Dianitte Erilus",
      location: "Orlando, Florida, USA",
      title: "Founder & Operations Lead",
      avatarBg: "#f97316",
      initials: "DE",
      rating: 5,
    },
    {
      id: "t2",
      quote: "We needed reliable administrative and customer-support help, and Deeptalent delivered beyond expectations. Their talent is disciplined, well-trained, and incredibly responsive — exactly what a fast-moving hospitality brand like ours needs.",
      name: "CRI Lounge",
      location: "South Croydon, London, UK",
      title: "Hospitality & Events",
      avatarBg: "#14b8a6",
      initials: "CL",
      rating: 5,
    },
    {
      id: "t3",
      quote: "The operational burden in our clinic used to be overwhelming until Deeptalent stepped in. Their Executive Assistant support has completely reshaped our scheduling, client communication, and admin processes. Professional, discreet, tech-savvy, and consistent.",
      name: "Al Ahad MD",
      location: "Sharjah, Dubai, UAE",
      title: "Medical & Wellness Practice",
      avatarBg: "#3b82f6",
      initials: "AA",
      rating: 5,
    },
    {
      id: "t4",
      quote: "In social care, consistency and reliability are critical. Deeptalent helped us secure trained support staff who understood our compliance-heavy environment from day one. They've improved our documentation, scheduling, and family communication turnarounds significantly.",
      name: "Peculiar Care Home",
      location: "Erith, London, UK",
      title: "Social Care Management",
      avatarBg: "#8b5cf6",
      initials: "PC",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="space-y-4 mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#3B5BDB] tracking-tight leading-[1.1]">
              Loved by Users <br className="hidden md:block" />
              Around the World
            </h2>
            <p className="text-gray-500 text-lg">
              See how DeepTalent is reshaping operations for businesses everywhere.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: item.avatarBg }}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueProposition() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer(0.15)}
            className="space-y-6"
          >
            <motion.h2
              variants={slideIn("right")}
              className="text-4xl md:text-5xl font-extrabold text-[#3B5BDB] tracking-tight leading-[1.1]"
            >
              Hire Faster. Hire Smarter. Hire Better.
            </motion.h2>
            <motion.p
              variants={fadeInUp()}
              className="text-gray-500 text-lg leading-relaxed"
            >
              Deeptalent eliminates the guesswork from hiring by delivering pre-vetted, role-ready specialists matched to your exact needs. Instead of spending weeks screening resumes, managing interviews, and hoping for the right fit, you get handpicked professionals with the skills, experience, and reliability to perform from day one.
            </motion.p>
            <motion.div variants={fadeInUp()}>
              <Link
                href="/companies/hire"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f4ab8] hover:scale-105 transition-all shadow-lg"
              >
                Hire Talent Now <ChevronRight className="size-4" />
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6 }}
            className="hidden md:block"
          >
            <Image
              src="/images/journey-img-2.png"
              alt="Journey illustration"
              width={500}
              height={400}
              className="w-full h-auto rounded-xl shadow-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IndustryInsights() {
  const [posts, setPosts] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      category: string | null;
      cover_image_url: string | null;
      published_at: string | null;
      read_time_minutes: number | null;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/public/blog?limit=4")
      .then((r) => r.json())
      .then((j) => setPosts(j?.posts ?? []))
      .catch(() => setPosts([]));
  }, []);

  if (!posts.length) return null;

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";
  const readLabel = (m: number | null) => (m ? `${m} min read` : "");

  const heroPost = posts[0];
  const recentPosts = posts.slice(1, 4);
  const heroImage =
    heroPost.cover_image_url ||
    `https://placehold.co/1200x800/3B5BDB/ffffff?text=${encodeURIComponent(heroPost.category || "Insights")}`;

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer(0.15)}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
          >
            <div className="max-w-2xl mb-6 md:mb-0">
              <motion.h2
                variants={fadeInUp()}
                className="text-4xl md:text-5xl font-extrabold text-[#3B5BDB] tracking-tight leading-[1.1] mb-4"
              >
                Strategic Intelligence
              </motion.h2>
              <motion.p variants={fadeInUp()} className="text-gray-500 text-lg">
                Deep dives into global hiring trends, AI vetting, and remote team scaling.
              </motion.p>
            </div>
            <motion.div variants={fadeInUp()}>
              <Link
                href="/insights"
                className="hidden md:inline-flex items-center gap-2 h-11 px-6 rounded-full border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 hover:scale-105 transition-all"
              >
                View All Articles <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <Link href={`/insights/${heroPost.slug}`} className="block">
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-[#3B5BDB] group">
                <Image
                  src={heroImage}
                  alt={heroPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  {heroPost.category && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                      {heroPost.category}
                    </span>
                  )}
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{heroPost.title}</h3>
                  {heroPost.excerpt && (
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">{heroPost.excerpt}</p>
                  )}
                  <p className="text-white/60 text-xs">
                    {fmtDate(heroPost.published_at)}
                    {readLabel(heroPost.read_time_minutes) ? ` · ${readLabel(heroPost.read_time_minutes)}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer(0.1, 0.2)}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <motion.div variants={fadeInUp()} className="flex items-center gap-2 mb-2">
              <div className="size-2 bg-[#3B5BDB] rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Recent Updates
              </span>
            </motion.div>

            {recentPosts.map((post) => (
              <motion.div key={post.id} variants={fadeInUp()}>
                <Link
                  href={`/insights/${post.slug}`}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-[#3B5BDB]/30 transition-all"
                >
                  <div className="flex-1">
                    {post.category && (
                      <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 mb-2">
                        {post.category}
                      </span>
                    )}
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h4>
                    <p className="text-gray-500 text-xs">
                      {fmtDate(post.published_at)}
                      {readLabel(post.read_time_minutes) ? ` · ${readLabel(post.read_time_minutes)}` : ""}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}

            <Link
              href="/insights"
              className="w-full md:hidden mt-4 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-gray-300 bg-white text-gray-900 font-medium"
            >
              View All Articles
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      question: "What is Deep Talent?",
      answer: "Deep Talent is a specialized talent marketplace connecting businesses with the top 1% of pre-vetted remote specialists. Unlike broad freelance platforms, we focus on deep expertise, transparency, and direct high-value contracts.",
    },
    {
      question: "How does the vetting process work?",
      answer: "We use a proprietary mix of AI analysis and human expert review. Every candidate undergoes technical assessments, communication screening, and a past-performance audit before entering our network.",
    },
    {
      question: "What are the fees for hiring?",
      answer: "We believe in transparency. Hirers pay a flat platform fee or a percentage markup depending on the engagement model (Contract vs. Full-time). There are no hidden onboarding costs.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption (SOC2 compliant standards) for all data, payments, and contract details. Your intellectual property and financial data are protected at all times.",
    },
    {
      question: "Can specialists use our internal tools?",
      answer: "Yes. Our specialists are senior-level professionals accustomed to integrating into existing workflows. They work within your Slack, Jira, GitHub, or Linear environments from day one.",
    },
    {
      question: "How are payments handled?",
      answer: "We act as the merchant of record. You receive one consolidated monthly invoice for all your talent, and we handle the complex global payouts, currency conversion, and compliance.",
    },
    {
      question: "What if a match isn't the right fit?",
      answer: "We offer a risk-free 14-day trial period. If a talent doesn't meet your expectations within the first two weeks, you pay nothing, and we immediately match you with a replacement.",
    },
    {
      question: "Do you support full-time hiring?",
      answer: "Yes. While many engagements start as contracts, we offer a simple 'buy-out' clause if you wish to bring a Deep Talent specialist onto your internal payroll permanently.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);
  const midPoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midPoint);
  const rightColumn = faqs.slice(midPoint);

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12" id="faq">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <motion.div
            variants={scaleIn()}
            className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#3B5BDB]/10 text-[#3B5BDB] mb-6"
          >
            <HelpCircle className="size-6" />
          </motion.div>
          <motion.h2
            variants={fadeInUp()}
            className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p variants={fadeInUp()} className="text-gray-500 text-lg">
            Everything you need to know about the platform. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {[leftColumn, rightColumn].map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column.map((faq, index) => {
                const actualIndex = colIndex === 0 ? index : index + midPoint;
                const isOpen = openIndex === actualIndex;
                
                return (
                  <motion.div
                    key={actualIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className={`rounded-2xl border transition-all duration-300 ${
                      isOpen ? "border-[#3B5BDB]/20 ring-2 ring-[#3B5BDB]/10 bg-white" : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : actualIndex)}
                      className="flex items-center justify-between w-full p-5 text-left"
                    >
                      <span className={`font-semibold pr-4 ${isOpen ? "text-[#3B5BDB]" : "text-gray-900"}`}>
                        {faq.question}
                      </span>
                      <div className={`flex-shrink-0 p-1 rounded-full transition-colors ${isOpen ? "bg-[#3B5BDB]/10" : "bg-gray-200"}`}>
                        {isOpen ? (
                          <Minus className={`size-4 ${isOpen ? "text-[#3B5BDB]" : "text-gray-500"}`} />
                        ) : (
                          <Plus className="size-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5"
                      >
                        <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
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

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Banner */}
      <div className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.15)}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeInUp()}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6"
          >
            Ready to build your Dream Team?
          </motion.h2>
          <motion.p
            variants={fadeInUp()}
            className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto"
          >
            Join hundreds of companies scaling with Deep Talent specialists. Get matched with vetted experts in under 72 hours.
          </motion.p>
          <motion.div
            variants={fadeInUp()}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/companies/hire"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f4ab8] hover:scale-105 transition-all shadow-lg"
            >
              Start Hiring Now
            </Link>
            <Link
              href="/talents"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-gray-700 text-white font-semibold hover:bg-gray-800 hover:scale-105 transition-all"
            >
              Explore Talent Pool
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Footer Links */}
      <div className="py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/images/logo-wordmark.png"
                  alt="Deep Talent"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Connecting top-tier professionals with global opportunities. Pre-vetted talent, transparent hiring.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://x.com/deeptalentp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DeepTalent on X"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 text-gray-400" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/deeptalentplatform/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DeepTalent on Instagram"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="size-5 text-gray-400" />
                </a>
                <a
                  href="https://www.linkedin.com/company/deeptalentplatform/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DeepTalent on LinkedIn"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Linkedin className="size-5 text-gray-400" />
                </a>
                <a
                  href="https://www.tiktok.com/@deeptalent.platfo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DeepTalent on TikTok"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 text-gray-400" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/companies" className="text-gray-400 hover:text-white text-sm">For Companies</Link></li>
                <li><Link href="/talents" className="text-gray-400 hover:text-white text-sm">For Talents</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
                <li><Link href="/companies/hire" className="text-gray-400 hover:text-white text-sm">Hire Talent</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Help Center</Link></li>
                <li><Link href="/talents/apply" className="text-gray-400 hover:text-white text-sm">Apply as Talent</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="size-4" />
                  Mail@deeptalentplatform.com
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="size-4" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-start gap-2 text-gray-400 text-sm">
                  <MapPin className="size-4 mt-0.5" />
                  <span>San Francisco, CA<br />United States</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Copyright */}
      <div className="py-6 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Deep Talent. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
