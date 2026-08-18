"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/**
 * Next.js App Router `template.tsx` re-mounts on every navigation, so the
 * animations below replay on each page transition (unlike `layout.tsx`).
 *
 * The effect mirrors the FluidCTA: a brand-blue "liquid" panel that covers
 * the screen and then sweeps upward — its bottom edge curving into a meniscus
 * as it retracts — to reveal the freshly loaded page, which fades up beneath.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  // The animated liquid overlay + fading content is animation-only chrome and
  // must NOT participate in hydration: motion applies inline styles/attributes
  // (opacity, transform, aria-hidden, class) that differ between the server
  // HTML and the client's first paint, which throws a hydration mismatch.
  //
  // Fix: on both the server and the client's first render we output the plain
  // children (no motion, no overlay), so the trees match exactly. Only after
  // mount do we flip `mounted` on and render the animated variant — a
  // client-only update that happens safely after hydration completes.
  const [mounted, setMounted] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(media.matches);
    const onChange = () => setReduce(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Server render + first client render: identical, un-animated markup.
  if (!mounted) {
    return <>{children}</>;
  }

  // Reduced-motion users still get a quick, gentle cross-fade rather than nothing.
  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }

  // Same fluid signature as the FluidCTA: a brand-blue liquid whose edge
  // curves into a meniscus (50% radius) then flattens (0%) as it moves.
  const liquidEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

  return (
    <>
      {/* Liquid reveal overlay — covers the screen, then drains downward and
          out the bottom, its TOP edge curving like the FluidCTA fill. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999]"
        style={{ height: "110vh", backgroundColor: "#3B5BDB" }}
        initial={{ y: "0%", borderTopLeftRadius: "0%", borderTopRightRadius: "0%" }}
        animate={{
          y: ["0%", "0%", "110%"],
          borderTopLeftRadius: ["0%", "0%", "45%", "50%"],
          borderTopRightRadius: ["0%", "0%", "45%", "50%"],
        }}
        transition={{
          duration: 0.95,
          ease: liquidEase,
          y: { duration: 0.95, times: [0, 0.25, 1] },
          borderTopLeftRadius: { duration: 0.95, times: [0, 0.25, 0.6, 1] },
          borderTopRightRadius: { duration: 0.95, times: [0, 0.25, 0.6, 1] },
        }}
      />
      {/* Trailing deeper-blue drip layer for added fluid depth */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9998]"
        style={{ height: "110vh", backgroundColor: "#2F49B0" }}
        initial={{ y: "0%", borderTopLeftRadius: "0%", borderTopRightRadius: "0%" }}
        animate={{
          y: ["0%", "0%", "110%"],
          borderTopLeftRadius: ["0%", "0%", "45%", "50%"],
          borderTopRightRadius: ["0%", "0%", "45%", "50%"],
        }}
        transition={{
          duration: 0.95,
          ease: liquidEase,
          delay: 0.1,
          y: { duration: 0.95, times: [0, 0.25, 1] },
          borderTopLeftRadius: { duration: 0.95, times: [0, 0.25, 0.6, 1] },
          borderTopRightRadius: { duration: 0.95, times: [0, 0.25, 0.6, 1] },
        }}
      />

      {/* New page content fades up beneath the draining liquid */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}
