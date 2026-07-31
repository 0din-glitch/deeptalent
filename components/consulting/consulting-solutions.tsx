"use client";

import { motion } from "motion/react";
import { Users } from "lucide-react";
import { FluidCTA } from "@/components/site/fluid-cta";

/* Scattered, tilted portrait cards fanning out from a centered headline —
   the CoreShift "Core HR solutions" section, adapted to consulting talent. */

type FloatCard = { src: string; className: string; rotate: number; delay: number };

const leftCards: FloatCard[] = [
  { src: "/images/consulting/pro-1.png", className: "left-0 top-8 size-28", rotate: -8, delay: 0 },
  { src: "/images/consulting/pro-4.png", className: "left-16 top-44 size-32", rotate: 5, delay: 0.1 },
  { src: "/images/consulting/pro-8.png", className: "left-2 top-80 size-28", rotate: -5, delay: 0.2 },
];

const rightCards: FloatCard[] = [
  { src: "/images/consulting/pro-3.png", className: "right-4 top-6 size-28", rotate: 7, delay: 0.05 },
  { src: "/images/consulting/pro-6.png", className: "right-20 top-40 size-32", rotate: -6, delay: 0.15 },
  { src: "/images/consulting/pro-7.png", className: "right-0 top-80 size-28", rotate: 6, delay: 0.25 },
];

function Card({ card }: { card: FloatCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: card.delay }}
      style={{ rotate: `${card.rotate}deg` }}
      className={`absolute overflow-hidden rounded-2xl border-4 border-white shadow-[0_16px_40px_rgba(17,24,39,0.14)] ${card.className}`}
    >
      <img src={card.src || "/placeholder.svg"} alt="" className="size-full object-cover" />
    </motion.div>
  );
}

export function ConsultingSolutions() {
  return (
    <section className="px-3 py-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-white px-6 py-16 shadow-[0_20px_60px_rgba(17,24,39,0.06)] md:py-24">
        {/* Floating portrait cards (decorative, desktop only) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
          <div className="absolute left-0 top-1/2 h-[28rem] w-72 -translate-y-1/2">
            {leftCards.map((c) => (
              <Card key={c.src} card={c} />
            ))}
          </div>
          <div className="absolute right-0 top-1/2 h-[28rem] w-72 -translate-y-1/2">
            {rightCards.map((c) => (
              <Card key={c.src} card={c} />
            ))}
          </div>
        </div>

        {/* Centered copy */}
        <div className="relative z-10 mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white shadow-[0_10px_28px_rgba(59,91,219,0.18)]">
            <Users className="size-7 text-[#3B5BDB]" />
          </div>
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
            Accredited experts across every discipline
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty text-lg leading-relaxed text-gray-500">
            A global network of vetted professionals — ready to embed in your team,
            deliver a project, or advise your board.
          </p>
          <div className="mt-8 flex justify-center">
            <FluidCTA href="/companies/hire" size="lg" variant="primary" showArrow={false}>
              See how it works
            </FluidCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
