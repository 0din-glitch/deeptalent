"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  Lock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import {
  COURSE,
  COURSE_DAYS,
  LEARNING_OUTCOMES,
  FIRST_LESSON,
} from "@/lib/nysc/course-content";
import { CertificateCard } from "@/components/nysc/certificate-card";

const ngn = (n: number) => `NGN ${n.toLocaleString("en-NG")}`;

const UPCOMING = [
  { title: "Finance & Accounting Deep-Dive", desc: "IFRS, month-end and FP&A for global SME finance teams.", tag: "Finance" },
  { title: "KYC / AML Practitioner", desc: "Screening, case management and regulatory reporting, hands-on.", tag: "Compliance" },
  { title: "Remote Engineering Essentials", desc: "Working in a global codebase: reviews, CI/CD and async delivery.", tag: "Technology" },
];

export function NyscTrainingView() {
  const [view, setView] = useState<"catalogue" | "lesson">("catalogue");

  if (view === "lesson") return <LessonView onBack={() => setView("catalogue")} />;

  return (
    <div>
      {/* Featured course */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div
          className="relative px-7 py-8 md:px-10 md:py-10"
          style={{ background: "linear-gradient(135deg, #063d1f 0%, #0F7A3D 60%, #16a34a 100%)" }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="size-3.5" /> Your first course
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white text-balance md:text-3xl">
                {COURSE.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-white/70">{COURSE.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/85 text-pretty">{COURSE.summary}</p>
            </div>

            <div className="shrink-0 rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Enrolment</p>
              <p className="mt-1 text-3xl font-extrabold text-white">{ngn(COURSE.priceNgn)}</p>
              <p className="mt-0.5 text-xs text-white/60">one-off · certificate on pass</p>
              <button
                onClick={() => setView("lesson")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0F7A3D] transition-colors hover:bg-white/90"
              >
                <PlayCircle className="size-4" /> Start lesson 1 free
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 sm:grid-cols-4">
            {COURSE.stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum */}
        <div className="px-7 py-8 md:px-10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#0F7A3D]">Programme at a glance</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {COURSE_DAYS.map((d) => (
              <div key={d.day} className="rounded-2xl border border-gray-100 bg-[#F4FBF6] p-5">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-[#0F7A3D] text-sm font-bold text-white">
                    {d.day}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Day {d.day}</p>
                    <p className="text-[11px] text-gray-400">{d.total}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">{d.title}</p>
                <ul className="mt-3 space-y-2">
                  {d.modules.map((m) => (
                    <li key={m.code} className="flex items-start justify-between gap-2 text-sm">
                      <span className="text-gray-600">
                        <span className="font-mono text-xs text-[#0F7A3D]">{m.code}</span> {m.title}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">{m.minutes}m</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CertificateCard />

      {/* Learning outcomes */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-gray-900">By the end of Day 3, you can</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_OUTCOMES.map((o) => (
            <div key={o.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <CheckCircle2 className="size-5 text-[#0F7A3D]" />
              <p className="mt-3 font-semibold text-gray-900">{o.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{o.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-gray-900">More pathways, coming soon</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {UPCOMING.map((c) => (
            <div key={c.title} className="relative rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-full bg-gray-100 text-gray-400">
                  <GraduationCap className="size-4" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  <Lock className="size-3" /> Soon
                </span>
              </div>
              <p className="font-semibold text-gray-700">{c.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">{c.desc}</p>
              <p className="mt-3 text-xs font-medium text-[#0F7A3D]">{c.tag}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        DeepTalent never charges professionals to be placed. Course enrolment covers training and
        assessment only.
      </p>
    </div>
  );
}

function LessonView({ onBack }: { onBack: () => void }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="lesson"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#0F7A3D]"
        >
          <ArrowLeft className="size-4" /> Back to course
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          {/* Lesson body */}
          <article className="order-2 lg:order-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#0F7A3D] px-3 py-1 text-xs font-semibold text-white">
                Day {FIRST_LESSON.day} · Module {FIRST_LESSON.code}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <Clock className="size-3.5" /> {FIRST_LESSON.minutes} min
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 text-balance md:text-3xl">
              {FIRST_LESSON.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600 text-pretty">{FIRST_LESSON.intro}</p>

            {/* Who hires */}
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[#0F7A3D]">
                {FIRST_LESSON.whoHires.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {FIRST_LESSON.whoHires.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-gray-600">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0F7A3D]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What the screen tests */}
            <h3 className="mt-10 text-lg font-bold text-gray-900">What the screen actually tests</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FIRST_LESSON.screenTests.map((t) => (
                <div key={t.n} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <span className="font-mono text-sm font-bold text-[#0F7A3D]">{t.n}</span>
                  <p className="mt-1 font-semibold text-gray-900">{t.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{t.body}</p>
                </div>
              ))}
            </div>

            {/* Closing */}
            <div className="mt-8 rounded-2xl border-l-4 border-[#0F7A3D] bg-[#F4FBF6] p-5">
              <p className="text-sm leading-relaxed text-gray-700 text-pretty">{FIRST_LESSON.closing}</p>
            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div>
                <p className="font-semibold text-gray-900">Enjoyed lesson 1?</p>
                <p className="text-sm text-gray-500">Enrol to unlock all 13 modules and the live practical.</p>
              </div>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 rounded-full bg-[#0F7A3D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633]"
              >
                Enrol <ArrowRight className="size-4" />
              </button>
            </div>
          </article>

          {/* Running order sidebar */}
          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Day 1 · running order</p>
              <ul className="mt-3 space-y-1">
                {COURSE_DAYS[0].modules.map((m, i) => (
                  <li
                    key={m.code}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      i === 0 ? "bg-[#0F7A3D]/10 font-medium text-[#0F7A3D]" : "text-gray-500"
                    }`}
                  >
                    {i === 0 ? (
                      <PlayCircle className="size-4 shrink-0" />
                    ) : (
                      <Lock className="size-3.5 shrink-0 text-gray-300" />
                    )}
                    <span className="font-mono text-xs">{m.code}</span>
                    <span className="truncate">{m.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
