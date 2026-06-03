"use client";

import { ArrowRight, Menu, X, Mail, Phone, MapPin, Linkedin, Twitter, Instagram, Facebook, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function TalentsPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <TalentHero />
      <TalentBenefits />
      <TalentJourney />
      <TalentTestimonials />
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
          href="/talents/apply"
          className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Get Started
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
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
          <span className="flex size-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-medium">Accepting Top Tier Talent</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Elevate Your Career <br /> Through DeepTalent
        </h1>
        
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Connect with exclusive, high-impact roles only available to pre-vetted, top-tier professionals. Work with global companies on your terms.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/talents/apply"
            className="px-8 py-4 bg-white text-[#3B5BDB] font-semibold rounded-full hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Join the Network
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/talents/apply#roles"
            className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
          >
            View Open Roles
          </Link>
        </div>
      </div>
    </section>
  );
}

function TalentBenefits() {
  const benefits = [
    { title: "Premium Compensation", desc: "Access high-paying remote roles with top global companies" },
    { title: "No Bidding Wars", desc: "Pre-vetted matching means quality opportunities, not competition" },
    { title: "Career Growth", desc: "Work on cutting-edge projects and expand your skillset" },
    { title: "Flexible Terms", desc: "Choose roles that fit your lifestyle and career goals" },
  ];

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">Why Join DeepTalent</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {benefits.map((benefit, i) => (
          <div key={i} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:border-blue-400 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
            <p className="text-gray-700">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TalentJourney() {
  const steps = [
    { num: "01", title: "Complete Your Profile", desc: "Showcase your skills and experience" },
    { num: "02", title: "Get Vetted", desc: "Our team verifies your qualifications" },
    { num: "03", title: "Receive Opportunities", desc: "Exclusive roles matched to your profile" },
    { num: "04", title: "Start Working", desc: "Onboard and begin your new role" },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Your Journey</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
                <div className="text-4xl font-bold text-[#3B5BDB] mb-4">{step.num}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#3B5BDB]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TalentTestimonials() {
  const testimonials = [
    {
      quote: "DeepTalent connected me with a role that's transformed my career. The process was seamless and the opportunities are incredible.",
      author: "Sarah Chen",
      title: "Senior Developer",
      avatar: "SC"
    },
    {
      quote: "I love that there's no bidding. DeepTalent matched me with a company that truly values my expertise.",
      author: "Michael Johnson",
      title: "Product Designer",
      avatar: "MJ"
    },
    {
      quote: "The flexibility and compensation are unmatched. Highly recommend DeepTalent to any serious professional.",
      author: "Amelia Rodriguez",
      title: "Data Scientist",
      avatar: "AR"
    },
  ];

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">What Talents Say</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, i) => (
          <div key={i} className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="size-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3B5BDB] text-white rounded-full flex items-center justify-center font-bold">
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
