"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Thin reading-progress line fixed to the top of the viewport. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-primary to-accent"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
    />
  );
}
