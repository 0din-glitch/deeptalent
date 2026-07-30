"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Next.js App Router `template.tsx` re-mounts on every navigation, so the
 * animations below replay on each page transition (unlike `layout.tsx`).
 *
 * The effect mirrors the FluidCTA: a brand-blue "liquid" panel that covers
 * the screen and then sweeps upward — its bottom edge curving into a meniscus
 * as it retracts — to reveal the freshly loaded page, which fades up beneath.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Liquid reveal overlay — covers, then sweeps up and away */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999]"
        style={{ height: "110vh", backgroundColor: "#3B5BDB" }}
        initial={{ y: "0%", borderBottomLeftRadius: "0%", borderBottomRightRadius: "0%" }}
        animate={{
          y: "-110%",
          borderBottomLeftRadius: ["0%", "35%", "50%"],
          borderBottomRightRadius: ["0%", "35%", "50%"],
        }}
        transition={{
          duration: 0.7,
          ease: [0.76, 0, 0.24, 1],
          borderBottomLeftRadius: { duration: 0.7, times: [0, 0.5, 1] },
          borderBottomRightRadius: { duration: 0.7, times: [0, 0.5, 1] },
        }}
      />
      {/* A trailing deeper-blue drip layer for added fluid depth */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9998]"
        style={{ height: "110vh", backgroundColor: "#2F49B0" }}
        initial={{ y: "0%" }}
        animate={{ y: "-110%" }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
      />

      {/* New page content fades up beneath the retracting liquid */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.35 }}
      >
        {children}
      </motion.div>
    </>
  );
}
