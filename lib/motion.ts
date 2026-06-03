import type { Variants } from "motion/react"

const defaultDuration = 0.5

export const staggerContainer = (staggerChildren = 0.15, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const slideIn = (
  direction: "up" | "down" | "left" | "right" = "up",
  delay = 0,
  duration = defaultDuration,
): Variants => ({
  hidden: {
    x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    opacity: 0,
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      delay,
      duration,
      stiffness: 100,
      damping: 20,
    },
  },
})

export const fadeInUp = (delay = 0, duration = defaultDuration): Variants => ({
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { delay, duration, ease: "easeOut" },
  },
})

export const fadeIn = (duration = defaultDuration): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration, ease: "easeIn" } },
})

export const scaleIn = (duration = defaultDuration): Variants => ({
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration, ease: "easeOut" },
  },
})

export const zoomIn = (duration = defaultDuration): Variants => ({
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration, ease: "easeIn" },
  },
})

export const viewport = { once: true, amount: 0.2 }
