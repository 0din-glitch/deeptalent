"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, GraduationCap, ShieldCheck, X } from "lucide-react";

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
 * shows a vertical label with a small Nigerian-flag mark; on hover (desktop) or
 * tap (touch) it expands into a panel with the two matched pathways.
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
            className="w-[280px] max-w-[calc(100vw-4.5rem)] rounded-l-3xl border border-r-0 border-gray-200 bg-white shadow-2xl shadow-black/10 p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <NigeriaFlag className="h-4 w-6 rounded-[2px] shrink-0" />
                <p className="text-sm font-bold text-gray-900 leading-tight">Post-NYSC Corps Members</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 size-6 rounded-full grid place-items-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Work global. Stay in Nigeria.
            </p>

            <div className="space-y-2">
              <Link
                href="/auth/nysc?track=ready"
                className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-3 hover:border-[#3B5BDB]/40 hover:bg-[#3B5BDB]/[0.03] transition-colors"
              >
                <span className="shrink-0 size-9 rounded-xl bg-[#3B5BDB]/10 grid place-items-center">
                  <ShieldCheck className="size-4 text-[#3B5BDB]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-gray-900 leading-tight">
                    I&apos;m Global Workforce Ready
                  </span>
                  <span className="block text-[11px] text-gray-500 leading-tight mt-0.5">
                    Already ICAN, ACCA or tech-certified — verify &amp; apply
                  </span>
                </span>
                <ArrowRight className="size-3.5 text-gray-300 group-hover:text-[#3B5BDB] shrink-0 transition-colors" />
              </Link>

              <Link
                href="/auth/nysc?track=training"
                className="group flex items-center gap-3 rounded-2xl border border-gray-200 p-3 hover:border-[#3B5BDB]/40 hover:bg-[#3B5BDB]/[0.03] transition-colors"
              >
                <span className="shrink-0 size-9 rounded-xl bg-[#8690FD]/10 grid place-items-center">
                  <GraduationCap className="size-4 text-[#8690FD]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 leading-tight">
                    Get Global Workforce Ready
                    <span className="shrink-0 rounded-full bg-[#8690FD]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#8690FD]">
                      Post-NYSC
                    </span>
                  </span>
                  <span className="block text-[11px] text-gray-500 leading-tight mt-0.5">
                    Start the post-NYSC pathway to reach that standard
                  </span>
                </span>
                <ArrowRight className="size-3.5 text-gray-300 group-hover:text-[#3B5BDB] shrink-0 transition-colors" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed tab */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Post-NYSC Corps Members — Work global. Stay in Nigeria."
        className={`shrink-0 flex flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-gray-200 bg-white shadow-lg shadow-black/5 px-2.5 py-4 hover:bg-gray-50 transition-colors ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <NigeriaFlag className="h-4 w-6 rounded-[2px]" />
        <span
          className="text-[11px] font-semibold text-gray-800 tracking-wide"
          style={{ writingMode: "vertical-rl" }}
        >
          Post-NYSC Corps Members
        </span>
        <span
          className="rounded-full bg-[#8690FD]/15 px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#8690FD]"
          style={{ writingMode: "vertical-rl" }}
        >
          Post-NYSC
        </span>
      </button>
    </div>
  );
}
