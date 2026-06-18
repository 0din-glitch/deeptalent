"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Users, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GatewayPage() {
  const [hovered, setHovered] = useState<"talent" | "company" | null>(null);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0e1a] flex flex-col">
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,91,219,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,91,219,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3B5BDB]/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B5BDB]/8 blur-[100px]" />
      </div>

      {/* Logo */}
      <header className="relative z-10 flex justify-center pt-10 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src="/images/logo-wordmark.png"
            alt="DeepTalent"
            width={200}
            height={56}
            className="h-14 w-auto"
            priority
          />
        </motion.div>
      </header>

      {/* Headline */}
      <motion.div
        className="relative z-10 text-center px-6 mt-6 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
          Who are you here as?
        </h1>
        <p className="text-white/50 mt-3 text-base md:text-lg max-w-md mx-auto">
          Choose your path to get the experience built for you.
        </p>
      </motion.div>

      {/* Selection cards */}
      <motion.div
        className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl">
          {/* Talent Card */}
          <GatewayCard
            href="/talents"
            type="talent"
            hovered={hovered}
            onHover={setHovered}
            icon={<Users className="size-7" />}
            eyebrow="I am a professional"
            title="Find Global Opportunities"
            description="Join thousands of vetted African professionals working with world-class companies. Access premium roles, fair pay, and career growth."
            cta="Explore as Talent"
            imageSrc="/images/talents-hero-img.png"
            accentColor="#3B5BDB"
            tags={["Remote-first", "Premium pay", "AI-matched"]}
          />

          {/* Company Card */}
          <GatewayCard
            href="/companies"
            type="company"
            hovered={hovered}
            onHover={setHovered}
            icon={<Building2 className="size-7" />}
            eyebrow="I am hiring"
            title="Access Top-Tier Talent"
            description="Source pre-vetted, high-performing specialists in finance, technology, and operations. Hire in days, not months."
            cta="Explore as Employer"
            imageSrc="/images/companies-hero-img.jpg"
            accentColor="#1a2f8a"
            tags={["72-hr matching", "Pre-vetted", "Global reach"]}
          />
        </div>
      </motion.div>

      {/* Bottom nav */}
      <motion.footer
        className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-8 px-6 text-white/30 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
        <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
        <Link href="/auth/login" className="hover:text-white/70 transition-colors">Sign In</Link>
        <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
        <span className="w-full text-center mt-1">&copy; 2026 DeepTalent Platform</span>
      </motion.footer>
    </main>
  );
}

function GatewayCard({
  href,
  type,
  hovered,
  onHover,
  icon,
  eyebrow,
  title,
  description,
  cta,
  imageSrc,
  accentColor,
  tags,
}: {
  href: string;
  type: "talent" | "company";
  hovered: "talent" | "company" | null;
  onHover: (v: "talent" | "company" | null) => void;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  imageSrc: string;
  accentColor: string;
  tags: string[];
}) {
  const isActive = hovered === type;
  const isDimmed = hovered !== null && !isActive;

  return (
    <motion.div
      animate={{
        opacity: isDimmed ? 0.5 : 1,
        scale: isActive ? 1.02 : isDimmed ? 0.98 : 1,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onMouseEnter={() => onHover(type)}
      onMouseLeave={() => onHover(null)}
      className="group relative"
    >
      <Link href={href} className="block h-full">
        <div
          className="relative h-full min-h-[440px] md:min-h-[520px] rounded-3xl overflow-hidden border border-white/10 cursor-pointer"
          style={{
            background: `linear-gradient(160deg, ${accentColor}22 0%, #0a0e1a 60%)`,
          }}
        >
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover object-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />
          </div>

          {/* Hover border glow */}
          <div
            className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#3B5BDB]/60 transition-all duration-300 z-10 pointer-events-none"
          />

          {/* Content */}
          <div className="relative z-20 flex flex-col justify-end h-full p-7 md:p-8">
            {/* Icon + eyebrow */}
            <div className="mb-5">
              <div
                className="inline-flex items-center justify-center size-14 rounded-2xl mb-4 text-white"
                style={{ background: `${accentColor}55`, border: `1px solid ${accentColor}88` }}
              >
                {icon}
              </div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
                {eyebrow}
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight text-balance">
                {title}
              </h2>
            </div>

            <p className="text-white/65 text-sm leading-relaxed mb-6 text-pretty">
              {description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-7">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-3 py-1 rounded-full text-white/80"
                  style={{ background: `${accentColor}40`, border: `1px solid ${accentColor}60` }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div
              className="inline-flex items-center gap-2.5 h-11 px-6 rounded-full text-sm font-semibold text-white w-fit transition-all duration-300 group-hover:gap-4"
              style={{ background: accentColor }}
            >
              {cta}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
