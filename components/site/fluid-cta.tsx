"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "outline";

interface FluidCTAProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  size?: Size;
  variant?: Variant;
  className?: string;
  showArrow?: boolean;
  type?: "button" | "submit";
}

const PADS: Record<Size, string> = {
  sm: "h-9 px-5 text-sm",
  md: "h-12 px-8 text-sm",
  lg: "h-14 px-10 text-base",
};

/**
 * FluidCTA — a pill button whose brand-colored "liquid" fill rises and
 * settles on hover (fluid morph), inspired by the v0 Fluid CTA template,
 * restyled to the DeepTalent blue-on-white palette. Keeps navigation.
 */
export function FluidCTA({
  href,
  onClick,
  children,
  size = "md",
  variant = "primary",
  className = "",
  showArrow = true,
  type = "button",
}: FluidCTAProps) {
  const [hovered, setHovered] = useState(false);

  const isPrimary = variant === "primary";

  // Base (resting) colors
  const resting = isPrimary
    ? "bg-[#3B5BDB] text-white shadow-[0_8px_24px_rgba(59,91,219,0.25)]"
    : "bg-white border border-[#3B5BDB]/40 text-[#3B5BDB]";

  // The rising liquid layer color (contrasting shade for depth)
  const liquid = isPrimary ? "bg-[#2F49B0]" : "bg-[#3B5BDB]";

  // Text color once the liquid covers the button
  const hoverText = isPrimary ? "text-white" : "text-white";

  const inner = (
    <>
      {/* Rising liquid fill with a wobbling top edge */}
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-0 ${liquid}`}
        initial={false}
        animate={{
          height: hovered ? "100%" : "0%",
          borderTopLeftRadius: hovered ? "0%" : "50%",
          borderTopRightRadius: hovered ? "0%" : "50%",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.7 }}
      />
      <motion.span
        className={`relative z-10 inline-flex items-center gap-2 transition-colors duration-200 ${
          hovered ? hoverText : ""
        }`}
        animate={{ x: hovered && showArrow ? -2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
        {showArrow && (
          <motion.span
            animate={{ x: hovered ? 3 : 0, y: hovered ? -1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpRight className="size-4" />
          </motion.span>
        )}
      </motion.span>
    </>
  );

  const classes = `group relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-full transition-shadow duration-300 ${PADS[size]} ${resting} ${
    isPrimary ? "hover:shadow-[0_12px_32px_rgba(59,91,219,0.35)]" : "hover:shadow-md"
  } ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={classes}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={classes}
    >
      {inner}
    </button>
  );
}
