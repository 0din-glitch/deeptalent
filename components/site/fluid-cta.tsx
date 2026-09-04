"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "outline";
type Color = "blue" | "green";

interface FluidCTAProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  size?: Size;
  variant?: Variant;
  color?: Color;
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
  color = "blue",
  className = "",
  showArrow = true,
  type = "button",
}: FluidCTAProps) {
  const [hovered, setHovered] = useState(false);

  const isPrimary = variant === "primary";
  const isGreen = color === "green";

  // Brand shades per color
  const baseColor = isGreen ? "#0F7A3D" : "#3B5BDB";
  const darkColor = isGreen ? "#0B5E2F" : "#2F49B0";
  const shadowRgb = isGreen ? "15,122,61" : "59,91,219";

  // Resting appearance (inline styles so dynamic brand colors are reliable)
  const restingStyle: React.CSSProperties = isPrimary
    ? {
        backgroundColor: baseColor,
        color: "#ffffff",
        boxShadow: `0 8px 24px rgba(${shadowRgb},0.25)`,
      }
    : {
        backgroundColor: "#ffffff",
        color: baseColor,
        border: `1px solid ${baseColor}66`,
      };

  // The rising liquid layer color (contrasting shade for depth)
  const liquidColor = isPrimary ? darkColor : baseColor;

  const inner = (
    <>
      {/* Rising liquid fill with a wobbling top edge */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
        style={{ backgroundColor: liquidColor }}
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
          hovered ? "text-white" : ""
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

  const classes = `group relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-full transition-shadow duration-300 ${PADS[size]} ${
    isPrimary ? "hover:shadow-lg" : "hover:shadow-md"
  } ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        style={restingStyle}
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
      style={restingStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={classes}
    >
      {inner}
    </button>
  );
}
