"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  ShieldCheck,
  ClipboardList,
  BrainCircuit,
  Building2,
  Settings2,
} from "lucide-react";

/* Fanned arc of discipline tiles with a rotating "active" highlight and
   caption — the CoreShift "Integrate with your tools" section, reimagined
   as the disciplines DeepTalent vets across. */

const disciplines = [
  { icon: BarChart3, label: "Finance", blurb: "CFOs, FP&A & treasury", bg: "bg-[#3B5BDB]", rotate: -14, y: 40 },
  { icon: ShieldCheck, label: "Compliance", blurb: "AML, KYC & MLRO", bg: "bg-[#1E2A5A]", rotate: -7, y: 12 },
  { icon: BrainCircuit, label: "Technology", blurb: "Engineering, data & AI", bg: "bg-[#38BDF8]", rotate: 0, y: 0 },
  { icon: ClipboardList, label: "Risk", blurb: "Credit & operational risk", bg: "bg-[#8690FD]", rotate: 7, y: 12 },
  { icon: Building2, label: "Operations", blurb: "PMO & business analysis", bg: "bg-[#2563EB]", rotate: 14, y: 40 },
];

export function ConsultingArc() {
  const [active, setActive] = useState(2);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % disciplines.length), 2200);
    return () => clearInterval(id);
  }, []);

  const current = disciplines[active];

  return (
    <section className="px-3 py-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-6 py-16 shadow-[0_20px_60px_rgba(17,24,39,0.06)] md:py-24">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_10px_28px_rgba(59,91,219,0.18)]">
          <Settings2 className="size-6 text-[#3B5BDB]" />
        </div>
        <h2 className="mx-auto max-w-2xl text-balance text-center text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
          Vetted across every discipline in days
        </h2>

        <div className="mt-14 flex items-end justify-center gap-3 md:gap-5">
          {disciplines.map((d, i) => {
            const isActive = i === active;
            return (
              <motion.button
                key={d.label}
                onClick={() => setActive(i)}
                animate={{ y: isActive ? -12 : d.y, scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{ rotate: `${d.rotate}deg` }}
                className={`flex items-center justify-center rounded-3xl transition-shadow ${
                  isActive
                    ? `${d.bg} size-24 shadow-[0_20px_44px_rgba(59,91,219,0.35)] md:size-28`
                    : "size-20 bg-[#F3F5FA] shadow-sm md:size-24"
                }`}
                aria-label={d.label}
              >
                <d.icon className={`size-9 md:size-10 ${isActive ? "text-white" : "text-gray-400"}`} />
              </motion.button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <motion.p
            key={current.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-900"
          >
            {current.label}
          </motion.p>
          <p className="mt-1 text-gray-500">{current.blurb}</p>
        </div>
      </div>
    </section>
  );
}
