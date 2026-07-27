"use client";

import { ArrowRight, Menu, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function CompaniesPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <CompanyHero />
      <CompanyBenefits />
      <HiringProcess />
      <ClientProof />
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
          href="/companies/hire"
          className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Start Hiring
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

function CompanyHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
          <CheckCircle2 className="size-4 text-blue-400" />
          <span className="text-white text-sm font-medium">Top 1% Talent Ready to Deploy</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Hire Finance, Compliance &amp; Technology Talent
        </h1>
        
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          A fully managed talent partner — not a marketplace. We source, vet, and deploy credentialled specialists in finance, compliance, and technology from Africa&apos;s deepest professional pools into your team within 21 days.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/companies/hire"
            className="px-8 py-4 bg-white text-[#3B5BDB] font-semibold rounded-full hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Start Hiring Today
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/companies/hire"
            className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}

function CompanyBenefits() {
  const benefits = [
    { title: "Placed in 14–21 days", desc: "From brief to shortlist in two to three weeks — no indefinite waiting." },
    { title: "<8% acceptance rate", desc: "Only credentialled, interview-ready professionals enter our network." },
    { title: "Competitive rates", desc: "Senior-level output at rates that reflect Africa's talent market, not the Global North's." },
    { title: "60-day free replacement", desc: "If a specialist is not the right fit within 60 days, we replace them at no additional cost." },
  ];

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">Why Companies Choose DeepTalent</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {benefits.map((benefit, i) => (
          <div key={i} className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 hover:border-indigo-400 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
            <p className="text-gray-700">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HiringProcess() {
  const steps = [
    { num: "01", title: "Define Your Needs", desc: "Tell us about the role, skills, and team culture" },
    { num: "02", title: "Get Matches", desc: "Receive 3-5 pre-vetted candidates within 21 days" },
    { num: "03", title: "Interview & Hire", desc: "Our team handles all contracts and compliance" },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Hiring Process</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                <div className="text-5xl font-bold text-[#3B5BDB] mb-4">{step.num}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#3B5BDB]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientProof() {
  const clients = [
    {
      quote: "Deeptalent transformed the way I run my business. The VA they matched me with was trained, proactive, and integrated into my workflow from day one. What impressed me most was the cost advantage — I'm getting Fortune-500-level support at half the traditional price.",
      name: "Dianitte Erilus",
      title: "Founder & Operations Lead",
      location: "Orlando, Florida, USA",
      initials: "DE",
      avatarBg: "#f97316",
    },
    {
      quote: "We needed reliable administrative and customer-support help, and Deeptalent delivered beyond expectations. Their talent is disciplined, well-trained, and incredibly responsive — exactly what a fast-moving hospitality brand like ours needs.",
      name: "CRI Lounge",
      title: "Hospitality & Events",
      location: "South Croydon, London, UK",
      initials: "CL",
      avatarBg: "#14b8a6",
    },
    {
      quote: "The operational burden in our clinic used to be overwhelming until Deeptalent stepped in. Their Executive Assistant support has completely reshaped our scheduling, client communication, and admin processes. Professional, discreet, tech-savvy, and consistent.",
      name: "Al Ahad MD",
      title: "Medical & Wellness Practice",
      location: "Sharjah, Dubai, UAE",
      initials: "AA",
      avatarBg: "#3b82f6",
    },
  ];

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">What our clients say</h2>
        <p className="text-gray-600">Real feedback from businesses already working with DeepTalent specialists.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {clients.map((c, i) => (
          <div key={i} className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <p className="text-gray-700 text-sm leading-relaxed italic flex-1 mb-6">&ldquo;{c.quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: c.avatarBg }}
              >
                {c.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.title} &middot; {c.location}</p>
              </div>
            </div>
          </div>
        ))}
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
          <p className="text-gray-400 text-sm">Connecting top talent with world-class opportunities.</p>
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
