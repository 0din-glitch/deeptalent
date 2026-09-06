"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GraduationCap, ShieldCheck, UserPlus, X } from "lucide-react";
import { FluidCTA } from "@/components/site/fluid-cta";

/** Small Nigerian flag mark — the "pictorial representation" for the tab. */
function NigeriaFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="1" height="2" x="0" fill="#008751" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#008751" />
    </svg>
  );
}

/**
 * A floating tab pinned to the right edge for Post-NYSC Corps Members. Collapsed it
 * shows a bold green vertical label with a Nigerian-flag mark and a gentle
 * attention pulse so it's easy to spot; on hover (desktop) or tap (touch) it
 * expands into a panel with the pathways — each a green fluid-morph CTA.
 */
export function NyscFloatingTab() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center"
    >
      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            role="dialog"
            aria-label="Post-NYSC Corps Members pathways"
            className="w-[320px] max-w-[calc(100vw-4.5rem)] rounded-l-3xl border border-r-0 border-gray-200 bg-white shadow-2xl shadow-black/10 p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <NigeriaFlag className="h-5 w-8 rounded-[2px] shrink-0" />
                <p className="text-base font-bold text-gray-900 leading-tight">Post-NYSC Corps Members</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 size-7 rounded-full grid place-items-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Work global. Stay in Nigeria.
            </p>

            <div className="flex flex-col gap-2.5">
              {/* 1. Get Global Workforce Ready — now uses the no-call-up-number form */}
              <FluidCTA
                href="/auth/nysc?track=training&noCallUp=1"
                color="green"
                variant="outline"
                size="md"
                className="w-full justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="size-4" />
                  Get Global Workforce Ready
                </span>
              </FluidCTA>

              {/* 2. Not in NYSC? Join here — same no-call-up-number form */}
              <FluidCTA
                href="/auth/nysc?track=training&noCallUp=1"
                color="green"
                variant="outline"
                size="sm"
                showArrow={false}
                className="w-full"
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="size-4" />
                  Not in NYSC? Join here
                </span>
              </FluidCTA>

              {/* 3. I'm Global Workforce Ready — unchanged form */}
              <FluidCTA
                href="/auth/nysc?track=ready"
                color="green"
                size="md"
                className="w-full justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  I&apos;m Global Workforce Ready
                </span>
              </FluidCTA>
            </div>

            <p className="mt-3 text-center text-[11px] text-gray-400 leading-tight">
              Same programme — no call-up number or state code needed to get ready.
            </p>

            <p className="mt-4 text-center text-xs text-gray-500">
              Already registered?{" "}
              <Link href="/auth/nysc/login" className="font-semibold text-[#0F7A3D] underline underline-offset-2">
                Log in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed tab — bold green so it's easy to find, with an attention pulse */}
      <div className="relative shrink-0">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-l-2xl bg-[#0F7A3D]"
          animate={{ opacity: [0.45, 0, 0.45], scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Post-NYSC Corps Members — Work global. Stay in Nigeria."
          className={`relative flex flex-col items-center gap-2.5 rounded-l-2xl bg-[#0F7A3D] shadow-xl shadow-[#0F7A3D]/30 px-3.5 py-6 text-white transition-colors hover:bg-[#0B5E2F] ${
            open ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <span className="grid place-items-center rounded-md bg-white/95 p-1">
            <NigeriaFlag className="h-4 w-6 rounded-[1px]" />
          </span>
          <span
            className="text-[13px] font-bold tracking-wide"
            style={{ writingMode: "vertical-rl" }}
          >
            Post-NYSC Corps Members
          </span>
          <span
            className="rounded-full bg-white/20 px-1.5 py-1.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ writingMode: "vertical-rl" }}
          >
            Start here
          </span>
        </button>
      </div>
    </div>
  );
}
