"use client";

import { ArrowRight, Menu, X, Mail, Phone, MapPin, Linkedin, Twitter, Instagram, Facebook, CheckCircle2 } from "lucide-react";
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
      <CompanyTestimonials />
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
          Access Verified <br /> Deep Expertise
        </h1>
        
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Scale your engineering team in days, not months. Our three-step process delivers interview-ready specialists aligned with your specific tech stack.
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
            href="/about"
            className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
          >
            Browse Talent Pool
          </Link>
        </div>
      </div>
    </section>
  );
}

function CompanyBenefits() {
  const benefits = [
    { title: "Faster Hiring", desc: "Find qualified candidates in 72 hours, not 3 months" },
    { title: "Vetted Quality", desc: "Only top 1% of candidates make it through our process" },
    { title: "Lower Costs", desc: "Reduce hiring costs by up to 50% compared to traditional recruitment" },
    { title: "Zero Risk", desc: "Quality guarantee means we replace underperformers" },
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
    { num: "02", title: "Get Matches", desc: "Receive 3-5 pre-vetted candidates within 72 hours" },
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

function CompanyTestimonials() {
  const testimonials = [
    {
      quote: "DeepTalent cut our hiring time by 70%. The candidates were immediately productive and culture fit.",
      author: "John Smith",
      title: "CTO, TechStartup",
      avatar: "JS"
    },
    {
      quote: "Finally a recruitment solution that actually works. Quality is top-notch and costs are transparent.",
      author: "Lisa Wong",
      title: "VP People, FinTech Co",
      avatar: "LW"
    },
    {
      quote: "We've scaled our team from 10 to 40 people using DeepTalent. Absolutely game-changing.",
      author: "Marcus Davis",
      title: "Founder, ScaleUp Inc",
      avatar: "MD"
    },
  ];

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">What Companies Say</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, i) => (
          <div key={i} className="p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200">
            <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3B5BDB] text-white rounded-full flex items-center justify-center font-bold text-sm">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.title}</p>
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
