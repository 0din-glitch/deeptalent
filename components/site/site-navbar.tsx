"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "For Talents", href: "/talents" },
  { label: "For Companies", href: "/companies" },
  { label: "Contact", href: "/contact" },
];

export function SiteNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[90%] max-w-7xl -translate-x-1/2 flex items-center justify-between rounded-2xl p-4 shadow-lg md:px-8 bg-[#3B5BDB]">
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
          href="/companies/hire"
          className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Hire Talent
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
          aria-label="Toggle menu"
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
            <Link
              href="/auth/login"
              className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/companies/hire"
              className="px-4 py-3 bg-[#3B5BDB] text-white rounded-lg font-medium text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hire Talent
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
