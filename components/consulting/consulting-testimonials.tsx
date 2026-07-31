"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

/* "Words of Appreciation" testimonial carousel — a centered card flanked by
   faded peers, with prev/next controls, in the DeepTalent blue palette. */

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CFO at Nexa Solutions",
    img: "/images/consulting/pro-8.png",
    rating: 5,
    quote:
      "DeepTalent placed a fractional CFO with us in under three weeks. The vetting report was so thorough we barely needed a second interview — she was operational from day one.",
  },
  {
    name: "James Carter",
    role: "Head of Risk at BrightPath",
    img: "/images/consulting/pro-6.png",
    rating: 5,
    quote:
      "The platform is genuinely different. Instead of a stack of CVs, we got three verified specialists with match ratings. It saved our team weeks of screening.",
  },
  {
    name: "Amara Okafor",
    role: "COO at Meridian Group",
    img: "/images/consulting/pro-1.png",
    rating: 5,
    quote:
      "They handled contracts, payroll and compliance across two countries so we didn't have to. It felt less like an agency and more like an extension of our own team.",
  },
];

export function ConsultingTestimonials() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + testimonials.length) % testimonials.length);
  };

  const t = testimonials[index];

  return (
    <section className="px-3 py-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-white px-6 py-16 shadow-[0_20px_60px_rgba(17,24,39,0.06)] md:py-24">
        <h2 className="text-balance text-center text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
          Words of appreciation
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-center text-lg leading-relaxed text-gray-500">
          From startups to enterprises, teams trust DeepTalent to place the experts
          who move their business forward.
        </p>

        <div className="relative mx-auto mt-14 flex max-w-lg justify-center">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full rounded-[1.75rem] border border-gray-200 bg-white p-8 text-center shadow-[0_16px_48px_rgba(17,24,39,0.08)]"
            >
              <img
                src={t.img || "/placeholder.svg"}
                alt={t.name}
                className="mx-auto size-16 rounded-2xl border-4 border-white object-cover shadow-md"
              />
              <figcaption className="mt-4">
                <p className="text-lg font-bold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </figcaption>
              <div className="mt-3 flex items-center justify-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
                <span className="ml-1.5 text-sm font-semibold text-gray-700">{t.rating.toFixed(1)}</span>
              </div>
              <blockquote className="mt-5 text-pretty leading-relaxed text-gray-500">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
