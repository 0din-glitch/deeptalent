"use client";

import { motion } from "motion/react";
import { BarChart3, ShieldCheck, Check, AlertTriangle, Globe2 } from "lucide-react";
import { FluidCTA } from "@/components/site/fluid-cta";

/* Colored icon tiles positioned over an SVG "fishbone" diagram, echoing the
   CoreShift template hero — restyled to the DeepTalent blue palette. */

type Tile =
  | { kind: "icon"; icon: React.ElementType; bg: string; left: string; top: string; delay: number }
  | { kind: "photo"; src: string; left: string; top: string; delay: number };

const tiles: Tile[] = [
  { kind: "photo", src: "/images/consulting/pro-2.png", left: "15%", top: "50%", delay: 0 },
  { kind: "icon", icon: BarChart3, bg: "bg-[#3B5BDB]", left: "30%", top: "19%", delay: 0.1 },
  { kind: "icon", icon: ShieldCheck, bg: "bg-[#1E2A5A]", left: "36%", top: "80%", delay: 0.2 },
  { kind: "icon", icon: AlertTriangle, bg: "bg-[#38BDF8]", left: "70%", top: "19%", delay: 0.15 },
  { kind: "photo", src: "/images/consulting/pro-3.png", left: "64%", top: "80%", delay: 0.25 },
  { kind: "icon", icon: Globe2, bg: "bg-[#8690FD]", left: "85%", top: "50%", delay: 0.3 },
];

export function ConsultingHero() {
  return (
    <section className="px-3 pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-6 pb-16 pt-10 shadow-[0_20px_60px_rgba(17,24,39,0.06)] md:pb-20 md:pt-14">
        {/* Diagram */}
        <div className="relative mx-auto hidden h-[320px] max-w-4xl md:block">
          <svg
            viewBox="0 0 1000 340"
            className="absolute inset-0 h-full w-full"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="140" y1="170" x2="860" y2="170" stroke="#E5E7EB" strokeWidth="1.5" />
            <line x1="340" y1="170" x2="300" y2="80" stroke="#E5E7EB" strokeWidth="1.5" />
            <line x1="340" y1="170" x2="360" y2="258" stroke="#E5E7EB" strokeWidth="1.5" />
            <line x1="660" y1="170" x2="700" y2="80" stroke="#E5E7EB" strokeWidth="1.5" />
            <line x1="660" y1="170" x2="640" y2="258" stroke="#E5E7EB" strokeWidth="1.5" />
            <circle cx="340" cy="170" r="5" fill="#3B5BDB" />
            <circle cx="660" cy="170" r="5" fill="#3B5BDB" />
          </svg>

          {/* Center brand tile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 z-10 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-[#3B5BDB] shadow-[0_16px_40px_rgba(59,91,219,0.4)]"
          >
            <Check className="size-12 text-white" strokeWidth={2.5} />
          </motion.div>

          {tiles.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [12, -6, 0] }}
              transition={{ duration: 0.6, delay: t.delay, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: t.left, top: t.top }}
            >
              {t.kind === "icon" ? (
                <div className={`flex size-16 items-center justify-center rounded-2xl ${t.bg} shadow-[0_10px_28px_rgba(17,24,39,0.15)]`}>
                  <t.icon className="size-7 text-white" />
                </div>
              ) : (
                <div className="size-20 overflow-hidden rounded-2xl border-4 border-white shadow-[0_10px_28px_rgba(17,24,39,0.18)]">
                  <img src={t.src || "/placeholder.svg"} alt="" className="size-full object-cover" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile diagram — compact animated tile cluster */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#3B5BDB] shadow-[0_16px_40px_rgba(59,91,219,0.4)]"
          >
            <Check className="size-9 text-white" strokeWidth={2.5} />
          </motion.div>
          <div className="mx-auto mt-5 flex max-w-xs flex-wrap justify-center gap-3">
            {tiles.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: [12, -6, 0] }}
                transition={{ duration: 0.6, delay: t.delay, ease: "easeOut" }}
              >
                {t.kind === "icon" ? (
                  <div className={`flex size-14 items-center justify-center rounded-2xl ${t.bg} shadow-[0_10px_28px_rgba(17,24,39,0.15)]`}>
                    <t.icon className="size-6 text-white" />
                  </div>
                ) : (
                  <div className="size-14 overflow-hidden rounded-2xl border-4 border-white shadow-[0_10px_28px_rgba(17,24,39,0.18)]">
                    <img src={t.src || "/placeholder.svg"} alt="" className="size-full object-cover" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Copy */}
        <div className="mx-auto mt-8 max-w-3xl text-center md:mt-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-6xl"
          >
            Expert consulting,<br className="hidden sm:block" /> fully managed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-gray-500"
          >
            Connect with accredited, AI-vetted consultants in finance, compliance, risk,
            technology and more — sourced, vetted and managed end-to-end.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <FluidCTA href="/contact" size="lg" variant="primary">
              Book a consultation
            </FluidCTA>
            <FluidCTA href="/companies/hire" size="lg" variant="outline" showArrow={false}>
              Explore disciplines
            </FluidCTA>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
